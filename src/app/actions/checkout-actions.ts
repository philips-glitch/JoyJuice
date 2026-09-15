"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import { getCartItems } from "@/lib/cart";
import { cartSubtotal, computeOrderTotals } from "@/lib/pricing";
import { REDEEM_BLOCK_SIZE } from "@/lib/tiers";
import { getTierConfigMap } from "@/lib/tier-config.server";
import { validateVoucher } from "@/lib/vouchers.server";

export type PlaceOrderFormState = { error?: string } | undefined;

const MAX_PROOF_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Validates a voucher code so the checkout UI can preview the discount before placing the order. */
export async function applyVoucherAction(code: string) {
  const user = await requireCurrentUser();
  const items = await getCartItems(user.id);
  const cartQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const result = await validateVoucher(code, user.id, cartQuantity);
  if (!result.ok) {
    throw new Error(result.message);
  }
  return { code: result.voucher.code, discountAmount: result.voucher.discountAmount };
}

/**
 * Places the order (no delivery — pickup only, since Joy & Juice doesn't run
 * its own courier service) and requires a payment proof upload. The order
 * starts as PENDING_PAYMENT: redeemed points are deducted immediately (they
 * were the customer's to spend either way), but points EARNED from this
 * order are only credited once an admin verifies the payment proof — see
 * verifyOrderPaymentAction in admin/orders-actions.ts.
 */
export async function placeOrderAction(
  _prevState: PlaceOrderFormState,
  formData: FormData,
): Promise<PlaceOrderFormState> {
  const user = await requireCurrentUser();
  const items = await getCartItems(user.id);

  if (items.length === 0) {
    return { error: "Keranjang kosong. Tambahkan menu terlebih dahulu." };
  }

  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "");
  const redeemPoints =
    formData.get("redeemPoints") === "on" || formData.get("redeemPoints") === "true";
  const voucherCodeInput = String(formData.get("voucherCode") ?? "").trim();
  const proofFile = formData.get("paymentProof");

  if (!whatsapp) {
    return { error: "Nomor WhatsApp wajib diisi." };
  }
  if (!["QRIS", "VIRTUAL_ACCOUNT", "MANUAL_TRANSFER"].includes(paymentMethod)) {
    return { error: "Metode pembayaran tidak valid." };
  }
  if (!(proofFile instanceof File) || proofFile.size === 0) {
    return { error: "Bukti pembayaran wajib diupload." };
  }
  if (!ALLOWED_PROOF_TYPES.includes(proofFile.type)) {
    return { error: "Bukti pembayaran harus berupa gambar (JPG, PNG, atau WEBP)." };
  }
  if (proofFile.size > MAX_PROOF_SIZE) {
    return { error: "Ukuran file bukti pembayaran maksimal 5MB." };
  }

  const subtotal = cartSubtotal(items);
  const tierConfig = await getTierConfigMap();

  // Redemption is only ever a whole block of REDEEM_BLOCK_SIZE points, and
  // never more than the user's current balance — re-validated here so a
  // stale client can't redeem points it doesn't have.
  const pointsToRedeem =
    redeemPoints && user.points >= REDEEM_BLOCK_SIZE ? REDEEM_BLOCK_SIZE : 0;

  // Voucher is re-validated server-side too — never trust the client's
  // computed discount amount or the quantity check.
  const cartQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  let voucher = null;
  if (voucherCodeInput) {
    const result = await validateVoucher(voucherCodeInput, user.id, cartQuantity);
    if (!result.ok) {
      return { error: result.message };
    }
    voucher = result.voucher;
  }

  const { memberDiscount, pointsDiscount, voucherDiscount, total, pointsEarned } =
    computeOrderTotals({
      subtotal,
      tier: user.tier,
      tierConfig,
      pointsToRedeem,
      voucherDiscount: voucher?.discountAmount ?? 0,
    });

  // Upload the proof to Blob storage before touching the database — if this
  // fails, nothing has been created yet that would need rolling back.
  let proofUrl: string;
  try {
    const ext = proofFile.name.split(".").pop() || "jpg";
    const blob = await put(`payment-proofs/${user.id}-${Date.now()}.${ext}`, proofFile, {
      access: "public",
    });
    proofUrl = blob.url;
  } catch {
    return { error: "Gagal mengupload bukti pembayaran. Silakan coba lagi." };
  }

  let orderId: string;
  try {
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: user.id,
          status: "PENDING_PAYMENT",
          deliveryMethod: "PICKUP",
          deliveryOption: "STORE",
          shippingFee: 0,
          address: null,
          whatsapp,
          driverNote: note || null,
          paymentMethod: paymentMethod as "QRIS" | "VIRTUAL_ACCOUNT" | "MANUAL_TRANSFER",
          subtotal,
          memberDiscount,
          pointsRedeemed: pointsToRedeem,
          pointsDiscount,
          voucherCode: voucher?.code ?? null,
          voucherDiscount,
          total,
          pointsEarned,
          paymentProofUrl: proofUrl,
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

      if (pointsToRedeem > 0) {
        const balanceAfterRedeem = user.points - pointsToRedeem;
        await tx.pointsTransaction.create({
          data: {
            userId: user.id,
            orderId: created.id,
            type: "REDEEM",
            amount: -pointsToRedeem,
            balanceAfter: balanceAfterRedeem,
            description: `Ditukar untuk diskon ${pointsDiscount.toLocaleString("id-ID")} pada pesanan`,
          },
        });
        await tx.user.update({ where: { id: user.id }, data: { points: balanceAfterRedeem } });
      }

      if (voucher) {
        await tx.voucherRedemption.create({
          data: { voucherId: voucher.id, userId: user.id, orderId: created.id },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId: user.id } });

      return created;
    });
    orderId = order.id;
  } catch {
    return { error: "Gagal memproses pesanan. Silakan coba lagi." };
  }

  revalidatePath("/checkout");
  revalidatePath("/loyalty");
  revalidatePath("/menu");
  redirect(`/orders/${orderId}`);
}
