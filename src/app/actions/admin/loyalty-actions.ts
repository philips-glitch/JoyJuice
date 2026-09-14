"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import { TIER_ORDER } from "@/lib/tiers";
import type { Tier } from "@prisma/client";

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (user.role !== "ADMIN") {
    throw new Error("Hanya admin yang dapat melakukan aksi ini.");
  }
  return user;
}

export type LoyaltyFormState =
  | { error?: string; fieldErrors?: Record<string, string> }
  | undefined;

const tierRowSchema = z.object({
  label: z.string().trim().min(1, "Wajib diisi"),
  minLifetimePoints: z.coerce.number().int().min(0, "Tidak boleh negatif"),
  multiplier: z.coerce.number().min(0.1, "Minimal 0.1"),
  flatDiscount: z.coerce.number().int().min(0, "Tidak boleh negatif"),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Format warna harus #rrggbb"),
});

/**
 * Updates all four tier rows in one submit. Thresholds aren't hard-validated
 * against each other here (an admin could, in principle, set Silver's
 * threshold above Gold's) — this is a deliberate simplification for a small
 * admin-only tool rather than a full ordering-constraint form; tierForLifetimePoints
 * still resolves *some* tier for every lifetime point value regardless.
 */
export async function updateTierConfigAction(
  _prevState: LoyaltyFormState,
  formData: FormData,
): Promise<LoyaltyFormState> {
  await requireAdmin();

  const fieldErrors: Record<string, string> = {};
  const rows: Array<{ tier: Tier } & z.infer<typeof tierRowSchema>> = [];

  for (const tier of TIER_ORDER) {
    const parsed = tierRowSchema.safeParse({
      label: formData.get(`${tier}_label`),
      minLifetimePoints: formData.get(`${tier}_minLifetimePoints`),
      multiplier: formData.get(`${tier}_multiplier`),
      flatDiscount: formData.get(`${tier}_flatDiscount`),
      color: formData.get(`${tier}_color`),
    });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        fieldErrors[`${tier}_${String(issue.path[0])}`] = issue.message;
      }
      continue;
    }
    rows.push({ tier, ...parsed.data });
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  await prisma.$transaction(
    rows.map((row) =>
      prisma.tierConfig.upsert({
        where: { tier: row.tier },
        update: {
          label: row.label,
          minLifetimePoints: row.minLifetimePoints,
          multiplier: row.multiplier,
          flatDiscount: row.flatDiscount,
          color: row.color,
        },
        create: row,
      }),
    ),
  );

  revalidatePath("/admin/loyalty");
  revalidatePath("/menu");
  revalidatePath("/loyalty");
  revalidatePath("/checkout");
  revalidatePath("/admin/customers");
  revalidatePath("/admin");
  return { error: undefined };
}

const voucherSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, "Kode minimal 3 karakter")
    .max(30, "Kode maksimal 30 karakter")
    .regex(/^[A-Z0-9_-]+$/, "Hanya huruf, angka, - dan _"),
  discountAmount: z.coerce.number().int().min(1, "Harus lebih dari 0"),
  maxRedemptions: z.coerce.number().int().min(1).optional().or(z.literal("")),
  perUserLimit: z.coerce.number().int().min(1).optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
});

function parseOptionalInt(value: FormDataEntryValue | null): number | undefined {
  if (value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export async function createVoucherAction(
  _prevState: LoyaltyFormState,
  formData: FormData,
): Promise<LoyaltyFormState> {
  await requireAdmin();

  const parsed = voucherSchema.safeParse({
    code: formData.get("code"),
    discountAmount: formData.get("discountAmount"),
    maxRedemptions: formData.get("maxRedemptions") || "",
    perUserLimit: formData.get("perUserLimit") || "",
    expiresAt: formData.get("expiresAt") || "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors };
  }

  const existing = await prisma.voucher.findUnique({ where: { code: parsed.data.code } });
  if (existing) {
    return { error: "Kode voucher ini sudah dipakai." };
  }

  await prisma.voucher.create({
    data: {
      code: parsed.data.code,
      discountAmount: parsed.data.discountAmount,
      maxRedemptions: parseOptionalInt(formData.get("maxRedemptions")),
      perUserLimit: parseOptionalInt(formData.get("perUserLimit")),
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
    },
  });

  revalidatePath("/admin/loyalty");
  redirect("/admin/loyalty");
}

export async function updateVoucherAction(
  id: string,
  _prevState: LoyaltyFormState,
  formData: FormData,
): Promise<LoyaltyFormState> {
  await requireAdmin();

  const parsed = voucherSchema.safeParse({
    code: formData.get("code"),
    discountAmount: formData.get("discountAmount"),
    maxRedemptions: formData.get("maxRedemptions") || "",
    perUserLimit: formData.get("perUserLimit") || "",
    expiresAt: formData.get("expiresAt") || "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors };
  }

  const voucher = await prisma.voucher.findUnique({ where: { id } });
  if (!voucher) return { error: "Voucher tidak ditemukan." };

  if (parsed.data.code !== voucher.code) {
    const codeTaken = await prisma.voucher.findUnique({ where: { code: parsed.data.code } });
    if (codeTaken) return { error: "Kode voucher ini sudah dipakai voucher lain." };
  }

  await prisma.voucher.update({
    where: { id },
    data: {
      code: parsed.data.code,
      discountAmount: parsed.data.discountAmount,
      maxRedemptions: parseOptionalInt(formData.get("maxRedemptions")),
      perUserLimit: parseOptionalInt(formData.get("perUserLimit")),
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      active: formData.get("active") === "on" || formData.get("active") === "true",
    },
  });

  revalidatePath("/admin/loyalty");
  redirect("/admin/loyalty");
}

export async function toggleVoucherActiveAction(id: string, active: boolean) {
  await requireAdmin();
  const voucher = await prisma.voucher.findUnique({ where: { id } });
  if (!voucher) throw new Error("Voucher tidak ditemukan.");
  await prisma.voucher.update({ where: { id }, data: { active } });
  revalidatePath("/admin/loyalty");
}

export async function deleteVoucherAction(id: string) {
  await requireAdmin();
  const voucher = await prisma.voucher.findUnique({ where: { id } });
  if (!voucher) throw new Error("Voucher tidak ditemukan.");

  const redemptionCount = await prisma.voucherRedemption.count({ where: { voucherId: id } });
  if (redemptionCount > 0) {
    throw new Error(
      `Voucher ini sudah dipakai ${redemptionCount} kali — tidak bisa dihapus permanen (akan merusak riwayat pesanan). Nonaktifkan saja.`,
    );
  }

  await prisma.voucher.delete({ where: { id } });
  revalidatePath("/admin/loyalty");
}
