"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/menu/ProductCard";
import { CustomizePanel } from "@/components/menu/CustomizePanel";
import type { ProductWithOptions } from "@/lib/products";

export function MenuBrowser({ products }: { products: ProductWithOptions[] }) {
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["Semua Menu", ...Array.from(set)];
  }, [products]);

  const [activeCategory, setActiveCategory] = useState("Semua Menu");
  const [selectedId, setSelectedId] = useState<string | null>(products[0]?.id ?? null);

  const filtered =
    activeCategory === "Semua Menu"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const selectedProduct = products.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-jj-text">Pilih Kategori Menu</h2>
          <span className="text-xs text-jj-muted">Menampilkan {filtered.length} menu</span>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${
                activeCategory === cat
                  ? "border-jj-orange bg-jj-orange text-white"
                  : "border-jj-border text-jj-muted hover:bg-jj-bg"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              selected={product.id === selectedId}
              onSelect={() => setSelectedId(product.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <CustomizePanel product={selectedProduct} />
      </div>
    </div>
  );
}
