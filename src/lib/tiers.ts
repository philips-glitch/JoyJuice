import type { Tier } from "@prisma/client";

/**
 * Loyalty tier configuration.
 *
 * ASSUMPTION (not specified by the user): tiers are derived from a member's
 * *lifetime* points earned (never decreases on redemption), each tier grants
 * a point-earning multiplier and a flat checkout discount. These numbers are
 * a reasonable starting point for a proptech-adjacent side project and are
 * easy to retune later — see README "Business rules & assumptions".
 */
export const TIER_CONFIG: Record<
  Tier,
  {
    label: string;
    minLifetimePoints: number;
    multiplier: number;
    flatDiscount: number;
    color: string;
  }
> = {
  BRONZE: {
    label: "Bronze",
    minLifetimePoints: 0,
    multiplier: 1,
    flatDiscount: 0,
    color: "#a16207",
  },
  SILVER: {
    label: "Silver",
    minLifetimePoints: 150,
    multiplier: 1.25,
    flatDiscount: 5_000,
    color: "#6b7280",
  },
  GOLD: {
    label: "Gold",
    minLifetimePoints: 400,
    multiplier: 1.5,
    flatDiscount: 10_000,
    color: "#d97706",
  },
  PLATINUM: {
    label: "Platinum",
    minLifetimePoints: 800,
    multiplier: 2,
    flatDiscount: 20_000,
    color: "#7c3aed",
  },
};

const TIER_ORDER: Tier[] = ["BRONZE", "SILVER", "GOLD", "PLATINUM"];

export function tierForLifetimePoints(lifetimePoints: number): Tier {
  let current: Tier = "BRONZE";
  for (const tier of TIER_ORDER) {
    if (lifetimePoints >= TIER_CONFIG[tier].minLifetimePoints) {
      current = tier;
    }
  }
  return current;
}

export function nextTierInfo(tier: Tier) {
  const idx = TIER_ORDER.indexOf(tier);
  if (idx === TIER_ORDER.length - 1) return null;
  const next = TIER_ORDER[idx + 1];
  return { tier: next, ...TIER_CONFIG[next] };
}

export const POINTS_PER_RUPIAH_SPENT = 1 / 1000; // 1 point per Rp 1.000 net spend
export const RUPIAH_PER_POINT_REDEEMED = 100; // 1 point = Rp 100 off
export const REDEEM_BLOCK_SIZE = 100; // points must be redeemed in blocks of 100
