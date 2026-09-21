import type { Tier } from "@prisma/client";
import { formatRupiah } from "@/lib/pricing";
import { MIN_SUBTOTAL_FOR_MEMBER_DISCOUNT, TIER_ORDER, type TierConfigMap } from "@/lib/tiers";
import { Icon } from "@/components/Icon";

/**
 * Each tier owns an equal quarter of the track, so the fill and the benefit
 * columns below share one scale — previously the fill showed progress within
 * the current tier while the labels spanned the whole ladder, which put a
 * half-way Bronze member's fill under the Gold label.
 */
function fillPercent(tier: Tier, lifetimePoints: number, config: TierConfigMap): number {
  const index = TIER_ORDER.indexOf(tier);
  const next = TIER_ORDER[index + 1];

  let within = 1;
  if (next) {
    const floor = config[tier].minLifetimePoints;
    const range = config[next].minLifetimePoints - floor;
    // Thresholds aren't validated against each other in admin, so a zero or
    // inverted range is reachable — treat it as "next tier already met".
    within = range > 0 ? Math.min(1, Math.max(0, (lifetimePoints - floor) / range)) : 1;
  }

  return ((index + within) / TIER_ORDER.length) * 100;
}

export function TierLadder({
  tier,
  lifetimePoints,
  tierConfig,
}: {
  tier: Tier;
  lifetimePoints: number;
  tierConfig: TierConfigMap;
}) {
  const currentIndex = TIER_ORDER.indexOf(tier);
  const nextTier = TIER_ORDER[currentIndex + 1];
  const progress = fillPercent(tier, lifetimePoints, tierConfig);
  const pointsToNext = nextTier
    ? Math.max(0, tierConfig[nextTier].minLifetimePoints - lifetimePoints)
    : 0;

  return (
    <div className="jj-card flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
        <span className="font-semibold text-jj-text">Progres Tier</span>
        <span className="text-jj-muted">
          {nextTier
            ? `${pointsToNext.toLocaleString("id-ID")} pts lagi menuju ${tierConfig[nextTier].label}`
            : "Tier tertinggi tercapai 🎉"}
        </span>
      </div>

      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-jj-bg">
        <div className="jj-btn-primary h-full rounded-full" style={{ width: `${progress}%` }} />
        {/* Boundary ticks so the track reads as four tier segments. */}
        {TIER_ORDER.slice(1).map((t, i) => (
          <span
            key={t}
            aria-hidden="true"
            className="absolute top-0 h-full w-px bg-white/70"
            style={{ left: `${((i + 1) / TIER_ORDER.length) * 100}%` }}
          />
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {TIER_ORDER.map((t, i) => {
          const config = tierConfig[t];
          const isCurrent = i === currentIndex;
          const isEarned = i < currentIndex;
          return (
            <div
              key={t}
              className={`flex flex-col gap-0.5 rounded-lg border p-2 ${
                isCurrent
                  ? "border-transparent bg-jj-bg"
                  : "border-jj-border bg-transparent"
              } ${!isCurrent && !isEarned ? "opacity-60" : ""}`}
              style={isCurrent ? { boxShadow: `inset 0 0 0 1.5px ${config.color}` } : undefined}
            >
              <span
                className="flex items-center gap-1 text-[11px] font-bold leading-tight"
                style={{ color: config.color }}
              >
                {isEarned && <Icon name="check_circle" filled className="!text-[11px]" />}
                {config.label}
              </span>
              <span className="text-[10px] leading-tight text-jj-muted">
                {config.minLifetimePoints.toLocaleString("id-ID")} pts
              </span>
              <span className="text-[11px] font-semibold leading-tight text-jj-text">
                {config.multiplier}x poin
              </span>
              <span className="text-[10px] leading-tight text-jj-muted">
                {config.flatDiscount > 0 ? `${formatRupiah(config.flatDiscount)} off` : "—"}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-jj-muted">
        Multiplier menentukan poin yang Anda dapat per belanja. Potongan tier berlaku otomatis di
        checkout mulai belanja {formatRupiah(MIN_SUBTOTAL_FOR_MEMBER_DISCOUNT)}.
      </p>
    </div>
  );
}
