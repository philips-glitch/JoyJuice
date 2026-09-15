"use client";

import { useActionState } from "react";
import {
  createVoucherAction,
  updateVoucherAction,
  type LoyaltyFormState,
} from "@/app/actions/admin/loyalty-actions";

const INPUT_CLASS =
  "w-full rounded-lg border border-outline-variant px-3 py-2 font-body-sm text-body-sm";

type VoucherFormValues = {
  code: string;
  discountAmount: number;
  minQuantity: number | null;
  maxRedemptions: number | null;
  perUserLimit: number | null;
  expiresAt: string | null; // yyyy-mm-dd, for <input type="date">
  active: boolean;
};

export function VoucherForm({
  id,
  initialValues,
}: {
  id?: string;
  initialValues?: VoucherFormValues;
}) {
  const action = id ? updateVoucherAction.bind(null, id) : createVoucherAction;
  const [state, formAction, pending] = useActionState<LoyaltyFormState, FormData>(
    action,
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
        <span className="font-label-md text-label-md font-bold text-on-surface">
          Kode Voucher
        </span>
        <input
          name="code"
          defaultValue={initialValues?.code}
          placeholder="JOYNEW10"
          className={`${INPUT_CLASS} uppercase`}
          required
        />
        {fieldErrors.code && (
          <span className="font-label-sm text-label-sm text-red-600">{fieldErrors.code}</span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-label-md text-label-md font-bold text-on-surface">
          Diskon (Rp, potongan langsung)
        </span>
        <input
          name="discountAmount"
          type="number"
          min={1}
          step={1}
          defaultValue={initialValues?.discountAmount}
          className={INPUT_CLASS}
          required
        />
        {fieldErrors.discountAmount && (
          <span className="font-label-sm text-label-sm text-red-600">
            {fieldErrors.discountAmount}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-label-md text-label-md font-bold text-on-surface">
          Minimal Jumlah Botol (opsional)
        </span>
        <input
          name="minQuantity"
          type="number"
          min={1}
          defaultValue={initialValues?.minQuantity ?? ""}
          placeholder="Tanpa syarat minimal"
          className={INPUT_CLASS}
        />
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          Untuk promo seperti &quot;beli 15 gratis 1&quot; — voucher hanya bisa dipakai kalau
          jumlah botol di keranjang mencapai angka ini.
        </span>
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="font-label-md text-label-md font-bold text-on-surface">
            Maks. Total Penukaran (opsional)
          </span>
          <input
            name="maxRedemptions"
            type="number"
            min={1}
            defaultValue={initialValues?.maxRedemptions ?? ""}
            placeholder="Tanpa batas"
            className={INPUT_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-label-md text-label-md font-bold text-on-surface">
            Maks. Penukaran per Pelanggan (opsional)
          </span>
          <input
            name="perUserLimit"
            type="number"
            min={1}
            defaultValue={initialValues?.perUserLimit ?? ""}
            placeholder="Tanpa batas"
            className={INPUT_CLASS}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="font-label-md text-label-md font-bold text-on-surface">
          Tanggal Kedaluwarsa (opsional)
        </span>
        <input
          name="expiresAt"
          type="date"
          defaultValue={initialValues?.expiresAt ?? ""}
          className={INPUT_CLASS}
        />
      </label>

      {id && (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="active"
            defaultChecked={initialValues?.active ?? true}
            className="h-4 w-4"
          />
          <span className="font-label-md text-label-md text-on-surface">Voucher aktif</span>
        </label>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-fit rounded-lg bg-primary px-6 py-2.5 font-label-lg text-label-lg text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95 disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : id ? "Simpan Perubahan" : "Buat Voucher"}
      </button>
    </form>
  );
}
