"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { redeemRewardAction } from "@/app/actions/rewards-actions";
import { Icon } from "@/components/Icon";

/**
 * A one-off "physical coupon" styling for the single active, points-based
 * free-bottle reward — everything else on /rewards still uses the plain
 * RewardCard. This renders the actual supplied ticket artwork
 * (public/rewards/voucher-gratis.png, native ratio 3:2) instead of a
 * CSS recreation, with the points cost overlaid in the stub's open
 * space. The artwork itself has no interactive area, so the redeem
 * button/states live in a slim action bar below it.
 */
export function TicketRewardCard({
  reward,
  userPoints,
}: {
  reward: { id: string; pointsCost: number };
  userPoints: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState(false);
  const canAfford = userPoints >= reward.pointsCost;

  function redeem() {
    startTransition(async () => {
      setError(null);
      try {
        await redeemRewardAction(reward.id);
        setRedeemed(true);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menukar reward.");
      }
    });
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl shadow-lg">
      <div className="relative aspect-[3/2] w-full">
        <Image
          src="/rewards/voucher-gratis.png"
          alt="Voucher Gratis 1 Botol All Variant 250ml"
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover"
          priority
        />
        <span className="absolute right-[6%] top-[35%] -rotate-3 rounded-full bg-white px-3 py-1.5 font-headline-sm text-lg font-black text-emerald-800 shadow-md sm:text-2xl">
          {reward.pointsCost.toLocaleString("id-ID")} Poin
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 bg-emerald-900 px-3 py-2.5">
        {error ? (
          <p className="font-body-sm text-xs text-rose-200">{error}</p>
        ) : (
          <span className="font-label-md text-label-md font-semibold text-amber-100">
            Tukar dengan poin Anda
          </span>
        )}
        <button
          type="button"
          disabled={!canAfford || pending || redeemed}
          onClick={redeem}
          className="flex flex-shrink-0 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 font-label-md text-label-md font-bold text-emerald-800 shadow-sm transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {redeemed ? (
            <>
              <Icon name="check_circle" filled className="!text-sm" /> Ditukar
            </>
          ) : pending ? (
            "Memproses..."
          ) : canAfford ? (
            "Tukar Poin"
          ) : (
            "Poin Kurang"
          )}
        </button>
      </div>
    </div>
  );
}
