"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { claimRedemptionAction } from "@/app/actions/admin/redemptions-actions";

type RedemptionRow = {
  id: string;
  rewardName: string;
  pointsSpent: number;
  status: "PENDING" | "CLAIMED";
  createdAt: string;
  claimedAt: string | null;
  customerName: string;
  customerUsername: string;
};

export function RedemptionsTable({ redemptions }: { redemptions: RedemptionRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function claim(id: string) {
    setPendingId(id);
    setError(null);
    startTransition(async () => {
      try {
        await claimRedemptionAction(id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengklaim penukaran.");
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
        <table className="w-full min-w-[720px] text-left font-body-sm text-body-sm">
          <thead className="border-b border-outline-variant/60 bg-surface-container-low text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 font-label-md text-label-md">Reward</th>
              <th className="px-4 py-3 font-label-md text-label-md">Pelanggan</th>
              <th className="px-4 py-3 font-label-md text-label-md">Poin</th>
              <th className="px-4 py-3 font-label-md text-label-md">Ditukar</th>
              <th className="px-4 py-3 font-label-md text-label-md">Status</th>
              <th className="px-4 py-3 font-label-md text-label-md">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {redemptions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-on-surface-variant">
                  Belum ada penukaran reward.
                </td>
              </tr>
            )}
            {redemptions.map((r) => (
              <tr key={r.id} className="hover:bg-surface-container-low">
                <td className="px-4 py-3 font-medium text-on-surface">{r.rewardName}</td>
                <td className="px-4 py-3 text-on-surface">
                  {r.customerName}
                  <span className="block text-on-surface-variant">@{r.customerUsername}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-on-surface">
                  {r.pointsSpent.toLocaleString("id-ID")} pts
                </td>
                <td className="px-4 py-3 text-on-surface-variant">
                  {new Date(r.createdAt).toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-label-sm text-label-sm ${
                      r.status === "CLAIMED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    <Icon
                      name={r.status === "CLAIMED" ? "check_circle" : "hourglass_top"}
                      filled
                      className="!text-sm"
                    />
                    {r.status === "CLAIMED" ? "Sudah Diklaim" : "Menunggu Klaim"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {r.status === "CLAIMED" ? (
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {r.claimedAt ? new Date(r.claimedAt).toLocaleDateString("id-ID") : "—"}
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={pendingId === r.id}
                      onClick={() => claim(r.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 font-label-sm text-label-sm text-on-primary shadow-sm transition-colors hover:bg-primary-container disabled:opacity-50"
                    >
                      <Icon name="check_circle" className="!text-sm" />
                      {pendingId === r.id ? "Memproses..." : "Klaim"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
