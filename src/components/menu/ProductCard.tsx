"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addToCartAction } from "@/app/actions/cart-actions";
import { formatRupiah } from "@/lib/pricing";
import { DEFAULT_ICE_LEVEL } from "@/lib/menu-options";
import { Icon } from "@/components/Icon";
import { ProductImage } from "@/components/ProductImage";
import type { ProductWithOptions } from "@/lib/products";

const TAG_CHIP_STYLES: Record<string, string> = {
  "tanpa gula": "bg-emerald-100 text-emerald-800",
  immunity: "bg-orange-100 text-orange-800",
  superfood: "bg-rose-100 text-rose-800",
  "anti-inflamasi": "bg-amber-100 text-amber-900",
};

function tagChipClass(tag: string) {
  return TAG_CHIP_STYLES[tag.toLowerCase()] ?? "bg-surface-container text-on-surface-variant";
}

export function ProductCard({
  product,
  isLoggedIn,
  onCustomize,
}: {
  product: ProductWithOptions;
  isLoggedIn: boolean;
  onCustomize: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function quickAdd() {
    startTransition(async () => {
      await addToCartAction({
        productId: product.id,
        quantity: 1,
        sizeId: product.sizes[0]?.id ?? "reg",
        iceLevel: DEFAULT_ICE_LEVEL,
        sweetness: "pure",
        toppingIds: [],
      });
      router.refresh();
    });
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant/70 bg-surface-container-lowest shadow-sm transition-all hover:shadow-md">
      <button
        type="button"
        onClick={onCustomize}
        className="relative aspect-[3/5] overflow-hidden bg-surface-container-low text-left"
      >
        <div className="h-full w-full transition-transform duration-300 group-hover:scale-105">
          <ProductImage image={product.image} alt={product.name} emojiClassName="flex h-full items-center justify-center text-6xl" />
        </div>
        {product.tag && (
          <div className="absolute left-3 top-3 flex gap-1">
            <span
              className={`rounded-full border border-outline-variant/60 px-2.5 py-1 font-label-sm text-label-sm backdrop-blur-sm ${tagChipClass(
                product.tag,
              )}`}
            >
              {product.tag}
            </span>
          </div>
        )}
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 font-label-sm text-label-sm text-amber-900 shadow-xs">
          <Icon name="stars" filled className="!text-xs text-amber-600" />
          <span>+{product.pointsBadge} Poin</span>
        </div>
      </button>

      <div className="flex flex-1 flex-col justify-between p-4">
        <button type="button" onClick={onCustomize} className="text-left">
          <h3 className="mb-1 font-headline-sm text-headline-sm text-on-surface">{product.name}</h3>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded bg-surface-container px-2 py-0.5 font-label-sm text-label-sm text-on-surface-variant">
              {product.calories} kkal
            </span>
          </div>
        </button>

        <div className="flex flex-col gap-2 border-t border-outline-variant/60 pt-3">
          <div>
            <span className="block font-label-sm text-label-sm text-outline">Harga</span>
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {formatRupiah(product.basePrice)}
            </span>
          </div>
          {!isLoggedIn ? (
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-surface-container-low px-3.5 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-primary hover:text-on-primary active:scale-95"
            >
              <Icon name="lock" className="!text-sm" />
              <span>Masuk untuk Pesan</span>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onCustomize}
                aria-label={`Kustomisasi ${product.name}`}
                title="Kustomisasi"
                className="flex flex-shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-surface-container-low p-2 text-primary transition-colors hover:bg-primary hover:text-on-primary active:scale-95"
              >
                <Icon name="tune" className="!text-sm" />
              </button>
              <button
                type="button"
                onClick={quickAdd}
                disabled={pending}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-2 py-2 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container active:scale-95 disabled:opacity-50"
              >
                <Icon name="add_shopping_cart" className="!text-sm" />
                <span>{pending ? "..." : "Tambah"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
