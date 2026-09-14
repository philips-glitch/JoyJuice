"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

const optionSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1),
  priceDelta: z.coerce.number().int().min(0),
});

const productSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Slug minimal 2 karakter")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung"),
  category: z.string().trim().min(2, "Kategori wajib diisi"),
  description: z.string().trim().min(2, "Deskripsi wajib diisi"),
  ingredients: z.string().trim().min(2, "Bahan wajib diisi"),
  image: z.string().trim().min(1, "Gambar wajib diisi (path atau URL)"),
  basePrice: z.coerce.number().int().min(0, "Harga tidak boleh negatif"),
  calories: z.coerce.number().int().min(0),
  volumeMl: z.coerce.number().int().min(1),
  rating: z.coerce.number().min(0).max(5),
  tag: z.string().trim().max(30).optional().or(z.literal("")),
  pointsBadge: z.coerce.number().int().min(0),
  active: z.coerce.boolean(),
  sizes: z.array(optionSchema).min(1, "Minimal 1 pilihan ukuran"),
  toppings: z.array(optionSchema),
});

export type ProductFormState =
  | { error?: string; fieldErrors?: Record<string, string> }
  | undefined;

function parseOptionsField(raw: FormDataEntryValue | null): unknown[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function extractInput(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    category: formData.get("category"),
    description: formData.get("description"),
    ingredients: formData.get("ingredients"),
    image: formData.get("image"),
    basePrice: formData.get("basePrice"),
    calories: formData.get("calories"),
    volumeMl: formData.get("volumeMl"),
    rating: formData.get("rating"),
    tag: formData.get("tag"),
    pointsBadge: formData.get("pointsBadge"),
    active: formData.get("active") === "on" || formData.get("active") === "true",
    sizes: parseOptionsField(formData.get("sizes")),
    toppings: parseOptionsField(formData.get("toppings")),
  };
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse(extractInput(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  const existing = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return { error: "Slug ini sudah dipakai produk lain. Gunakan slug yang berbeda." };
  }

  const { sizes, toppings, tag, ...rest } = parsed.data;
  await prisma.product.create({
    data: {
      ...rest,
      tag: tag || null,
      sizes: JSON.stringify(sizes),
      toppings: JSON.stringify(toppings),
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/menu");
  redirect("/admin/products");
}

export async function updateProductAction(
  id: string,
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse(extractInput(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  const existing = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
  if (existing && existing.id !== id) {
    return { error: "Slug ini sudah dipakai produk lain. Gunakan slug yang berbeda." };
  }

  const { sizes, toppings, tag, ...rest } = parsed.data;
  await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      tag: tag || null,
      sizes: JSON.stringify(sizes),
      toppings: JSON.stringify(toppings),
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/menu");
  redirect("/admin/products");
}

export async function toggleProductActiveAction(id: string, active: boolean) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { active } });
  revalidatePath("/admin/products");
  revalidatePath("/menu");
}

export async function deleteProductAction(id: string) {
  await requireAdmin();

  const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
  if (orderItemCount > 0) {
    throw new Error(
      `Produk ini muncul di ${orderItemCount} pesanan — tidak bisa dihapus permanen (akan merusak riwayat pesanan). Nonaktifkan saja.`,
    );
  }

  await prisma.cartItem.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });

  revalidatePath("/admin/products");
  revalidatePath("/menu");
}
