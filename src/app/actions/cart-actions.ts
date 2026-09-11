"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import { computeUnitPrice } from "@/lib/pricing";

export type AddToCartInput = {
  productId: string;
  quantity: number;
  sizeId: string;
  iceLevel: string;
  sweetness: string;
  toppingIds: string[];
  note?: string;
};

export async function addToCartAction(input: AddToCartInput) {
  const user = await requireCurrentUser();

  const product = await prisma.product.findUnique({ where: { id: input.productId } });
  if (!product || !product.active) {
    throw new Error("Produk tidak ditemukan.");
  }

  const unitPrice = computeUnitPrice({
    basePrice: product.basePrice,
    sizesJson: product.sizes,
    toppingsJson: product.toppings,
    sizeId: input.sizeId,
    toppingIds: input.toppingIds,
  });

  await prisma.cartItem.create({
    data: {
      userId: user.id,
      productId: product.id,
      quantity: Math.max(1, Math.min(20, input.quantity)),
      size: input.sizeId,
      iceLevel: input.iceLevel,
      sweetness: input.sweetness,
      toppings: JSON.stringify(input.toppingIds),
      note: input.note?.trim() || null,
      unitPrice,
    },
  });

  revalidatePath("/menu");
  revalidatePath("/checkout");
  return { ok: true };
}

export async function updateCartItemQuantityAction(cartItemId: string, quantity: number) {
  const user = await requireCurrentUser();
  const item = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
  if (!item || item.userId !== user.id) throw new Error("Item keranjang tidak ditemukan.");

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
  } else {
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: Math.min(20, quantity) },
    });
  }

  revalidatePath("/checkout");
}

export async function removeCartItemAction(cartItemId: string) {
  const user = await requireCurrentUser();
  const item = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
  if (!item || item.userId !== user.id) throw new Error("Item keranjang tidak ditemukan.");

  await prisma.cartItem.delete({ where: { id: cartItemId } });
  revalidatePath("/checkout");
}
