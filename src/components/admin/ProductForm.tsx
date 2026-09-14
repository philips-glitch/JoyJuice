"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/Icon";
import type { ProductFormState } from "@/app/actions/admin/products-actions";

type OptionRow = { id: string; label: string; priceDelta: number };

const INPUT_CLASS =
  "w-full rounded-lg border border-outline-variant px-3 py-2 font-body-sm text-body-sm";

export type ProductFormValues = {
  name: string;
  slug: string;
  category: string;
  description: string;
  ingredients: string;
  image: string;
  basePrice: number;
  calories: number;
  volumeMl: number;
  rating: number;
  tag: string;
  pointsBadge: number;
  active: boolean;
  sizes: OptionRow[];
  toppings: OptionRow[];
};

const EMPTY_VALUES: ProductFormValues = {
  name: "",
  slug: "",
  category: "",
  description: "",
  ingredients: "",
  image: "",
  basePrice: 15_000,
  calories: 100,
  volumeMl: 250,
  rating: 4.8,
  tag: "",
  pointsBadge: 15,
  active: true,
  sizes: [{ id: "250ml", label: "Botol 250ml", priceDelta: 0 }],
  toppings: [],
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function OptionRowsEditor({
  label,
  rows,
  onChange,
}: {
  label: string;
  rows: OptionRow[];
  onChange: (rows: OptionRow[]) => void;
}) {
  function update(index: number, patch: Partial<OptionRow>) {
    onChange(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }
  function remove(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }
  function add() {
    onChange([...rows, { id: `opt-${rows.length + 1}`, label: "", priceDelta: 0 }]);
  }

  return (
    <div>
      <label className="mb-2 block font-label-md text-label-md font-bold text-on-surface">
        {label}
      </label>
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={row.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="Nama pilihan"
              className="flex-1 rounded-lg border border-outline-variant px-3 py-2 font-body-sm text-body-sm"
            />
            <input
              type="number"
              value={row.priceDelta}
              onChange={(e) => update(i, { priceDelta: Number(e.target.value) })}
              placeholder="+Rp"
              className="w-28 rounded-lg border border-outline-variant px-3 py-2 font-body-sm text-body-sm"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-secondary"
              aria-label="Hapus"
            >
              <Icon name="delete" className="!text-lg" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="flex w-fit items-center gap-1 rounded-lg border border-dashed border-outline-variant px-3 py-2 font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-low"
        >
          <Icon name="add" className="!text-base" /> Tambah pilihan
        </button>
      </div>
    </div>
  );
}

export function ProductForm({
  mode,
  initialValues,
  categories,
  action,
}: {
  mode: "create" | "edit";
  initialValues?: Partial<ProductFormValues>;
  categories: string[];
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
}) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    action,
    undefined,
  );

  const [values, setValues] = useState<ProductFormValues>({ ...EMPTY_VALUES, ...initialValues });
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const fieldErrors = state?.fieldErrors ?? {};

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state?.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-body-sm text-body-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nama Produk" error={fieldErrors.name}>
          <input
            name="name"
            value={values.name}
            onChange={(e) => {
              set("name", e.target.value);
              if (!slugTouched) set("slug", slugify(e.target.value));
            }}
            className={INPUT_CLASS}
            required
          />
        </Field>
        <Field label="Slug (URL)" error={fieldErrors.slug}>
          <input
            name="slug"
            value={values.slug}
            onChange={(e) => {
              setSlugTouched(true);
              set("slug", e.target.value);
            }}
            className={INPUT_CLASS}
            required
          />
        </Field>
        <Field label="Kategori" error={fieldErrors.category}>
          <input
            name="category"
            list="category-options"
            value={values.category}
            onChange={(e) => set("category", e.target.value)}
            className={INPUT_CLASS}
            required
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Tag Badge (opsional)" error={fieldErrors.tag}>
          <input
            name="tag"
            value={values.tag}
            onChange={(e) => set("tag", e.target.value)}
            placeholder="cth: Favorit, Detox"
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <Field label="Deskripsi Singkat" error={fieldErrors.description}>
        <input
          name="description"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          className={INPUT_CLASS}
          required
        />
      </Field>

      <Field label="Bahan / Ingredients" error={fieldErrors.ingredients}>
        <input
          name="ingredients"
          value={values.ingredients}
          onChange={(e) => set("ingredients", e.target.value)}
          className={INPUT_CLASS}
          required
        />
      </Field>

      <div>
        <Field label="Gambar (path /products/... atau URL)" error={fieldErrors.image}>
          <input
            name="image"
            value={values.image}
            onChange={(e) => set("image", e.target.value)}
            placeholder="/products/nama-produk.jpg"
            className={INPUT_CLASS}
            required
          />
        </Field>
        {values.image && (
          <div className="relative mt-2 h-24 w-24 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low">
            {values.image.startsWith("/") || values.image.startsWith("http") ? (
              <Image src={values.image} alt="Preview" fill sizes="96px" className="object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center text-4xl">{values.image}</span>
            )}
          </div>
        )}
        <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
          Catatan: file baru tidak bisa di-upload langsung dari sini (server tidak menyimpan file
          permanen di Vercel) — gunakan path foto yang sudah ada di <code>public/products/</code>{" "}
          atau URL gambar eksternal.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Harga (Rp)" error={fieldErrors.basePrice}>
          <input
            type="number"
            name="basePrice"
            value={values.basePrice}
            onChange={(e) => set("basePrice", Number(e.target.value))}
            className={INPUT_CLASS}
            required
          />
        </Field>
        <Field label="Poin Badge" error={fieldErrors.pointsBadge}>
          <input
            type="number"
            name="pointsBadge"
            value={values.pointsBadge}
            onChange={(e) => set("pointsBadge", Number(e.target.value))}
            className={INPUT_CLASS}
            required
          />
        </Field>
        <Field label="Kalori (kkal)" error={fieldErrors.calories}>
          <input
            type="number"
            name="calories"
            value={values.calories}
            onChange={(e) => set("calories", Number(e.target.value))}
            className={INPUT_CLASS}
            required
          />
        </Field>
        <Field label="Volume (ml)" error={fieldErrors.volumeMl}>
          <input
            type="number"
            name="volumeMl"
            value={values.volumeMl}
            onChange={(e) => set("volumeMl", Number(e.target.value))}
            className={INPUT_CLASS}
            required
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:w-1/2">
        <Field label="Rating (0-5)" error={fieldErrors.rating}>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            name="rating"
            value={values.rating}
            onChange={(e) => set("rating", Number(e.target.value))}
            className={INPUT_CLASS}
            required
          />
        </Field>
        <label className="flex items-end gap-2 pb-2.5">
          <input
            type="checkbox"
            name="active"
            checked={values.active}
            onChange={(e) => set("active", e.target.checked)}
            className="h-4 w-4"
          />
          <span className="font-label-md text-label-md text-on-surface">
            Aktif (tampil di menu)
          </span>
        </label>
      </div>

      <OptionRowsEditor
        label="Pilihan Ukuran"
        rows={values.sizes}
        onChange={(rows) => set("sizes", rows)}
      />
      <OptionRowsEditor
        label="Tambahan / Topping"
        rows={values.toppings}
        onChange={(rows) => set("toppings", rows)}
      />

      <input type="hidden" name="sizes" value={JSON.stringify(values.sizes)} />
      <input type="hidden" name="toppings" value={JSON.stringify(values.toppings)} />

      <div className="flex justify-end gap-3 border-t border-outline-variant/60 pt-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-6 py-2.5 font-label-lg text-label-lg text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95 disabled:opacity-60"
        >
          {pending ? "Menyimpan..." : mode === "create" ? "Buat Produk" : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-label-md text-label-md font-bold text-on-surface">{label}</span>
      {children}
      {error && <span className="font-label-sm text-label-sm text-red-600">{error}</span>}
    </label>
  );
}
