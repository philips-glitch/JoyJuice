"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/app/actions/cart-actions";
import { formatRupiah } from "@/lib/pricing";
import { ICE_LEVELS, SWEETNESS_LEVELS } from "@/lib/menu-options";
import type { ProductWithOptions } from "@/lib/products";

export function CustomizePanel({ product }: { product: ProductWithOptions | null }) {
  const router = useRouter();
  const [sizeId, setSizeId] = useState(product?.sizes[0]?.id ?? "");
  const [iceLevel, setIceLevel] = useState<string>(ICE_LEVELS[0].id);
  const [sweetness, setSweetness] = useState<string>(SWEETNESS_LEVELS[0].id);
  const [toppingIds, setToppingIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);

  const unitPrice = useMemo(() => {
    if (!product) return 0;
    const sizeDelta = product.sizes.find((s) => s.id === sizeId)?.priceDelta ?? 0;
    const toppingDelta = toppingIds.reduce((sum, id) => {
      const t = product.toppings.find((x) => x.id === id);
      return sum + (t?.priceDelta ?? 0);
    }, 0);
    return product.basePrice + sizeDelta + toppingDelta;
  }, [product, sizeId, toppingIds]);

  if (!product) {
    return (
      <div className="jj-card p-6 text-center text-sm text-jj-muted">
        Pilih menu untuk mulai kustomisasi.
      </div>
    );
  }

  function toggleTopping(id: string) {
    setToppingIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  function handleAdd() {
    setJustAdded(false);
    startTransition(async () => {
      await addToCartAction({
        productId: product!.id,
        quantity: 1,
        sizeId,
        iceLevel,
        sweetness,
        toppingIds,
        note,
      });
      setJustAdded(true);
      setNote("");
      setToppingIds([]);
      router.refresh();
    });
  }

  return (
    <div className="jj-card sticky top-20 flex flex-col gap-4 p-5">
      <div className="flex items-center gap-1 text-xs font-semibold text-jj-orange-dark">
        <span className="h-1.5 w-1.5 rounded-full bg-jj-orange" /> Kustomisasi Minuman
        <span className="ml-auto rounded-full bg-jj-gold-bg px-2 py-0.5 text-jj-gold">
          +{product.pointsBadge} Poin
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-jj-bg text-3xl">
          {product.image}
        </div>
        <div>
          <p className="font-semibold text-jj-text">{product.name}</p>
          <p className="text-xs text-jj-muted">{product.ingredients}</p>
          <p className="text-sm font-bold text-jj-orange-dark">
            {formatRupiah(product.basePrice)}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-jj-text">1. Pilih Ukuran Botol</p>
        <div className="grid grid-cols-2 gap-2">
          {product.sizes.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSizeId(s.id)}
              className={`rounded-xl border px-3 py-2 text-left text-xs ${
                sizeId === s.id
                  ? "border-jj-orange bg-orange-50 text-jj-orange-dark"
                  : "border-jj-border text-jj-muted"
              }`}
            >
              <span className="block font-semibold">{s.label}</span>
              <span>{s.priceDelta > 0 ? `+${formatRupiah(s.priceDelta)}` : "Standar"}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-jj-text">2. Level Dingin / Es</p>
        <div className="grid grid-cols-3 gap-2">
          {ICE_LEVELS.map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => setIceLevel(lvl.id)}
              className={`rounded-xl border px-2 py-2 text-[11px] font-medium ${
                iceLevel === lvl.id
                  ? "border-jj-orange bg-orange-50 text-jj-orange-dark"
                  : "border-jj-border text-jj-muted"
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      <label className="text-xs font-semibold text-jj-text">
        3. Rasa Manis Alami
        <select
          value={sweetness}
          onChange={(e) => setSweetness(e.target.value)}
          className="mt-2 w-full rounded-xl border border-jj-border px-3 py-2 text-xs text-jj-text"
        >
          {SWEETNESS_LEVELS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      {product.toppings.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-jj-text">4. Tambahan Superfood / Topping</p>
          <div className="flex flex-col gap-2">
            {product.toppings.map((t) => (
              <label
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-jj-border px-3 py-2 text-xs text-jj-text"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={toppingIds.includes(t.id)}
                    onChange={() => toggleTopping(t.id)}
                  />
                  {t.label}
                </span>
                <span className="text-jj-muted">+{formatRupiah(t.priceDelta)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <label className="text-xs font-semibold text-jj-text">
        Catatan Tambahan untuk Barista
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Contoh: Jahe dikurangi, botol dingin..."
          className="mt-2 w-full rounded-xl border border-jj-border px-3 py-2 text-xs text-jj-text"
        />
      </label>

      <button
        type="button"
        onClick={handleAdd}
        disabled={pending}
        className="jj-btn-primary rounded-full px-5 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Menambahkan..." : `Tambah ke Keranjang · ${formatRupiah(unitPrice)}`}
      </button>

      {justAdded && (
        <p className="text-center text-xs font-medium text-jj-green">
          ✓ Ditambahkan ke keranjang — +{product.pointsBadge} Poin akan otomatis ditambahkan ke
          saldo Anda setelah pesanan selesai.
        </p>
      )}
    </div>
  );
}
