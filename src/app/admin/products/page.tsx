import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/Icon";
import { ProductsTable } from "@/components/admin/ProductsTable";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      image: true,
      basePrice: true,
      active: true,
    },
  });

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-headline-md text-headline-md text-on-surface">
            <Icon name="local_drink" className="text-primary" /> Products
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {products.length} produk terdaftar ({products.filter((p) => p.active).length} aktif).
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 font-label-lg text-label-lg text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95"
        >
          <Icon name="add" className="!text-base" />
          Produk Baru
        </Link>
      </div>

      <ProductsTable products={products} />
    </div>
  );
}
