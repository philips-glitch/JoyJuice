"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { redeemRewardAction } from "@/app/actions/rewards-actions";
import { Icon } from "@/components/Icon";

/**
 * A one-off "physical coupon" styling for the single active, points-based
 * free-bottle reward — everything else on /rewards still uses the plain
 * RewardCard. The torn-ticket look (dashed perforation + semicircle
 * notches) is built from two adjacent panels that each clip their own
 * half of a circle centered exactly on the shared corner; no JS math or
 * fixed offsets needed, so it holds up whether the panels stack (mobile)
 * or sit side by side (sm+).
 */
const CHECKLIST = [
  { icon: "eco", label: "100% Bahan Alami" },
  { icon: "favorite", label: "Kaya Vitamin" },
  { icon: "sentiment_satisfied", label: "Segar di Setiap Tegukan" },
  { icon: "local_drink", label: "Kemasan 250 ml" },
];

const BOTTLES = [
  { src: "/products/mangga.jpg", alt: "Mangga" },
  { src: "/products/jambu-merah.jpg", alt: "Jambu Merah" },
  { src: "/products/nanas-strawberry.jpg", alt: "Nanas + Strawberry" },
];

function Notch({ className }: { className: string }) {
  return <span aria-hidden="true" className={`absolute h-7 w-7 rounded-full bg-background ${className}`} />;
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
    <div className="flex flex-col overflow-visible rounded-2xl shadow-lg sm:flex-row">
      {/* MAIN PANEL */}
      <div className="relative flex-1 overflow-hidden rounded-t-2xl border-b-2 border-dashed border-amber-900/20 bg-gradient-to-br from-amber-100 via-amber-50 to-rose-50 p-4 sm:rounded-t-none sm:rounded-l-2xl sm:border-b-0 sm:p-6">
        {/* mobile notches (horizontal perforation at the bottom edge) */}
        <Notch className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2 sm:hidden" />
        <Notch className="bottom-0 right-0 translate-x-1/2 translate-y-1/2 sm:hidden" />
        {/* desktop notches (vertical perforation at the right edge) */}
        <Notch className="right-0 top-0 hidden -translate-y-1/2 translate-x-1/2 sm:block" />
        <Notch className="bottom-0 right-0 hidden translate-x-1/2 translate-y-1/2 sm:block" />

        <span className="pointer-events-none absolute -left-2 -top-2 text-4xl opacity-20 sm:text-5xl" aria-hidden="true">
          🌿
        </span>
        <span className="pointer-events-none absolute -bottom-3 -left-3 rotate-45 text-4xl opacity-15 sm:text-5xl" aria-hidden="true">
          🌿
        </span>

        <div className="relative flex items-start justify-between gap-3">
          <Image src="/logo.png" alt="Joy & Juice" width={120} height={120} className="h-9 w-auto sm:h-11" />
          <div className="flex items-center gap-1 text-right font-body-sm text-[11px] font-semibold text-emerald-800 sm:text-body-sm">
            <span>
              Fresh
              <br className="sm:hidden" /> Natural Healthy
            </span>
            <Icon name="favorite" filled className="!text-sm text-emerald-700" />
          </div>
        </div>

        <div className="relative mt-3">
          <span className="-rotate-2 inline-block rounded-md bg-emerald-700 px-3 py-1 font-headline-sm text-lg font-black uppercase tracking-wide text-white shadow-sm sm:text-2xl">
            Voucher
          </span>
          <br />
          <span className="-rotate-1 mt-1 inline-block rounded-lg bg-rose-500 px-3 py-1 font-headline-lg text-3xl font-black uppercase tracking-wide text-white shadow-sm sm:text-5xl">
            Gratis
          </span>
          <p className="mt-2 font-label-lg text-sm font-extrabold uppercase tracking-wide text-emerald-800 sm:text-lg">
            1 Botol All Variant 250 ml
          </p>
        </div>

        <div className="relative mt-4 flex items-end justify-end gap-2">
          {BOTTLES.map((bottle) => (
            <div
              key={bottle.src}
              className="relative h-20 w-8 flex-shrink-0 overflow-hidden rounded-md border-2 border-white shadow-md sm:h-28 sm:w-11"
            >
              <Image src={bottle.src} alt={bottle.alt} fill sizes="60px" className="object-cover" />
            </div>
          ))}
        </div>

        <div className="relative mt-4 grid grid-cols-2 gap-x-2 gap-y-2 border-t border-amber-900/15 pt-3 sm:grid-cols-4 sm:gap-3">
          {CHECKLIST.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/70 text-emerald-700">
                <Icon name={item.icon} className="!text-sm" />
              </span>
              <span className="font-label-sm text-[10px] leading-tight text-emerald-900 sm:text-label-sm">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STUB */}
      <div className="relative flex flex-col items-center gap-3 rounded-b-2xl bg-gradient-to-b from-emerald-800 to-emerald-900 p-4 text-center sm:w-56 sm:flex-shrink-0 sm:items-start sm:rounded-b-none sm:rounded-r-2xl sm:border-l-2 sm:border-dashed sm:border-white/25 sm:p-5 sm:text-left">
        {/* mobile notches (top edge, matching the main panel's bottom notches) */}
        <Notch className="left-0 top-0 -translate-x-1/2 -translate-y-1/2 sm:hidden" />
        <Notch className="right-0 top-0 translate-x-1/2 -translate-y-1/2 sm:hidden" />
        {/* desktop notches (left edge, matching the main panel's right notches) */}
        <Notch className="left-0 top-0 hidden -translate-x-1/2 -translate-y-1/2 sm:block" />
        <Notch className="bottom-0 left-0 hidden -translate-x-1/2 translate-y-1/2 sm:block" />

        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-label-sm text-label-sm font-bold text-amber-200">
          <Icon name="card_giftcard" className="!text-sm" />
          Special For You
        </div>
        <p className="font-body-sm text-body-sm leading-snug text-amber-50">
          Nikmati kesegaran Jus favoritmu sekarang!
        </p>

        <div className="mt-auto flex w-full flex-col items-center gap-2 border-t border-white/20 pt-3 sm:items-start">
          <span className="font-headline-sm text-headline-sm font-bold text-amber-200">
            {reward.pointsCost.toLocaleString("id-ID")} pts
          </span>
          <button
            type="button"
            disabled={!canAfford || pending || redeemed}
            onClick={redeem}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 font-label-lg text-label-lg font-bold text-emerald-800 shadow-sm transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {redeemed ? (
              <>
                <Icon name="check_circle" filled className="!text-base" /> Ditukar
              </>
            ) : pending ? (
              "Memproses..."
            ) : canAfford ? (
              "Tukar Poin"
            ) : (
              "Poin Kurang"
            )}
          </button>
          {error && <p className="font-body-sm text-body-sm text-rose-200">{error}</p>}
        </div>
      </div>
    </div>
  );
}
