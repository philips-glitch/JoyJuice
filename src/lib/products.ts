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
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });

  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
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
