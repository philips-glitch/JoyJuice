"use client";

import { useActionState, useState } from "react";
import { updateCustomerAction, type CustomerFormState } from "@/app/actions/admin/customers-actions";
import type { TierConfigMap } from "@/lib/tiers";
import type { Tier } from "@prisma/client";

const INPUT_CLASS =
  "w-full rounded-lg border border-outline-variant px-3 py-2 font-body-sm text-body-sm";

export function EditCustomerForm({
  id,
  initialValues,
  tierConfig,
}: {
  id: string;
  initialValues: {
    name: string;
    email: string;
    phone: string;
    tier: Tier;
    points: number;
    suspended: boolean;
    verified: boolean;
  };
  tierConfig: TierConfigMap;
}) {
  const action = updateCustomerAction.bind(null, id);
  const [state, formAction, pending] = useActionState<CustomerFormState, FormData>(
    action,
    undefined,
  );
  const fieldErrors = state?.fieldErrors ?? {};
  const [pointsAdjustment, setPointsAdjustment] = useState(0);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-body-sm text-body-sm text-red-700">
          {state.error}
        </p>
      )}

      <label className="flex flex-col gap-1">
        <span className="font-label-md text-label-md font-bold text-on-surface">Nama</span>
        <input name="name" defaultValue={initialValues.name} className={INPUT_CLASS} required />
        {fieldErrors.name && <span className="font-label-sm text-label-sm text-red-600">{fieldErrors.name}</span>}
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-label-md text-label-md font-bold text-on-surface">Email</span>
        <input name="email" type="email" defaultValue={initialValues.email} className={INPUT_CLASS} />
        {fieldErrors.email && <span className="font-label-sm text-label-sm text-red-600">{fieldErrors.email}</span>}
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-label-md text-label-md font-bold text-on-surface">
          Nomor WhatsApp
        </span>
        <input name="phone" defaultValue={initialValues.phone} className={INPUT_CLASS} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-label-md text-label-md font-bold text-on-surface">
          Tier (override manual)
        </span>
        <select name="tier" defaultValue={initialValues.tier} className={INPUT_CLASS}>
          {(["BRONZE", "SILVER", "GOLD", "PLATINUM"] as const).map((t) => (
            <option key={t} value={t}>
              {tierConfig[t].label}
            </option>
          ))}
        </select>
      </label>

      <div>
        <span className="font-label-md text-label-md font-bold text-on-surface">
          Saldo Poin Saat Ini: {initialValues.points.toLocaleString("id-ID")} pts
        </span>
        <label className="mt-1 flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Penyesuaian poin (+/-, kosongkan/0 jika tidak ada perubahan)
          </span>
          <input
            name="pointsAdjustment"
            type="number"
            value={pointsAdjustment}
            onChange={(e) => setPointsAdjustment(Number(e.target.value))}
            className={INPUT_CLASS}
          />
        </label>
        {pointsAdjustment !== 0 && (
          <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">
            Saldo baru: {Math.max(0, initialValues.points + pointsAdjustment).toLocaleString("id-ID")}{" "}
            pts
          </p>
        )}
      </div>

      <label
        className={`flex items-center gap-2 rounded-lg p-2 ${
          !initialValues.verified ? "border border-amber-300 bg-amber-50" : ""
        }`}
      >
        <input
          type="checkbox"
          name="verified"
          defaultChecked={initialValues.verified}
          className="h-4 w-4"
        />
        <span className="font-label-md text-label-md text-on-surface">
          Akun terverifikasi (bisa login){" "}
          {!initialValues.verified && (
            <span className="font-bold text-amber-700">— sedang menunggu verifikasi</span>
          )}
        </span>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="suspended"
          defaultChecked={initialValues.suspended}
          className="h-4 w-4"
        />
        <span className="font-label-md text-label-md text-on-surface">
          Suspend akun (tidak bisa login)
        </span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-primary px-6 py-2.5 font-label-lg text-label-lg text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95 disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
