"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/app/actions/cart-actions";
import { formatRupiah } from "@/lib/pricing";
import type { ProductWithOptions } from "@/lib/products";

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
    <div
      className={`jj-card flex flex-col gap-3 p-4 transition-shadow hover:shadow-md ${
        selected ? "border-jj-orange ring-1 ring-jj-orange" : ""
      }`}
    >
      <button type="button" onClick={onSelect} className="flex flex-col gap-3 text-left">
        <div className="relative flex h-32 w-full items-center justify-center rounded-xl bg-jj-bg text-5xl">
          {product.image}
          {product.tag && (
            <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-jj-orange-dark shadow-sm">
              {product.tag}
            </span>
          )}
          <span className="absolute right-2 top-2 rounded-full bg-jj-gold-bg px-2 py-0.5 text-[10px] font-semibold text-jj-gold">
            +{product.pointsBadge} Poin
          </span>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <p className="font-semibold text-jj-text">{product.name}</p>
            <span className="text-xs text-jj-gold">★ {product.rating.toFixed(1)}</span>
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-jj-muted">{product.ingredients}</p>
          <p className="mt-0.5 text-[11px] text-jj-muted">
            {product.calories} kkal · {product.volumeMl}ml
          </p>
        </div>
      </button>

      <div className="mt-auto flex items-center justify-between">
        <span className="font-bold text-jj-text">{formatRupiah(product.basePrice)}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSelect}
            className="rounded-full border border-jj-border px-3 py-1.5 text-xs font-semibold text-jj-orange-dark hover:bg-jj-bg"
          >
            Kustomisasi
          </button>
          <button
            type="button"
            onClick={quickAdd}
            disabled={pending}
            className="jj-btn-primary flex h-8 w-8 items-center justify-center rounded-full text-white disabled:opacity-60"
            aria-label={`Tambah ${product.name}`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
