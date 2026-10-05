import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/Icon";
import { CategoriesTable } from "@/components/admin/CategoriesTable";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category
    .findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        active: true,
        _count: { select: { products: true } },
      },
    })
    .then((rows) =>
      rows.map(({ _count, ...c }) => ({ ...c, productCount: _count.products })),
    );

  return (
    <div className="flex flex-col gap-space-lg">
      <div>
        <h1 className="flex items-center gap-2 font-headline-md text-headline-md text-on-surface">
          <Icon name="category" className="text-primary" /> Categories
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {categories.length} kategori ({categories.filter((c) => c.active).length} tampil di
          menu). Urutan di sini = urutan tab di halaman menu.
        </p>
      </div>

      <CategoriesTable categories={categories} />
    </div>
  );
}
