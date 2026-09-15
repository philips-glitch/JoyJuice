"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { redeemRewardAction } from "@/app/actions/rewards-actions";
import { Icon } from "@/components/Icon";

/**
 * A one-off "physical coupon" styling for the single active, points-based
 * free-bottle reward — everything else on /rewards still uses the plain
 * RewardCard. Sized to sit as one card in the same 3-column reward grid
 * as everything else (not full-bleed width), so the layout is always
 * stacked (main panel on top, tear-off stub below) regardless of
 * viewport — a grid cell stays "mobile-narrow" even on a wide screen,
 * so there's no side-by-side variant to keep proportional here.
 *
 * The dashed perforation and semicircle notches are pure CSS: each panel
 * clips its own half of a circle centered exactly on the shared corner,
 * so the torn-edge illusion holds without any JS layout math.
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
  return <span aria-hidden="true" className={`absolute h-5 w-5 rounded-full bg-background ${className}`} />;
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
    <div className="flex flex-col overflow-visible rounded-2xl shadow-lg">
      {/* MAIN PANEL */}
      <div className="relative overflow-hidden rounded-t-2xl border-b-2 border-dashed border-amber-900/20 bg-gradient-to-br from-amber-100 via-amber-50 to-rose-50 p-4">
        <Notch className="bottom-0 left-0 -translate-x-1/2 translate-y-1/2" />
        <Notch className="bottom-0 right-0 translate-x-1/2 translate-y-1/2" />

        <span className="pointer-events-none absolute -left-1.5 -top-1.5 text-3xl opacity-20" aria-hidden="true">
          🌿
        </span>

        <div className="relative flex items-start justify-between gap-2">
          <Image src="/logo.png" alt="Joy & Juice" width={120} height={120} className="h-8 w-auto" />
          <div className="flex items-center gap-1 text-right font-body-sm text-[10px] font-semibold leading-tight text-emerald-800">
            <span>Fresh Natural Healthy</span>
            <Icon name="favorite" filled className="!text-xs text-emerald-700" />
          </div>
        </div>

        <div className="relative mt-2.5">
          <span className="-rotate-2 inline-block rounded-md bg-emerald-700 px-2.5 py-0.5 font-headline-sm text-sm font-black uppercase tracking-wide text-white shadow-sm">
            Voucher
          </span>
          <br />
          <span className="-rotate-1 mt-1 inline-block rounded-lg bg-rose-500 px-3 py-1 font-headline-lg text-2xl font-black uppercase tracking-wide text-white shadow-sm">
            Gratis
          </span>
          <p className="mt-1.5 font-label-md text-xs font-extrabold uppercase tracking-wide text-emerald-800">
            1 Botol All Variant 250 ml
          </p>
        </div>

        <div className="relative mt-3 flex items-end justify-end gap-1.5">
          {BOTTLES.map((bottle) => (
            <div
              key={bottle.src}
              className="relative h-16 w-6 flex-shrink-0 overflow-hidden rounded-md border-2 border-white shadow-md"
            >
              <Image src={bottle.src} alt={bottle.alt} fill sizes="40px" className="object-cover" />
            </div>
          ))}
        </div>

        <div className="relative mt-3 grid grid-cols-2 gap-x-2 gap-y-2 border-t border-amber-900/15 pt-3">
          {CHECKLIST.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/70 text-emerald-700">
                <Icon name={item.icon} className="!text-xs" />
              </span>
              <span className="font-label-sm text-[9px] leading-tight text-emerald-900">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STUB */}
      <div className="relative flex flex-col items-center gap-2.5 rounded-b-2xl bg-gradient-to-b from-emerald-800 to-emerald-900 p-4 text-center">
        <Notch className="left-0 top-0 -translate-x-1/2 -translate-y-1/2" />
        <Notch className="right-0 top-0 translate-x-1/2 -translate-y-1/2" />

        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 font-label-sm text-label-sm font-bold text-amber-200">
          <Icon name="card_giftcard" className="!text-sm" />
          Special For You
        </div>
        <p className="font-body-sm text-xs leading-snug text-amber-50">
          Nikmati kesegaran Jus favoritmu sekarang!
        </p>

        <div className="mt-auto flex w-full flex-col items-center gap-2 border-t border-white/20 pt-3">
          <span className="font-headline-sm text-headline-sm font-bold text-amber-200">
            {reward.pointsCost.toLocaleString("id-ID")} pts
          </span>
          <button
            type="button"
            disabled={!canAfford || pending || redeemed}
            onClick={redeem}
            className="flex w-full items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 font-label-md text-label-md font-bold text-emerald-800 shadow-sm transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
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
          {error && <p className="font-body-sm text-xs text-rose-200">{error}</p>}
        </div>
      </div>
    </div>
  );
}
