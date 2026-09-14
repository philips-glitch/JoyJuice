"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { formatRupiah } from "@/lib/pricing";
import {
  toggleVoucherActiveAction,
  deleteVoucherAction,
} from "@/app/actions/admin/loyalty-actions";

type VoucherRow = {
  id: string;
  code: string;
  discountAmount: number;
  active: boolean;
  maxRedemptions: number | null;
  perUserLimit: number | null;
  expiresAt: string | null;
  redemptionCount: number;
};

export function VouchersTable({ vouchers }: { vouchers: VoucherRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function toggleActive(id: string, next: boolean) {
    setPendingId(id);
    setError(null);
    startTransition(async () => {
      try {
        await toggleVoucherActiveAction(id, next);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengubah status.");
      } finally {
        setPendingId(null);
      }
    });
  }

  function remove(id: string, code: string) {
    if (!confirm(`Hapus permanen voucher "${code}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setPendingId(id);
    setError(null);
    startTransition(async () => {
      try {
        await deleteVoucherAction(id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menghapus voucher.");
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-body-sm text-body-sm text-red-700">
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-outline-variant/70 bg-surface-container-lowest shadow-sm">
        <table className="w-full min-w-[760px] text-left font-body-sm text-body-sm">
          <thead className="border-b border-outline-variant/60 bg-surface-container-low text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 font-label-md text-label-md">Kode</th>
              <th className="px-4 py-3 font-label-md text-label-md">Diskon</th>
              <th className="px-4 py-3 font-label-md text-label-md">Limit</th>
              <th className="px-4 py-3 font-label-md text-label-md">Kedaluwarsa</th>
              <th className="px-4 py-3 font-label-md text-label-md">Terpakai</th>
              <th className="px-4 py-3 font-label-md text-label-md">Status</th>
              <th className="px-4 py-3 font-label-md text-label-md">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {vouchers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-on-surface-variant">
                  Belum ada voucher.
                </td>
              </tr>
            )}
            {vouchers.map((v) => (
              <tr key={v.id} className="hover:bg-surface-container-low">
                <td className="px-4 py-3 font-mono font-semibold text-on-surface">{v.code}</td>
                <td className="px-4 py-3 font-semibold text-on-surface">
                  {formatRupiah(v.discountAmount)}
                </td>
                <td className="px-4 py-3 text-on-surface-variant">
                  {v.maxRedemptions ? `${v.maxRedemptions}x total` : "Tanpa batas"}
                  {v.perUserLimit ? ` · ${v.perUserLimit}x/user` : ""}
                </td>
                <td className="px-4 py-3 text-on-surface-variant">
                  {v.expiresAt
                    ? new Date(v.expiresAt).toLocaleDateString("id-ID")
                    : "Tidak ada"}
                </td>
                <td className="px-4 py-3 text-on-surface-variant">{v.redemptionCount}x</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={pendingId === v.id}
                    onClick={() => toggleActive(v.id, !v.active)}
                    className={`rounded-full px-2.5 py-1 font-label-sm text-label-sm transition-colors disabled:opacity-50 ${
                      v.active
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-surface-container text-on-surface-variant hover:bg-outline-variant/40"
                    }`}
                    title="Klik untuk mengubah status"
                  >
                    {v.active ? "Aktif" : "Nonaktif"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/loyalty/vouchers/${v.id}/edit`}
                      className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                      aria-label="Edit"
                    >
                      <Icon name="edit" className="!text-lg" />
                    </Link>
                    <button
                      type="button"
                      disabled={pendingId === v.id}
                      onClick={() => remove(v.id, v.code)}
                      className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-secondary disabled:opacity-50"
                      aria-label="Hapus"
                    >
                      <Icon name="delete" className="!text-lg" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
