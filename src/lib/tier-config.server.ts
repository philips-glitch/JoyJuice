import { prisma } from "@/lib/prisma";
import { DEFAULT_TIER_CONFIG, TIER_ORDER, type TierConfigMap } from "@/lib/tiers";

/**
 * Reads the admin-editable loyalty tier configuration from the database.
 * Falls back to the hardcoded defaults for any tier missing a row (e.g. a
 * fresh, unseeded database) so the app never breaks on an empty table.
 */
export async function getTierConfigMap(): Promise<TierConfigMap> {
  const rows = await prisma.tierConfig.findMany();
  const map = { ...DEFAULT_TIER_CONFIG } as TierConfigMap;
  for (const row of rows) {
    map[row.tier] = {
      label: row.label,
      minLifetimePoints: row.minLifetimePoints,
      multiplier: row.multiplier,
      flatDiscount: row.flatDiscount,
      color: row.color,
    };
  }
  return map;
}

export async function getTierConfigList() {
  const map = await getTierConfigMap();
  return TIER_ORDER.map((tier) => ({ tier, ...map[tier] }));
}
