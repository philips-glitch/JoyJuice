"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import { tierForLifetimePoints } from "@/lib/tiers";
import { getTierConfigMap } from "@/lib/tier-config.server";

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (user.role !== "ADMIN") {
    throw new Error("Hanya admin yang dapat melakukan aksi ini.");
  }
  return user;
}

/**
 * Approves an order's payment proof: moves it to PAID and credits the
 * points earned from it (points earning is deliberately deferred until this
 * point — see placeOrderAction). Guarded by `pointsCredited` so a double
 * click (or re-verifying an already-verified order) can never double-credit
 * points.
 */
export async function verifyOrderPaymentAction(orderId: string) {
  await requireAdmin();

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Pesanan tidak ditemukan.");
  if (order.status !== "PENDING_PAYMENT") {
    throw new Error("Pesanan ini sudah tidak menunggu verifikasi pembayaran.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: "PAID" } });

    if (!order.pointsCredited && order.pointsEarned > 0) {
      const user = await tx.user.findUnique({ where: { id: order.userId } });
      if (user) {
        const tierConfig = await getTierConfigMap();
        const balanceAfterEarn = user.points + order.pointsEarned;
        const newLifetimePoints = user.lifetimePoints + order.pointsEarned;
        const newTier = tierForLifetimePoints(newLifetimePoints, tierConfig);

        await tx.pointsTransaction.create({
          data: {
            userId: user.id,
            orderId: order.id,
            type: "EARN",
            amount: order.pointsEarned,
            balanceAfter: balanceAfterEarn,
            description: `Poin dari pesanan #${order.id.slice(-6).toUpperCase()} (pembayaran diverifikasi)`,
          },
        });
        await tx.user.update({
          where: { id: user.id },
          data: { points: balanceAfterEarn, lifetimePoints: newLifetimePoints, tier: newTier },
        });
      }
    }

    await tx.order.update({ where: { id: orderId }, data: { pointsCredited: true } });
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

/**
 * Rejects an order's payment proof (invalid/unclear transfer, etc.): moves
 * it to CANCELLED and refunds any points the customer redeemed on it, and
 * releases any voucher code they used so it can be reused. Points earned
 * were never credited in the first place (that only happens on verify), so
 * there's nothing to reverse there.
 */
export async function rejectOrderPaymentAction(orderId: string) {
  await requireAdmin();

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Pesanan tidak ditemukan.");
  if (order.status !== "PENDING_PAYMENT") {
    throw new Error("Pesanan ini sudah tidak menunggu verifikasi pembayaran.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });

    if (order.pointsRedeemed > 0) {
      const user = await tx.user.findUnique({ where: { id: order.userId } });
      if (user) {
        const balanceAfterRefund = user.points + order.pointsRedeemed;
        await tx.pointsTransaction.create({
          data: {
            userId: user.id,
            orderId: order.id,
            type: "ADJUST",
            amount: order.pointsRedeemed,
            balanceAfter: balanceAfterRefund,
            description: `Pengembalian poin — pesanan #${order.id.slice(-6).toUpperCase()} ditolak`,
          },
        });
        await tx.user.update({ where: { id: user.id }, data: { points: balanceAfterRefund } });
      }
    }

    await tx.voucherRedemption.deleteMany({ where: { orderId } });
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
