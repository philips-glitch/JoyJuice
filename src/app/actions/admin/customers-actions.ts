"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import { getTierConfigMap } from "@/lib/tier-config.server";
import type { Tier } from "@prisma/client";

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (user.role !== "ADMIN") {
    throw new Error("Hanya admin yang dapat melakukan aksi ini.");
  }
  return user;
}

export type CustomerFormState =
  | { error?: string; fieldErrors?: Record<string, string> }
  | undefined;

const USERNAME_REGEX = /^[a-zA-Z0-9]+$/;

const createSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username minimal 3 karakter")
    .max(20, "Username maksimal 20 karakter")
    .regex(USERNAME_REGEX, "Hanya huruf dan angka"),
  email: z.string().trim().toLowerCase().email("Format email tidak valid").optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function createCustomerAction(
  _prevState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  await requireAdmin();

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors };
  }

  const { name, username, email, phone, password } = parsed.data;
  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, ...(email ? [{ email }] : [])] },
  });
  if (existing) {
    return {
      error:
        existing.username === username
          ? "Username ini sudah dipakai."
          : "Email ini sudah terdaftar.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name,
      username,
      email: email || null,
      phone: phone || null,
      passwordHash,
      role: "CUSTOMER",
      // Admin-created accounts are vouched for directly — no separate
      // verification step, unlike self-registration via /signup.
      verified: true,
    },
  });

  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

const updateSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  email: z.string().trim().toLowerCase().email("Format email tidak valid").optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  tier: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]),
  pointsAdjustment: z.coerce.number().int(),
  suspended: z.coerce.boolean(),
  verified: z.coerce.boolean(),
});

export async function updateCustomerAction(
  id: string,
  _prevState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  await requireAdmin();

  const parsed = updateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    tier: formData.get("tier"),
    pointsAdjustment: formData.get("pointsAdjustment") || 0,
    suspended: formData.get("suspended") === "on" || formData.get("suspended") === "true",
    verified: formData.get("verified") === "on" || formData.get("verified") === "true",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors };
  }

  const customer = await prisma.user.findUnique({ where: { id } });
  if (!customer || customer.role !== "CUSTOMER") {
    return { error: "Pelanggan tidak ditemukan." };
  }

  const { name, email, phone, tier, pointsAdjustment, suspended, verified } = parsed.data;

  if (email) {
    const emailTaken = await prisma.user.findUnique({ where: { email } });
    if (emailTaken && emailTaken.id !== id) {
      return { error: "Email ini sudah dipakai akun lain." };
    }
  }

  const newPoints = Math.max(0, customer.points + pointsAdjustment);
  // Manual tier override sets lifetimePoints to whatever floor that tier
  // requires (if higher than current), so the tier doesn't silently
  // re-derive itself back down on the next order.
  const tierConfig = await getTierConfigMap();
  const tierFloor = tierConfig[tier as Tier].minLifetimePoints;
  const newLifetimePoints = Math.max(customer.lifetimePoints, tierFloor);

  await prisma.$transaction(async (tx) => {
    if (pointsAdjustment !== 0) {
      await tx.pointsTransaction.create({
        data: {
          userId: id,
          type: "ADJUST",
          amount: pointsAdjustment,
          balanceAfter: newPoints,
          description: `Penyesuaian manual oleh admin (${pointsAdjustment > 0 ? "+" : ""}${pointsAdjustment})`,
        },
      });
    }
    await tx.user.update({
      where: { id },
      data: {
        name,
        email: email || null,
        phone: phone || null,
        tier: tier as Tier,
        points: newPoints,
        lifetimePoints: newLifetimePoints,
        suspended,
        verified,
      },
    });
  });

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
  redirect("/admin/customers");
}

export async function toggleCustomerSuspendedAction(id: string, suspended: boolean) {
  await requireAdmin();
  const customer = await prisma.user.findUnique({ where: { id } });
  if (!customer || customer.role !== "CUSTOMER") {
    throw new Error("Pelanggan tidak ditemukan.");
  }
  await prisma.user.update({ where: { id }, data: { suspended } });
  revalidatePath("/admin/customers");
}

export async function toggleCustomerVerifiedAction(id: string, verified: boolean) {
  await requireAdmin();
  const customer = await prisma.user.findUnique({ where: { id } });
  if (!customer || customer.role !== "CUSTOMER") {
    throw new Error("Pelanggan tidak ditemukan.");
  }
  await prisma.user.update({ where: { id }, data: { verified } });
  revalidatePath("/admin/customers");
}

export async function deleteCustomerAction(id: string) {
  await requireAdmin();

  const customer = await prisma.user.findUnique({ where: { id } });
  if (!customer || customer.role !== "CUSTOMER") {
    throw new Error("Pelanggan tidak ditemukan.");
  }

  const orderCount = await prisma.order.count({ where: { userId: id } });
  if (orderCount > 0) {
    throw new Error(
      `Pelanggan ini punya ${orderCount} riwayat pesanan — tidak bisa dihapus permanen (akan merusak riwayat pesanan). Nonaktifkan (suspend) saja.`,
    );
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/customers");
}
