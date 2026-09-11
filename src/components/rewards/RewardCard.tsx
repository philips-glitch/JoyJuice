"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { redeemRewardAction } from "@/app/actions/rewards-actions";

export function RewardCard({
  reward,
  userPoints,
}: {
  reward: { id: string; name: string; description: string; image: string; pointsCost: number; category: string };
  userPoints: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState(false);
  const canAfford = userPoints >= reward.pointsCost;

  return (
    <div className="jj-card flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-jj-bg text-2xl">
          {reward.image}
        </span>
        <div>
          <span className="rounded-full bg-jj-gold-bg px-2 py-0.5 text-[10px] font-semibold text-jj-gold">
            {reward.category}
          </span>
          <p className="mt-1 text-sm font-semibold text-jj-text">{reward.name}</p>
        </div>
      </div>
      <p className="text-xs text-jj-muted">{reward.description}</p>

      <div className="mt-auto flex items-center justify-between">
        <span className="text-sm font-bold text-jj-orange-dark">
          {reward.pointsCost.toLocaleString("id-ID")} pts
        </span>
        <button
          type="button"
          disabled={!canAfford || pending || redeemed}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              try {
                await redeemRewardAction(reward.id);
                setRedeemed(true);
                router.refresh();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Gagal menukar reward.");
              }
            })
          }
          className="jj-btn-primary rounded-full px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          {redeemed ? "✓ Ditukar" : pending ? "Memproses..." : canAfford ? "Tukar Poin" : "Poin Kurang"}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
