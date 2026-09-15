"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/menu/ProductCard";
import { CustomizeModal } from "@/components/menu/CustomizeModal";
import type { ProductWithOptions } from "@/lib/products";

export function MenuBrowser({
  products,
  isLoggedIn,
}: {
  products: ProductWithOptions[];
  isLoggedIn: boolean;
}) {
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["Semua Menu", ...Array.from(set)];
  }, [products]);

  const [activeCategory, setActiveCategory] = useState("Semua Menu");
  const [modalProductId, setModalProductId] = useState<string | null>(null);

  const filtered =
    activeCategory === "Semua Menu"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const modalProduct = products.find((p) => p.id === modalProductId) ?? null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Pilih Kategori Menu</h2>
        <span className="font-label-md text-label-md text-outline">
          Menampilkan {filtered.length} Menu
        </span>
      </div>

      <div className="scrollbar-none mb-space-lg flex items-center gap-2.5 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap rounded-full px-4 py-2 font-label-lg text-label-lg transition-colors ${
              activeCategory === cat
                ? "bg-primary text-on-primary shadow-xs"
                : "border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-space-lg sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isLoggedIn={isLoggedIn}
            onCustomize={() => setModalProductId(product.id)}
          />
        ))}
      </div>

      <CustomizeModal
        product={modalProduct}
        isLoggedIn={isLoggedIn}
        onClose={() => setModalProductId(null)}
      />
    </div>
  );
}
