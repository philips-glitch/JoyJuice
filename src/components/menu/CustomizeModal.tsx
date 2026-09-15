"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addToCartAction } from "@/app/actions/cart-actions";
import { formatRupiah } from "@/lib/pricing";
import { DEFAULT_ICE_LEVEL, SWEETNESS_LEVELS } from "@/lib/menu-options";
import { Icon } from "@/components/Icon";
import { ProductImage } from "@/components/ProductImage";
import type { ProductWithOptions } from "@/lib/products";

/**
 * Pop-up version of the customization form — was previously an always-
 * visible sticky sidebar panel next to the product grid; now it's a modal
 * opened per-product (via ProductCard's "Kustomisasi" button) so the menu
 * grid gets the full width and nothing shows until a product is chosen.
 *
 * This outer component only owns the overlay chrome (backdrop, scroll
 * lock, Escape-to-close); the actual form lives in `CustomizeModalBody`,
 * keyed by product id so switching products remounts it — a fresh set of
 * useState calls resets the form instead of an effect calling setState.
 */
export function CustomizeModal({
  product,
  isLoggedIn,
  onClose,
}: {
  product: ProductWithOptions | null;
  isLoggedIn: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!product) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Kustomisasi ${product.name}`}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto rounded-2xl border-2 border-primary/40 bg-surface-container-lowest p-6 shadow-xl"
      >
        <CustomizeModalBody
          key={product.id}
          product={product}
          isLoggedIn={isLoggedIn}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

function CustomizeModalBody({
  product,
  isLoggedIn,
  onClose,
}: {
  product: ProductWithOptions;
  isLoggedIn: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [sizeId, setSizeId] = useState(product.sizes[0]?.id ?? "");
  const [sweetness, setSweetness] = useState<string>(SWEETNESS_LEVELS[0].id);
  const [toppingIds, setToppingIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);

  const unitPrice = useMemo(() => {
    const sizeDelta = product.sizes.find((s) => s.id === sizeId)?.priceDelta ?? 0;
    const toppingDelta = toppingIds.reduce((sum, id) => {
      const t = product.toppings.find((x) => x.id === id);
      return sum + (t?.priceDelta ?? 0);
    }, 0);
    return product.basePrice + sizeDelta + toppingDelta;
  }, [product, sizeId, toppingIds]);

  function toggleTopping(id: string) {
    setToppingIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  function handleAdd() {
    setJustAdded(false);
    startTransition(async () => {
      await addToCartAction({
        productId: product.id,
        quantity: 1,
        sizeId,
        iceLevel: DEFAULT_ICE_LEVEL,
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
    <>
      <div className="relative mb-4 border-b border-outline-variant/60 pb-4">
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="absolute -right-1.5 -top-1.5 rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container-low"
        >
          <Icon name="close" className="!text-lg" />
        </button>
        <div className="flex items-center justify-between pr-8">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 animate-pulse rounded-full bg-primary" />
            <span className="font-label-lg text-label-lg font-bold text-primary">
              Kustomisasi Pesanan
            </span>
          </div>
          <span className="rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-amber-900">
            +{product.pointsBadge} Poin Earned
          </span>
        </div>
      </div>

      <div className="mb-5 flex items-center gap-3 border-b border-outline-variant/60 pb-4">
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
          <ProductImage image={product.image} alt={product.name} emojiClassName="flex h-full items-center justify-center text-3xl" />
        </div>
        <div>
          <h4 className="font-headline-sm text-base text-on-surface">{product.name}</h4>
          <p className="font-body-sm text-body-sm text-outline">{product.ingredients}</p>
          <span className="font-label-md text-label-md font-bold text-primary">
            Harga Dasar: {formatRupiah(product.basePrice)}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block font-label-md text-label-md font-bold text-on-surface">
            1. Pilih Ukuran Botol
          </label>
          <div className={`grid gap-2 ${product.sizes.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {product.sizes.map((s) => (
              <label
                key={s.id}
                className={`flex cursor-pointer flex-col rounded-lg p-2.5 transition-all ${
                  sizeId === s.id
                    ? "border-2 border-primary bg-orange-50/60"
                    : "border border-outline-variant hover:border-outline"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-label-md text-label-md ${
                      sizeId === s.id ? "font-bold text-on-surface" : "text-on-surface"
                    }`}
                  >
                    {s.label}
                  </span>
                  <input
                    type="radio"
                    name="size"
                    checked={sizeId === s.id}
                    onChange={() => setSizeId(s.id)}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                </div>
                <span
                  className={`mt-1 font-body-sm text-body-sm ${
                    s.priceDelta > 0 ? "font-semibold text-secondary" : "text-outline"
                  }`}
                >
                  {s.priceDelta > 0 ? `+${formatRupiah(s.priceDelta)}` : "Standar Nutrisi"}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block font-label-md text-label-md font-bold text-on-surface">
            2. Rasa Manis
          </label>
          <select
            value={sweetness}
            onChange={(e) => setSweetness(e.target.value)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-2.5 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-primary"
          >
            {SWEETNESS_LEVELS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {product.toppings.length > 0 && (
          <div>
            <label className="mb-2 block font-label-md text-label-md font-bold text-on-surface">
              3. Tambahan Superfood / Topping
            </label>
            <div className="space-y-2">
              {product.toppings.map((t) => (
                <label
                  key={t.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border border-outline-variant p-2 hover:bg-surface-container-low"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={toppingIds.includes(t.id)}
                      onChange={() => toggleTopping(t.id)}
                      className="h-4 w-4 rounded text-primary focus:ring-primary"
                    />
                    <span className="font-body-sm text-body-sm text-on-surface">{t.label}</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-outline">
                    +{formatRupiah(t.priceDelta)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="mb-1 block font-label-sm text-label-sm text-outline">
            Catatan Tambahan untuk Barista
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contoh: Jahe dikurangi, botol dingin..."
            className="w-full rounded-lg border border-outline-variant p-2 font-body-sm text-body-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div className="pt-3">
          {isLoggedIn ? (
            <>
              <button
                type="button"
                onClick={handleAdd}
                disabled={pending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 font-label-lg text-label-lg text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[.98] disabled:opacity-60"
              >
                <Icon name="shopping_cart_checkout" className="!text-base" />
                <span>
                  {pending
                    ? "Menambahkan..."
                    : `Tambah ke Keranjang - ${formatRupiah(unitPrice)}`}
                </span>
              </button>
              <p className="mt-2 text-center font-label-sm text-label-sm text-outline">
                {justAdded
                  ? `✓ Ditambahkan! +${product.pointsBadge} poin akan masuk setelah pesanan selesai.`
                  : `Pembelian ini mengumpulkan ${product.pointsBadge} poin otomatis ke akun Anda`}
              </p>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 font-label-lg text-label-lg text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-[.98]"
              >
                <Icon name="lock" className="!text-base" />
                <span>Masuk untuk Memesan</span>
              </Link>
              <p className="mt-2 text-center font-label-sm text-label-sm text-outline">
                Daftar gratis dan dapatkan {product.pointsBadge} poin dari pembelian ini.{" "}
                <Link href="/signup" className="font-semibold text-primary hover:underline">
                  Daftar sekarang
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
