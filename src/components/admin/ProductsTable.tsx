"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { ProductImage } from "@/components/ProductImage";
import { formatRupiah } from "@/lib/pricing";
import {
  toggleProductActiveAction,
  deleteProductAction,
} from "@/app/actions/admin/products-actions";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  image: string;
  basePrice: number;
  active: boolean;
};

export function ProductsTable({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function toggleActive(id: string, next: boolean) {
    setPendingId(id);
    setError(null);
    startTransition(async () => {
      try {
        await toggleProductActiveAction(id, next);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengubah status.");
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
        await deleteProductAction(id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal menghapus produk.");
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
              <th className="px-4 py-3 font-label-md text-label-md">Produk</th>
              <th className="px-4 py-3 font-label-md text-label-md">Kategori</th>
              <th className="px-4 py-3 font-label-md text-label-md">Harga</th>
              <th className="px-4 py-3 font-label-md text-label-md">Status</th>
              <th className="px-4 py-3 font-label-md text-label-md">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-on-surface-variant">
                  Belum ada produk.
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-surface-container-low">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
                      <ProductImage
                        image={p.image}
                        alt={p.name}
                        emojiClassName="flex h-full items-center justify-center text-xl"
                      />
                    </span>
                    <div>
                      <p className="font-medium text-on-surface">{p.name}</p>
                      <p className="text-on-surface-variant">/{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-on-surface-variant">{p.category}</td>
                <td className="px-4 py-3 font-semibold text-on-surface">
                  {formatRupiah(p.basePrice)}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={pendingId === p.id}
                    onClick={() => toggleActive(p.id, !p.active)}
                    className={`rounded-full px-2.5 py-1 font-label-sm text-label-sm transition-colors disabled:opacity-50 ${
                      p.active
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-surface-container text-on-surface-variant hover:bg-outline-variant/40"
                    }`}
                    title="Klik untuk mengubah status"
                  >
                    {p.active ? "Aktif" : "Nonaktif"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                      aria-label="Edit"
                    >
                      <Icon name="edit" className="!text-lg" />
                    </Link>
                    <button
                      type="button"
                      disabled={pendingId === p.id}
                      onClick={() => remove(p.id, p.name)}
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
