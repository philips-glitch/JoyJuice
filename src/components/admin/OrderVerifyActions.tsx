"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  verifyOrderPaymentAction,
  rejectOrderPaymentAction,
} from "@/app/actions/admin/orders-actions";
import { Icon } from "@/components/Icon";

export function OrderVerifyActions({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function verify() {
    setError(null);
    startTransition(async () => {
      try {
        await verifyOrderPaymentAction(orderId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memverifikasi pembayaran.");
      }
    });
  }

  function reject() {
    if (
      !confirm(
        "Tolak bukti pembayaran ini? Pesanan akan dibatalkan dan poin/voucher yang dipakai akan dikembalikan ke pelanggan.",
      )
    )
      return;
    setError(null);
    startTransition(async () => {
      try {
        await rejectOrderPaymentAction(orderId);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menolak pembayaran.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-body-sm text-body-sm text-red-700">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={pending}
          onClick={verify}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 font-label-lg text-label-lg text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-60"
        >
          <Icon name="check_circle" filled className="!text-base" />
          {pending ? "Memproses..." : "Verifikasi Pembayaran"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={reject}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-300 px-4 py-2.5 font-label-lg text-label-lg text-rose-700 transition-all hover:bg-rose-50 active:scale-95 disabled:opacity-60"
        >
          <Icon name="cancel" className="!text-base" />
          Tolak
        </button>
      </div>
    </div>
  );
}
