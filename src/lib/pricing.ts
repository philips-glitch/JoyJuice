import type { Tier } from "@prisma/client";
import { TIER_CONFIG, RUPIAH_PER_POINT_REDEEMED } from "./tiers";
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

export const DELIVERY_OPTIONS = {
  INSTANT_COURIER: {
    GOSEND_GRAB: { label: "GoSend / Grab Instant", fee: 15_000, eta: "Estimasi 45–60 Menit" },
    FLEET: { label: "Joy & Juice Express Fleet", fee: 12_000, eta: "Slot Jam 14:00–16:00" },
  },
  PICKUP: {
    STORE: { label: "Ambil di Gerai Terdekat", fee: 0, eta: "Siap diambil dalam 20 menit" },
  },
} as const;

export function shippingFeeFor(
  deliveryMethod: "INSTANT_COURIER" | "PICKUP",
  deliveryOption: string,
): number {
  if (deliveryMethod === "PICKUP") return 0;
  const options = DELIVERY_OPTIONS.INSTANT_COURIER as Record<string, { fee: number }>;
  return options[deliveryOption]?.fee ?? 0;
}

/** Flat member discount granted at checkout based on tier. */
export function memberDiscountFor(tier: Tier): number {
  return TIER_CONFIG[tier].flatDiscount;
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
 * call sites — keeps the numbers guaranteed to match).
 */
export function computeOrderTotals(params: {
  subtotal: number;
  shippingFee: number;
  tier: Tier;
  pointsToRedeem: number;
}) {
  const memberDiscount = memberDiscountFor(params.tier);
  const pointsDiscount = pointsDiscountFor(params.pointsToRedeem);
  const total = Math.max(params.subtotal + params.shippingFee - memberDiscount - pointsDiscount, 0);

  // Points are earned on product spend net of member discount and any
  // portion paid for with redeemed points (shipping is excluded).
  const earnableBase = Math.max(params.subtotal - memberDiscount - pointsDiscount, 0);
  const pointsEarned = pointsEarnedFor(earnableBase, TIER_CONFIG[params.tier].multiplier);

  return { memberDiscount, pointsDiscount, total, pointsEarned };
}
