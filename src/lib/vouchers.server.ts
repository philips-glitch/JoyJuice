import { prisma } from "@/lib/prisma";
import type { Voucher } from "@prisma/client";

export type VoucherValidationResult =
  | { ok: true; voucher: Voucher }
  | { ok: false; message: string };

/**
 * Validates a voucher code for a given user + cart at checkout time.
 * `cartQuantity` is the total number of bottles in the cart (summed across
 * lines), needed for quantity-gated promos like "buy 15 get 1 free".
 *
 * Always re-run this server-side before applying a discount — never trust
 * a client-computed voucher amount or quantity.
 */
export async function validateVoucher(
  rawCode: string,
  userId: string,
  cartQuantity: number,
): Promise<VoucherValidationResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, message: "Masukkan kode voucher." };

  const voucher = await prisma.voucher.findUnique({ where: { code } });
  if (!voucher || !voucher.active) {
    return { ok: false, message: "Kode voucher tidak valid atau sudah tidak berlaku." };
  }
  if (voucher.expiresAt && voucher.expiresAt < new Date()) {
    return { ok: false, message: "Kode voucher ini sudah kedaluwarsa." };
  }
  if (voucher.minQuantity != null && cartQuantity < voucher.minQuantity) {
    return {
      ok: false,
      message: `Voucher ini berlaku untuk pembelian minimal ${voucher.minQuantity} botol (keranjang Anda: ${cartQuantity} botol).`,
    };
  }

  if (voucher.maxRedemptions != null) {
    const totalRedemptions = await prisma.voucherRedemption.count({
      where: { voucherId: voucher.id },
    });
    if (totalRedemptions >= voucher.maxRedemptions) {
      return { ok: false, message: "Voucher ini sudah mencapai batas maksimal penukaran." };
    }
  }

  if (voucher.perUserLimit != null) {
    const userRedemptions = await prisma.voucherRedemption.count({
      where: { voucherId: voucher.id, userId },
    });
    if (userRedemptions >= voucher.perUserLimit) {
      return { ok: false, message: "Anda sudah mencapai batas penukaran voucher ini." };
    }
  }

  return { ok: true, voucher };
}
