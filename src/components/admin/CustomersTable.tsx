"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { TierConfigMap } from "@/lib/tiers";
import {
  toggleCustomerSuspendedAction,
  toggleCustomerVerifiedAction,
  deleteCustomerAction,
} from "@/app/actions/admin/customers-actions";
import type { Tier } from "@prisma/client";

type CustomerRow = {
  id: string;
  name: string;
  username: string;
  email: string | null;
  phone: string | null;
  tier: Tier;
  points: number;
  suspended: boolean;
  verified: boolean;
  createdAt: string;
};

export function CustomersTable({
  customers,
  tierConfig,
}: {
  customers: CustomerRow[];
  tierConfig: TierConfigMap;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function toggleSuspended(id: string, next: boolean) {
    setPendingId(id);
    setError(null);
    startTransition(async () => {
      try {
        await toggleCustomerSuspendedAction(id, next);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengubah status.");
      } finally {
        setPendingId(null);
      }
    });
  }

  function toggleVerified(id: string, next: boolean) {
    setPendingId(id);
    setError(null);
    startTransition(async () => {
      try {
        await toggleCustomerVerifiedAction(id, next);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengubah status verifikasi.");
      } finally {
        setPendingId(null);
      }
    });
  }

  function remove(id: string, name: string) {
    if (!confirm(`Hapus permanen "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setPendingId(id);
    setError(null);
    startTransition(async () => {
      try {
        await deleteCustomerAction(id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menghapus pelanggan.");
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
              <th className="px-4 py-3 font-label-md text-label-md">Pelanggan</th>
              <th className="px-4 py-3 font-label-md text-label-md">Kontak</th>
              <th className="px-4 py-3 font-label-md text-label-md">Tier</th>
              <th className="px-4 py-3 font-label-md text-label-md">Poin</th>
              <th className="px-4 py-3 font-label-md text-label-md">Verifikasi</th>
              <th className="px-4 py-3 font-label-md text-label-md">Status</th>
              <th className="px-4 py-3 font-label-md text-label-md">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {customers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-on-surface-variant">
                  Belum ada pelanggan.
                </td>
              </tr>
            )}
            {customers.map((c) => (
              <tr
                key={c.id}
                className={`hover:bg-surface-container-low ${!c.verified ? "bg-amber-50/60" : ""}`}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-on-surface">{c.name}</p>
                  <p className="text-on-surface-variant">@{c.username}</p>
                </td>
                <td className="px-4 py-3 text-on-surface-variant">
                  {c.email && <p>{c.email}</p>}
                  {c.phone && <p>{c.phone}</p>}
                  {!c.email && !c.phone && "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="font-label-sm text-label-sm font-bold"
                    style={{ color: tierConfig[c.tier].color }}
                  >
                    {tierConfig[c.tier].label}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-on-surface">
                  {c.points.toLocaleString("id-ID")}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={pendingId === c.id}
                    onClick={() => toggleVerified(c.id, !c.verified)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-label-sm text-label-sm transition-colors disabled:opacity-50 ${
                      c.verified
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                    }`}
                    title="Klik untuk mengubah status verifikasi"
                  >
                    {!c.verified && <Icon name="hourglass_top" className="!text-sm" />}
                    {c.verified ? "Terverifikasi" : "Menunggu Verifikasi"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={pendingId === c.id}
                    onClick={() => toggleSuspended(c.id, !c.suspended)}
                    className={`rounded-full px-2.5 py-1 font-label-sm text-label-sm transition-colors disabled:opacity-50 ${
                      c.suspended
                        ? "bg-rose-100 text-rose-800 hover:bg-rose-200"
                        : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    }`}
                    title="Klik untuk mengubah status"
                  >
                    {c.suspended ? "Suspended" : "Aktif"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/customers/${c.id}/edit`}
                      className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                      aria-label="Edit"
                    >
                      <Icon name="edit" className="!text-lg" />
                    </Link>
                    <button
                      type="button"
                      disabled={pendingId === c.id}
                      onClick={() => remove(c.id, c.name)}
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
