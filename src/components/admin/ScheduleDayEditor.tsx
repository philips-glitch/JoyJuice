"use client";

import { useActionState, useState } from "react";
import {
  updateScheduleDayAction,
  type ScheduleDayFormState,
} from "@/app/actions/admin/schedule-actions";

type ProductOption = { id: string; name: string; category: string; hidden: boolean };

export function ScheduleDayEditor({
  weekday,
  label,
  isToday,
  initialClosed,
  initialNote,
  initialProductIds,
  products,
}: {
  weekday: number;
  label: string;
  isToday: boolean;
  initialClosed: boolean;
  initialNote: string;
  initialProductIds: string[];
  products: ProductOption[];
}) {
  const [state, formAction, pending] = useActionState<ScheduleDayFormState, FormData>(
    updateScheduleDayAction.bind(null, weekday),
    undefined,
  );
  const [closed, setClosed] = useState(initialClosed);
  const selected = new Set(initialProductIds);

  // Group products under their category heading, keeping the page's order.
  const groups = new Map<string, ProductOption[]>();
  for (const p of products) {
    groups.set(p.category, [...(groups.get(p.category) ?? []), p]);
  }

  return (
    <form
      action={formAction}
      className={`flex flex-col gap-3 rounded-xl border bg-surface-container-lowest p-5 shadow-sm ${
        isToday ? "border-primary" : "border-outline-variant/70"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
          {label}
          {isToday && (
            <span className="rounded-full bg-primary px-2 py-0.5 font-label-sm text-label-sm text-on-primary">
              Hari ini
            </span>
          )}
        </h2>
        <label className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
          <input
            type="checkbox"
            name="closed"
            checked={closed}
            onChange={(e) => setClosed(e.target.checked)}
            className="h-4 w-4"
          />
          Libur
        </label>
      </div>

      <input
        name="note"
        defaultValue={initialNote}
        maxLength={120}
        placeholder="Catatan (opsional), cth: Stok terbatas, PO H-1"
        className="w-full rounded-lg border border-outline-variant px-3 py-2 font-body-sm text-body-sm"
      />

      <fieldset disabled={closed} className="flex flex-col gap-3 disabled:opacity-40">
        {[...groups.entries()].map(([category, items]) => (
          <div key={category}>
            <p className="mb-1 font-label-sm text-label-sm font-bold uppercase tracking-wide text-on-surface-variant">
              {category}
            </p>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {items.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-1 font-body-sm text-body-sm text-on-surface hover:bg-surface-container-low"
                >
                  <input
                    type="checkbox"
                    name="productIds"
                    value={p.id}
                    defaultChecked={selected.has(p.id)}
                    className="h-4 w-4"
                  />
                  <span className={p.hidden ? "text-outline" : undefined}>
                    {p.name}
                    {p.hidden && " (tidak tampil di menu)"}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </fieldset>

      <div className="flex items-center justify-end gap-3 border-t border-outline-variant/60 pt-3">
        {state?.error && (
          <span className="font-label-sm text-label-sm text-red-600">{state.error}</span>
        )}
        {state?.savedAt && !pending && (
          <span className="font-label-sm text-label-sm text-emerald-700">✓ Tersimpan</span>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-5 py-2 font-label-lg text-label-lg text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95 disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : `Simpan ${label}`}
        </button>
      </div>
    </form>
  );
}
