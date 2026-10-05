"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import {
  createCategoryAction,
  renameCategoryAction,
  toggleCategoryActiveAction,
  moveCategoryAction,
  deleteCategoryAction,
  type CategoryFormState,
} from "@/app/actions/admin/categories-actions";

type CategoryRow = {
  id: string;
  name: string;
  active: boolean;
  productCount: number;
};

const ICON_BUTTON_CLASS =
  "rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent";

export function CategoriesTable({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const formRef = useRef<HTMLFormElement>(null);
  const [createState, createAction, creating] = useActionState<CategoryFormState, FormData>(
    createCategoryAction,
    undefined,
  );

  useEffect(() => {
    if (createState?.ok) formRef.current?.reset();
  }, [createState]);

  function run(id: string, fallbackError: string, fn: () => Promise<void>, onDone?: () => void) {
    setPendingId(id);
    setError(null);
    startTransition(async () => {
      try {
        await fn();
        onDone?.();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : fallbackError);
      } finally {
        setPendingId(null);
      }
    });
  }

  function startEdit(c: CategoryRow) {
    setEditingId(c.id);
    setDraftName(c.name);
    setError(null);
  }

  function saveEdit(c: CategoryRow) {
    if (draftName.trim() === c.name) {
      setEditingId(null);
      return;
    }
    run(c.id, "Gagal mengganti nama.", () => renameCategoryAction(c.id, draftName), () =>
      setEditingId(null),
    );
  }

  function remove(c: CategoryRow) {
    if (!confirm(`Hapus kategori "${c.name}"?`)) return;
    run(c.id, "Gagal menghapus kategori.", () => deleteCategoryAction(c.id));
  }

  return (
    <div className="flex flex-col gap-3">
      <form
        ref={formRef}
        action={createAction}
        className="flex max-w-xl flex-col gap-2 rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-4 shadow-sm sm:flex-row sm:items-start"
      >
        <div className="flex flex-1 flex-col gap-1">
          <input
            name="name"
            placeholder="Nama kategori baru, cth: Seasonal Menu"
            className="w-full rounded-lg border border-outline-variant px-3 py-2 font-body-sm text-body-sm"
            required
          />
          {createState?.error && (
            <span className="font-label-sm text-label-sm text-red-600">{createState.error}</span>
          )}
        </div>
        <button
          type="submit"
          disabled={creating}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 font-label-lg text-label-lg text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95 disabled:opacity-60"
        >
          <Icon name="add" className="!text-base" />
          {creating ? "Menambah..." : "Tambah Kategori"}
        </button>
      </form>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-body-sm text-body-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-outline-variant/70 bg-surface-container-lowest shadow-sm">
        <table className="w-full min-w-[640px] text-left font-body-sm text-body-sm">
          <thead className="border-b border-outline-variant/60 bg-surface-container-low text-on-surface-variant">
            <tr>
              <th className="w-24 px-4 py-3 font-label-md text-label-md">Urutan</th>
              <th className="px-4 py-3 font-label-md text-label-md">Kategori</th>
              <th className="px-4 py-3 font-label-md text-label-md">Produk</th>
              <th className="px-4 py-3 font-label-md text-label-md">Status</th>
              <th className="px-4 py-3 font-label-md text-label-md">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-on-surface-variant">
                  Belum ada kategori.
                </td>
              </tr>
            )}
            {categories.map((c, i) => {
              const busy = pendingId === c.id;
              const editing = editingId === c.id;
              return (
                <tr key={c.id} className="hover:bg-surface-container-low">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <button
                        type="button"
                        disabled={busy || i === 0}
                        onClick={() =>
                          run(c.id, "Gagal mengubah urutan.", () => moveCategoryAction(c.id, "up"))
                        }
                        className={ICON_BUTTON_CLASS}
                        aria-label="Naikkan"
                      >
                        <Icon name="arrow_upward" className="!text-lg" />
                      </button>
                      <button
                        type="button"
                        disabled={busy || i === categories.length - 1}
                        onClick={() =>
                          run(c.id, "Gagal mengubah urutan.", () =>
                            moveCategoryAction(c.id, "down"),
                          )
                        }
                        className={ICON_BUTTON_CLASS}
                        aria-label="Turunkan"
                      >
                        <Icon name="arrow_downward" className="!text-lg" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {editing ? (
                      <input
                        autoFocus
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(c);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        disabled={busy}
                        className="w-full max-w-xs rounded-lg border border-outline-variant px-3 py-1.5 font-body-sm text-body-sm"
                      />
                    ) : (
                      <p className="font-medium text-on-surface">{c.name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{c.productCount}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        run(c.id, "Gagal mengubah status.", () =>
                          toggleCategoryActiveAction(c.id, !c.active),
                        )
                      }
                      className={`rounded-full px-2.5 py-1 font-label-sm text-label-sm transition-colors disabled:opacity-50 ${
                        c.active
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-surface-container text-on-surface-variant hover:bg-outline-variant/40"
                      }`}
                      title="Klik untuk tampilkan / sembunyikan dari menu"
                    >
                      {c.active ? "Tampil" : "Disembunyikan"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {editing ? (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => saveEdit(c)}
                            className={ICON_BUTTON_CLASS}
                            aria-label="Simpan"
                          >
                            <Icon name="check" className="!text-lg" />
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => setEditingId(null)}
                            className={ICON_BUTTON_CLASS}
                            aria-label="Batal"
                          >
                            <Icon name="close" className="!text-lg" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => startEdit(c)}
                          className={ICON_BUTTON_CLASS}
                          aria-label="Ganti nama"
                        >
                          <Icon name="edit" className="!text-lg" />
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busy || c.productCount > 0}
                        onClick={() => remove(c)}
                        className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-secondary disabled:opacity-30 disabled:hover:bg-transparent"
                        aria-label="Hapus"
                        title={
                          c.productCount > 0
                            ? "Kategori masih berisi produk — pindahkan produknya dulu"
                            : "Hapus kategori"
                        }
                      >
                        <Icon name="delete" className="!text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
