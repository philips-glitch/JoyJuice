"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (user.role !== "ADMIN") {
    throw new Error("Hanya admin yang dapat melakukan aksi ini.");
  }
  return user;
}

const daySchema = z.object({
  weekday: z.number().int().min(1).max(7),
  closed: z.boolean(),
  note: z.string().trim().max(120, "Catatan maksimal 120 karakter"),
  productIds: z.array(z.string().min(1)),
});

export type ScheduleDayFormState = { error?: string; savedAt?: number } | undefined;

export async function updateScheduleDayAction(
  weekday: number,
  _prevState: ScheduleDayFormState,
  formData: FormData,
): Promise<ScheduleDayFormState> {
  await requireAdmin();

  const parsed = daySchema.safeParse({
    weekday,
    closed: formData.get("closed") === "on",
    note: String(formData.get("note") ?? ""),
    productIds: formData.getAll("productIds").map(String),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { closed, note } = parsed.data;
  // A closed day keeps no products; otherwise drop ids that no longer exist
  // (e.g. a product deleted while this form was open).
  const productIds = closed
    ? []
    : (
        await prisma.product.findMany({
          where: { id: { in: parsed.data.productIds } },
          select: { id: true },
        })
      ).map((p) => p.id);

  await prisma.$transaction([
    prisma.scheduleDay.upsert({
      where: { weekday },
      update: { closed, note: note || null },
      create: { weekday, closed, note: note || null },
    }),
    prisma.scheduleEntry.deleteMany({ where: { weekday } }),
    prisma.scheduleEntry.createMany({
      data: productIds.map((productId) => ({ weekday, productId })),
    }),
  ]);

  revalidatePath("/admin/schedule");
  revalidatePath("/jadwal");
  revalidatePath("/menu");
  return { savedAt: Date.now() };
}
