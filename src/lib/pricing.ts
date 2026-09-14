import type { Tier } from "@prisma/client";
import { RUPIAH_PER_POINT_REDEEMED, type TierConfigMap } from "./tiers";
import { parseSizes, parseToppings } from "./menu-options";

export type CartLineForPricing = {
  quantity: number;
  unitPrice: number;
};

/** Compute a single line's unit price from a product + chosen options. */
export function computeUnitPrice(params: {
  basePrice: number;
  sizesJson: string;
  toppingsJson: string;
  sizeId: string;
  toppingIds: string[];
}): number {
  const sizes = parseSizes(params.sizesJson);
  const toppings = parseToppings(params.toppingsJson);
  const sizeDelta = sizes.find((s) => s.id === params.sizeId)?.priceDelta ?? 0;
  const toppingDelta = params.toppingIds.reduce((sum, id) => {
    const t = toppings.find((x) => x.id === id);
    return sum + (t?.priceDelta ?? 0);
  }, 0);
  return params.basePrice + sizeDelta + toppingDelta;
}

export function cartSubtotal(lines: CartLineForPricing[]): number {
  return lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
}

/** Flat member discount granted at checkout based on tier. */
export function memberDiscountFor(tier: Tier, tierConfig: TierConfigMap): number {
  return tierConfig[tier].flatDiscount;
}

/** Rupiah discount from redeeming a whole number of points. */
export function pointsDiscountFor(pointsToRedeem: number): number {
  return pointsToRedeem * RUPIAH_PER_POINT_REDEEMED;
}

/**
 * Points earned = floor(netAmount / 1000) scaled by the member's tier
 * multiplier, floored again. netAmount = subtotal + shipping - memberDiscount
 * (points are not earned on the portion paid for with redeemed points).
 */
export function pointsEarnedFor(netAmount: number, multiplier: number): number {
  const base = Math.floor(Math.max(netAmount, 0) / 1000);
  return Math.floor(base * multiplier);
}

export function formatRupiah(amount: number): string {
  return "Rp" + Math.round(amount).toLocaleString("id-ID");
}

/**
 * Full order total breakdown, shared by the client-side live preview and the
 * server action that actually places the order (same pure function, two
 * call sites — keeps the numbers guaranteed to match). There's no shipping
 * fee — Joy & Juice is pickup-only, no delivery service.
 */
export function computeOrderTotals(params: {
  subtotal: number;
  tier: Tier;
  tierConfig: TierConfigMap;
  pointsToRedeem: number;
  voucherDiscount?: number;
}) {
  const memberDiscount = memberDiscountFor(params.tier, params.tierConfig);
  const pointsDiscount = pointsDiscountFor(params.pointsToRedeem);
  const voucherDiscount = params.voucherDiscount ?? 0;
  const total = Math.max(
    params.subtotal - memberDiscount - pointsDiscount - voucherDiscount,
    0,
  );

  // Points are earned on product spend net of member discount, voucher
  // discount, and any portion paid for with redeemed points.
  const earnableBase = Math.max(
    params.subtotal - memberDiscount - pointsDiscount - voucherDiscount,
    0,
  );
  const pointsEarned = pointsEarnedFor(earnableBase, params.tierConfig[params.tier].multiplier);

  return { memberDiscount, pointsDiscount, voucherDiscount, total, pointsEarned };
}
