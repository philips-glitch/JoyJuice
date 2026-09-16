"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { redeemRewardAction } from "@/app/actions/rewards-actions";
import { Icon } from "@/components/Icon";

/**
 * A one-off "physical coupon" styling for the single active, points-based
 * free-bottle reward — everything else on /rewards still uses the plain
 * RewardCard. Locked to a 16:9 box (like the reference ticket photo) via
 * `aspect-[16/9]` rather than letting content dictate height, so it stays
 * proportional whatever width the grid gives it — main panel and stub
 * sit side by side always (no responsive layout switch needed) since the
 * ratio itself keeps the box wide-and-short at any column width.
 *
 * The dashed perforation and semicircle notches are pure CSS: each panel
 * clips its own half of a circle centered exactly on the shared corner,
 * so the torn-edge illusion holds without any JS layout math.
 */
const CHECKLIST = [
  { icon: "eco", label: "100% Alami" },
  { icon: "favorite", label: "Vitamin" },
  { icon: "sentiment_satisfied", label: "Segar" },
  { icon: "local_drink", label: "250 ml" },
];

const BOTTLES = [
  { src: "/products/mangga.jpg", alt: "Mangga" },
  { src: "/products/jambu-merah.jpg", alt: "Jambu Merah" },
  { src: "/products/nanas-strawberry.jpg", alt: "Nanas + Strawberry" },
];

function Notch({ className }: { className: string }) {
  return <span aria-hidden="true" className={`absolute h-4 w-4 rounded-full bg-background ${className}`} />;
}

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
    <div className="flex aspect-[16/9] overflow-hidden rounded-2xl shadow-lg">
      {/* MAIN PANEL */}
      <div className="relative flex w-[64%] flex-col justify-between overflow-hidden rounded-l-2xl border-r-2 border-dashed border-amber-900/20 bg-gradient-to-br from-amber-100 via-amber-50 to-rose-50 p-2">
        <Notch className="right-0 top-0 -translate-y-1/2 translate-x-1/2" />
        <Notch className="bottom-0 right-0 translate-x-1/2 translate-y-1/2" />

        <span className="pointer-events-none absolute -left-1 -top-1 text-2xl opacity-20" aria-hidden="true">
          🌿
        </span>

        <div className="relative flex items-center justify-between gap-1">
          <Image src="/logo.png" alt="Joy & Juice" width={120} height={120} className="h-5 w-auto" />
          <Icon name="favorite" filled className="!text-xs text-emerald-700" />
        </div>

        <div className="relative flex items-center gap-1">
          <span className="-rotate-2 inline-block rounded bg-emerald-700 px-1.5 py-0.5 font-headline-sm text-[10px] font-black uppercase tracking-wide text-white shadow-sm">
            Voucher
          </span>
          <span className="-rotate-1 inline-block rounded-md bg-rose-500 px-2 py-0.5 font-headline-sm text-sm font-black uppercase tracking-wide text-white shadow-sm">
            Gratis
          </span>
        </div>
        <p className="relative -mt-1 font-label-sm text-[9px] font-extrabold uppercase leading-tight tracking-wide text-emerald-800">
          1 Botol All Variant 250 ml
        </p>

        <div className="relative flex items-end justify-between gap-1">
          <div className="flex gap-1">
            {CHECKLIST.map((item) => (
              <span
                key={item.label}
                title={item.label}
                className="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full bg-white/70 text-emerald-700"
              >
                <Icon name={item.icon} className="!text-[9px]" />
              </span>
            ))}
          </div>
          <div className="flex gap-1">
            {BOTTLES.map((bottle) => (
              <div
                key={bottle.src}
                className="relative h-9 w-3.5 flex-shrink-0 overflow-hidden rounded border border-white shadow-sm"
              >
                <Image src={bottle.src} alt={bottle.alt} fill sizes="20px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STUB */}
      <div className="relative flex w-[36%] flex-shrink-0 flex-col items-center justify-between gap-0.5 rounded-r-2xl bg-gradient-to-b from-emerald-800 to-emerald-900 p-1.5 text-center">
        <Notch className="left-0 top-0 -translate-x-1/2 -translate-y-1/2" />
        <Notch className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />

        <div className="inline-flex items-center gap-1 rounded-full bg-white/15 px-1.5 py-0.5 font-label-sm text-[8px] font-bold leading-none text-amber-200">
          <Icon name="card_giftcard" className="!text-[10px]" />
          <span className="hidden sm:inline">Special For You</span>
          <span className="sm:hidden">Special</span>
        </div>

        <span className="font-headline-sm text-sm font-bold leading-none text-amber-200">
          {reward.pointsCost.toLocaleString("id-ID")} pts
        </span>

        <button
          type="button"
          disabled={!canAfford || pending || redeemed}
          onClick={redeem}
          className="flex w-full items-center justify-center gap-1 rounded-full bg-white px-1.5 py-1 font-label-sm text-[10px] font-bold leading-none text-emerald-800 shadow-sm transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {redeemed ? (
            <>
              <Icon name="check_circle" filled className="!text-xs" /> Ditukar
            </>
          ) : pending ? (
            "..."
          ) : canAfford ? (
            "Tukar Poin"
          ) : (
            "Poin Kurang"
          )}
        </button>
        {error && <p className="font-body-sm text-[8px] leading-tight text-rose-200">{error}</p>}
      </div>
    </div>
  );
}
