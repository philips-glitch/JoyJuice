"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { redeemRewardAction } from "@/app/actions/rewards-actions";
import { Icon } from "@/components/Icon";

type TicketReward = { id: string; name: string; description: string; pointsCost: number };

/**
 * Physical-coupon styling for the single points-based free-bottle reward —
 * everything else on /rewards uses the plain RewardCard. The whole card is
 * the trigger for the detail popup, so redeeming happens inside the popup.
 */
export function TicketRewardCard({
  reward,
  userPoints,
}: {
  reward: TicketReward;
  userPoints: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState(false);
  const [open, setOpen] = useState(false);
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
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="flex w-full flex-col overflow-hidden rounded-2xl text-left shadow-lg transition-shadow hover:shadow-xl"
      >
        <div className="relative aspect-[3/2] w-full">
          <Image
            src="/rewards/voucher-gratis.png"
            alt="Voucher Gratis 1 Botol All Variant 250ml"
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover"
            priority
          />
        </div>

        <div className="flex w-full items-center justify-between gap-2 bg-emerald-900 px-3 py-2.5">
          <span className="font-headline-sm text-headline-sm font-bold text-amber-200">
            {reward.pointsCost.toLocaleString("id-ID")} Poin
          </span>
          <span className="flex flex-shrink-0 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 font-label-md text-label-md font-bold text-emerald-800 shadow-sm">
            {redeemed ? (
              <>
                <Icon name="check_circle" filled className="!text-sm" /> Ditukar
              </>
            ) : canAfford ? (
              "Tukar Poin"
            ) : (
              "Poin Kurang"
            )}
          </span>
        </div>
      </button>

      {open && (
        <VoucherDetailModal
          reward={reward}
          canAfford={canAfford}
          pending={pending}
          redeemed={redeemed}
          error={error}
          onRedeem={redeem}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function VoucherDetailModal({
  reward,
  canAfford,
  pending,
  redeemed,
  error,
  onRedeem,
  onClose,
}: {
  reward: TicketReward;
  canAfford: boolean;
  pending: boolean;
  redeemed: boolean;
  error: string | null;
  onRedeem: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={reward.name}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto rounded-2xl bg-surface-container-lowest shadow-xl"
      >
        <div className="relative aspect-[3/2] w-full flex-shrink-0">
          <Image
            src="/rewards/voucher-gratis.png"
            alt="Voucher Gratis 1 Botol All Variant 250ml"
            fill
            sizes="(max-width: 640px) 100vw, 28rem"
            className="object-cover"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail voucher"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65"
          >
            <Icon name="close" className="!text-lg" />
          </button>
        </div>

        <div className="flex flex-col gap-2 px-5 py-4">
          <h2 className="font-title-md text-title-md font-bold text-on-surface">{reward.name}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">{reward.description}</p>
          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 font-body-sm text-body-sm text-rose-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-outline-variant/60 bg-emerald-900 px-5 py-3.5">
          <span className="font-headline-sm text-headline-sm font-bold text-amber-200">
            {reward.pointsCost.toLocaleString("id-ID")} Poin
          </span>
          <button
            type="button"
            disabled={!canAfford || pending || redeemed}
            onClick={onRedeem}
            className="flex flex-shrink-0 items-center justify-center gap-1.5 rounded-full bg-white px-5 py-2.5 font-label-md text-label-md font-bold text-emerald-800 shadow-sm transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
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
    </div>
  );
}
