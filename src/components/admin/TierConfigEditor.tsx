"use client";

import { useActionState } from "react";
import {
  updateTierConfigAction,
  type LoyaltyFormState,
} from "@/app/actions/admin/loyalty-actions";
import { TIER_ORDER, type TierConfigMap } from "@/lib/tiers";

const INPUT_CLASS =
  "w-full rounded-lg border border-outline-variant px-2.5 py-1.5 font-body-sm text-body-sm";

export function TierConfigEditor({ tierConfig }: { tierConfig: TierConfigMap }) {
  const [state, formAction, pending] = useActionState<LoyaltyFormState, FormData>(
    updateTierConfigAction,
    undefined,
  );
  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-body-sm text-body-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-outline-variant/70 bg-surface-container-lowest shadow-sm">
        <table className="w-full min-w-[720px] text-left font-body-sm text-body-sm">
          <thead className="border-b border-outline-variant/60 bg-surface-container-low text-on-surface-variant">
            <tr>
              <th className="px-3 py-3 font-label-md text-label-md">Tier</th>
              <th className="px-3 py-3 font-label-md text-label-md">Label</th>
              <th className="px-3 py-3 font-label-md text-label-md">Min. Lifetime Poin</th>
              <th className="px-3 py-3 font-label-md text-label-md">Multiplier Poin</th>
              <th className="px-3 py-3 font-label-md text-label-md">Diskon Flat (Rp)</th>
              <th className="px-3 py-3 font-label-md text-label-md">Warna</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {TIER_ORDER.map((tier) => {
              const cfg = tierConfig[tier];
              return (
                <tr key={tier}>
                  <td className="px-3 py-2.5 font-semibold text-on-surface">{tier}</td>
                  <td className="px-3 py-2.5">
                    <input
                      name={`${tier}_label`}
                      defaultValue={cfg.label}
                      className={INPUT_CLASS}
                      required
                    />
                    {fieldErrors[`${tier}_label`] && (
                      <span className="mt-1 block font-label-sm text-label-sm text-red-600">
                        {fieldErrors[`${tier}_label`]}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      name={`${tier}_minLifetimePoints`}
                      type="number"
                      min={0}
                      defaultValue={cfg.minLifetimePoints}
                      className={INPUT_CLASS}
                      required
                    />
                    {fieldErrors[`${tier}_minLifetimePoints`] && (
                      <span className="mt-1 block font-label-sm text-label-sm text-red-600">
                        {fieldErrors[`${tier}_minLifetimePoints`]}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      name={`${tier}_multiplier`}
                      type="number"
                      step="0.05"
                      min={0.1}
                      defaultValue={cfg.multiplier}
                      className={INPUT_CLASS}
                      required
                    />
                    {fieldErrors[`${tier}_multiplier`] && (
                      <span className="mt-1 block font-label-sm text-label-sm text-red-600">
                        {fieldErrors[`${tier}_multiplier`]}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      name={`${tier}_flatDiscount`}
                      type="number"
                      min={0}
                      step={500}
                      defaultValue={cfg.flatDiscount}
                      className={INPUT_CLASS}
                      required
                    />
                    {fieldErrors[`${tier}_flatDiscount`] && (
                      <span className="mt-1 block font-label-sm text-label-sm text-red-600">
                        {fieldErrors[`${tier}_flatDiscount`]}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        name={`${tier}_color`}
                        type="color"
                        defaultValue={cfg.color}
                        className="h-8 w-10 cursor-pointer rounded border border-outline-variant"
                      />
                    </div>
                    {fieldErrors[`${tier}_color`] && (
                      <span className="mt-1 block font-label-sm text-label-sm text-red-600">
                        {fieldErrors[`${tier}_color`]}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-lg bg-primary px-6 py-2.5 font-label-lg text-label-lg text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95 disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Simpan Konfigurasi Tier"}
      </button>
    </form>
  );
}
