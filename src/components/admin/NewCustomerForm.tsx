"use client";

import { useActionState } from "react";
import { createCustomerAction, type CustomerFormState } from "@/app/actions/admin/customers-actions";

const INPUT_CLASS =
  "w-full rounded-lg border border-outline-variant px-3 py-2 font-body-sm text-body-sm";

export function NewCustomerForm() {
  const [state, formAction, pending] = useActionState<CustomerFormState, FormData>(
    createCustomerAction,
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

      <label className="flex flex-col gap-1">
        <span className="font-label-md text-label-md font-bold text-on-surface">Nama</span>
        <input name="name" className={INPUT_CLASS} required />
        {fieldErrors.name && <span className="font-label-sm text-label-sm text-red-600">{fieldErrors.name}</span>}
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-label-md text-label-md font-bold text-on-surface">Username</span>
        <input name="username" className={INPUT_CLASS} required />
        {fieldErrors.username && (
          <span className="font-label-sm text-label-sm text-red-600">{fieldErrors.username}</span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-label-md text-label-md font-bold text-on-surface">
          Email (opsional)
        </span>
        <input name="email" type="email" className={INPUT_CLASS} />
        {fieldErrors.email && <span className="font-label-sm text-label-sm text-red-600">{fieldErrors.email}</span>}
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-label-md text-label-md font-bold text-on-surface">
          Nomor WhatsApp (opsional)
        </span>
        <input name="phone" className={INPUT_CLASS} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-label-md text-label-md font-bold text-on-surface">
          Password Awal
        </span>
        <input name="password" type="password" className={INPUT_CLASS} required />
        {fieldErrors.password && (
          <span className="font-label-sm text-label-sm text-red-600">{fieldErrors.password}</span>
        )}
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-primary px-6 py-2.5 font-label-lg text-label-lg text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95 disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Buat Pelanggan"}
      </button>
    </form>
  );
}
