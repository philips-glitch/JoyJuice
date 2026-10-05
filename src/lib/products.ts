import { prisma } from "@/lib/prisma";
import { parseSizes, parseToppings, type SizeOption, type ToppingOption } from "@/lib/menu-options";

export type ProductWithOptions = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  ingredients: string;
  image: string;
  basePrice: number;
  calories: number;
  volumeMl: number;
  rating: number;
  tag: string | null;
  pointsBadge: number;
  sizes: SizeOption[];
  toppings: ToppingOption[];
};

export async function getActiveProducts(): Promise<ProductWithOptions[]> {
  // Ordered by category first so MenuBrowser's tabs follow the admin's sort
  // order; products in a hidden category drop off the menu entirely.
  const products = await prisma.product.findMany({
    where: { active: true, category: { active: true } },
    orderBy: [{ category: { sortOrder: "asc" } }, { createdAt: "asc" }],
    include: { category: { select: { name: true } } },
  });

  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category.name,
    description: p.description,
    ingredients: p.ingredients,
    image: p.image,
    basePrice: p.basePrice,
    calories: p.calories,
    volumeMl: p.volumeMl,
    rating: p.rating,
    tag: p.tag,
    pointsBadge: p.pointsBadge,
    sizes: parseSizes(p.sizes),
    toppings: parseToppings(p.toppings),
  }));
}
