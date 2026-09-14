import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/Icon";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProductAction } from "@/app/actions/admin/products-actions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.product
      .findMany({ distinct: ["category"], select: { category: true } })
      .then((rows) => rows.map((r) => r.category)),
  ]);

  if (!product) notFound();

  const initialValues = {
    name: product.name,
    slug: product.slug,
    category: product.category,
    description: product.description,
    ingredients: product.ingredients,
    image: product.image,
    basePrice: product.basePrice,
    calories: product.calories,
    volumeMl: product.volumeMl,
    rating: product.rating,
    tag: product.tag ?? "",
    pointsBadge: product.pointsBadge,
    active: product.active,
    sizes: JSON.parse(product.sizes),
    toppings: JSON.parse(product.toppings),
  };

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
          <Icon name="edit" className="text-primary" /> Edit: {product.name}
        </h1>
      </div>

      <div className="max-w-3xl rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-sm">
        <ProductForm
          mode="edit"
          categories={categories}
          initialValues={initialValues}
          action={updateProductAction.bind(null, id)}
        />
      </div>
    </div>
  );
}
