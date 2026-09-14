"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/app/actions/cart-actions";
import { formatRupiah } from "@/lib/pricing";
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
  selected,
  onSelect,
}: {
  product: ProductWithOptions;
  selected: boolean;
  onSelect: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function quickAdd() {
    startTransition(async () => {
      await addToCartAction({
        productId: product.id,
        quantity: 1,
        sizeId: product.sizes[0]?.id ?? "reg",
        iceLevel: "normal",
        sweetness: "pure",
        toppingIds: [],
      });
      router.refresh();
    });
  }

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md ${
        selected ? "border-primary" : "border-outline-variant/70"
      } bg-surface-container-lowest`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="relative h-48 overflow-hidden bg-surface-container-low text-left"
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
        <button type="button" onClick={onSelect} className="text-left">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">{product.name}</h3>
            <div className="flex items-center gap-1 text-amber-500">
              <Icon name="star" filled className="!text-sm" />
              <span className="font-label-md text-label-md text-on-surface">
                {product.rating.toFixed(1)}
              </span>
            </div>
          </div>
          <p className="mb-2 line-clamp-2 font-body-sm text-body-sm text-on-surface-variant">
            {product.ingredients}
          </p>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded bg-surface-container px-2 py-0.5 font-label-sm text-label-sm text-on-surface-variant">
              {product.calories} kkal
            </span>
            <span className="rounded bg-surface-container px-2 py-0.5 font-label-sm text-label-sm text-on-surface-variant">
              {product.volumeMl} ml
            </span>
          </div>
        </button>

        <div className="flex items-center justify-between border-t border-outline-variant/60 pt-3">
          <div>
            <span className="block font-label-sm text-label-sm text-outline">Harga</span>
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {formatRupiah(product.basePrice)}
            </span>
          </div>
          {selected ? (
            <button
              type="button"
              onClick={onSelect}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container active:scale-95"
            >
              <Icon name="tune" className="!text-sm" />
              <span>Kustomisasi</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={quickAdd}
              disabled={pending}
              className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-surface-container-low px-3.5 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-primary hover:text-on-primary active:scale-95 disabled:opacity-50"
            >
              <Icon name="add_shopping_cart" className="!text-sm" />
              <span>{pending ? "..." : "Tambah"}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
