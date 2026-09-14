"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import { getCartItems } from "@/lib/cart";
import {
  cartSubtotal,
  computeOrderTotals,
  shippingFeeFor,
} from "@/lib/pricing";
import { tierForLifetimePoints, REDEEM_BLOCK_SIZE } from "@/lib/tiers";
import { getTierConfigMap } from "@/lib/tier-config.server";
import { validateVoucher } from "@/lib/vouchers.server";

export type PlaceOrderInput = {
  deliveryMethod: "INSTANT_COURIER" | "PICKUP";
  deliveryOption: string; // "GOSEND_GRAB" | "FLEET" | "STORE"
  address?: string;
  whatsapp: string;
  driverNote?: string;
  paymentMethod: "QRIS" | "VIRTUAL_ACCOUNT" | "MANUAL_TRANSFER";
  redeemPoints: boolean;
  voucherCode?: string;
};

/** Validates a voucher code so the checkout UI can preview the discount before placing the order. */
export async function applyVoucherAction(code: string) {
  const user = await requireCurrentUser();
  const voucher = await validateVoucher(code, user.id);
  if (!voucher) {
    throw new Error("Kode voucher tidak valid atau sudah tidak berlaku.");
  }
  return { code: voucher.code, discountAmount: voucher.discountAmount };
}

export async function placeOrderAction(input: PlaceOrderInput) {
  const user = await requireCurrentUser();
  const items = await getCartItems(user.id);

  if (items.length === 0) {
    throw new Error("Keranjang kosong. Tambahkan menu terlebih dahulu.");
  }
  if (!input.whatsapp.trim()) {
    throw new Error("Nomor WhatsApp penerima wajib diisi.");
  }
  if (input.deliveryMethod === "INSTANT_COURIER" && !input.address?.trim()) {
    throw new Error("Alamat pengiriman wajib diisi untuk metode kurir instan.");
  }

  const subtotal = cartSubtotal(items);
  const shippingFee = shippingFeeFor(input.deliveryMethod, input.deliveryOption);
  const tierConfig = await getTierConfigMap();

  // Redemption is only ever a whole block of REDEEM_BLOCK_SIZE points, and
  // never more than the user's current balance — re-validated here so a
  // stale client can't redeem points it doesn't have.
  const pointsToRedeem =
    input.redeemPoints && user.points >= REDEEM_BLOCK_SIZE ? REDEEM_BLOCK_SIZE : 0;

  // Voucher is re-validated server-side too — never trust the client's
  // computed discount amount.
  const voucher = input.voucherCode?.trim()
    ? await validateVoucher(input.voucherCode.trim(), user.id)
    : null;
  if (input.voucherCode?.trim() && !voucher) {
    throw new Error("Kode voucher tidak valid atau sudah tidak berlaku.");
  }

  const { memberDiscount, pointsDiscount, voucherDiscount, total, pointsEarned } =
    computeOrderTotals({
      subtotal,
      shippingFee,
      tier: user.tier,
      tierConfig,
      pointsToRedeem,
      voucherDiscount: voucher?.discountAmount ?? 0,
    });

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId: user.id,
        status: "PAID",
        deliveryMethod: input.deliveryMethod,
        deliveryOption: input.deliveryOption,
        address: input.address?.trim() || null,
        whatsapp: input.whatsapp.trim(),
        driverNote: input.driverNote?.trim() || null,
        paymentMethod: input.paymentMethod,
        subtotal,
        shippingFee,
        memberDiscount,
        pointsRedeemed: pointsToRedeem,
        pointsDiscount,
        voucherCode: voucher?.code ?? null,
        voucherDiscount,
        total,
        pointsEarned,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            name: item.product.name,
            image: item.product.image,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            size: item.size,
            iceLevel: item.iceLevel,
            sweetness: item.sweetness,
            toppings: item.toppings,
          })),
        },
      },
    });

    const balanceAfterRedeem = user.points - pointsToRedeem;
    const balanceAfterEarn = balanceAfterRedeem + pointsEarned;
    const newLifetimePoints = user.lifetimePoints + pointsEarned;
    const newTier = tierForLifetimePoints(newLifetimePoints, tierConfig);

    const txLogs = [];
    if (pointsToRedeem > 0) {
      txLogs.push({
        userId: user.id,
        orderId: created.id,
        type: "REDEEM" as const,
        amount: -pointsToRedeem,
        balanceAfter: balanceAfterRedeem,
        description: `Ditukar untuk diskon ${pointsDiscount.toLocaleString("id-ID")} pada pesanan`,
      });
    }
    txLogs.push({
      userId: user.id,
      orderId: created.id,
      type: "EARN" as const,
      amount: pointsEarned,
      balanceAfter: balanceAfterEarn,
      description: `Poin dari pesanan #${created.id.slice(-6).toUpperCase()}`,
    });

    await tx.pointsTransaction.createMany({ data: txLogs });

    if (voucher) {
      await tx.voucherRedemption.create({
        data: { voucherId: voucher.id, userId: user.id, orderId: created.id },
      });
    }

    await tx.user.update({
      where: { id: user.id },
      data: {
        points: balanceAfterEarn,
        lifetimePoints: newLifetimePoints,
        tier: newTier,
      },
    });

    await tx.cartItem.deleteMany({ where: { userId: user.id } });

    return created;
  });

  revalidatePath("/checkout");
  revalidatePath("/loyalty");
  revalidatePath("/menu");
  return { orderId: order.id };
}
