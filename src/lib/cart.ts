import { prisma } from "@/lib/prisma";
import { cartSubtotal } from "@/lib/pricing";

export async function getCartItems(userId: string) {
  return prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getCartCount(userId: string): Promise<number> {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    select: { quantity: true },
  });
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export async function getCartSubtotal(userId: string): Promise<number> {
  const items = await getCartItems(userId);
  return cartSubtotal(items);
}
