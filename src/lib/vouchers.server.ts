import { prisma } from "@/lib/prisma";

/**
 * Validates a voucher code for a given user at checkout time. Returns the
 * voucher (with its fixed Rp discount amount) if it's usable right now, or
 * null if the code doesn't exist, is inactive, expired, exhausted globally
 * (maxRedemptions), or already used by this user up to their perUserLimit.
 *
 * Always re-run this server-side before applying a discount — never trust
 * a client-computed voucher amount.
 */
export async function validateVoucher(rawCode: string, userId: string) {
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;

  const voucher = await prisma.voucher.findUnique({ where: { code } });
  if (!voucher || !voucher.active) return null;
  if (voucher.expiresAt && voucher.expiresAt < new Date()) return null;

  if (voucher.maxRedemptions != null) {
    const totalRedemptions = await prisma.voucherRedemption.count({
      where: { voucherId: voucher.id },
    });
    if (totalRedemptions >= voucher.maxRedemptions) return null;
  }

  if (voucher.perUserLimit != null) {
    const userRedemptions = await prisma.voucherRedemption.count({
      where: { voucherId: voucher.id, userId },
    });
    if (userRedemptions >= voucher.perUserLimit) return null;
  }

  return voucher;
}
