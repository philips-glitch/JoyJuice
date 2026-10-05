import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/Icon";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProductAction } from "@/app/actions/admin/products-actions";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, active: true },
  });

  return (
    <div className="flex flex-col gap-space-lg">
      <div>
        <Link
          href="/admin/products"
          className="mb-2 flex w-fit items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary"
        >
          <Icon name="arrow_back" className="!text-base" /> Kembali ke Products
        </Link>
        <h1 className="flex items-center gap-2 font-headline-md text-headline-md text-on-surface">
          <Icon name="add_circle" className="text-primary" /> Produk Baru
        </h1>
      </div>

      <div className="max-w-3xl rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-sm">
        <ProductForm mode="create" categories={categories} action={createProductAction} />
      </div>
    </div>
  );
}
