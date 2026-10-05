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

const nameSchema = z
  .string()
  .trim()
  .min(2, "Nama kategori minimal 2 karakter")
  .max(40, "Nama kategori maksimal 40 karakter");

export type CategoryFormState = { error?: string; ok?: boolean } | undefined;

// Names are unique case-insensitively so "seasonal menu" can't sit next to
// "Seasonal Menu" as two separate tabs.
async function findNameClash(name: string, exceptId?: string) {
  return prisma.category.findFirst({
    where: { name: { equals: name, mode: "insensitive" }, NOT: exceptId ? { id: exceptId } : undefined },
  });
}

function revalidateCategoryPages() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/menu");
}

export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await requireAdmin();

  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  if (await findNameClash(parsed.data)) {
    return { error: `Kategori "${parsed.data}" sudah ada.` };
  }

  // New categories go to the end of the tab row; reorder from the table.
  const last = await prisma.category.aggregate({ _max: { sortOrder: true } });
  await prisma.category.create({
    data: { name: parsed.data, sortOrder: (last._max.sortOrder ?? -1) + 1 },
  });

  revalidateCategoryPages();
  return { ok: true };
}

export async function renameCategoryAction(id: string, name: string) {
  await requireAdmin();

  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  if (await findNameClash(parsed.data, id)) {
    throw new Error(`Kategori "${parsed.data}" sudah ada.`);
  }

  await prisma.category.update({ where: { id }, data: { name: parsed.data } });
  revalidateCategoryPages();
}

export async function toggleCategoryActiveAction(id: string, active: boolean) {
  await requireAdmin();
  await prisma.category.update({ where: { id }, data: { active } });
  revalidateCategoryPages();
}

export async function moveCategoryAction(id: string, direction: "up" | "down") {
  await requireAdmin();

  const all = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  const from = all.findIndex((c) => c.id === id);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from === -1 || to < 0 || to >= all.length) return;

  [all[from], all[to]] = [all[to], all[from]];

  // Rewrite every position rather than swapping two values, so any
  // duplicate sortOrders left by earlier edits get normalised too.
  await prisma.$transaction(
    all.map((c, index) =>
      prisma.category.update({ where: { id: c.id }, data: { sortOrder: index } }),
    ),
  );
  revalidateCategoryPages();
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw new Error(
      `Kategori ini masih dipakai ${productCount} produk (termasuk yang nonaktif). Pindahkan produknya ke kategori lain dulu, atau sembunyikan kategorinya saja.`,
    );
  }

  await prisma.category.delete({ where: { id } });
  revalidateCategoryPages();
}
