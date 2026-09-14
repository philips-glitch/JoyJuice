import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const BOTTLE_250ML = JSON.stringify([{ id: "250ml", label: "Botol 250ml", priceDelta: 0 }]);

const NO_TOPPINGS = JSON.stringify([]);

// Real bottled-juice catalog + photography (public/products/<slug>.jpg,
// cropped from the composite reference image you shared).
const products = [
  {
    slug: "nanas-strawberry",
    name: "Nanas + Strawberry",
    category: "Buah & Sayur",
    description: "Nanas segar, Strawberry",
    ingredients: "Nanas segar, Strawberry",
    image: "/products/nanas-strawberry.jpg",
    basePrice: 22_000,
    calories: 120,
    volumeMl: 250,
    rating: 4.8,
    tag: "Favorit",
    pointsBadge: 22,
    sizes: BOTTLE_250ML,
    toppings: NO_TOPPINGS,
  },
  {
    slug: "nanas-wortel",
    name: "Nanas + Wortel",
    category: "Buah & Sayur",
    description: "Nanas segar, Wortel organik",
    ingredients: "Nanas segar, Wortel organik",
    image: "/products/nanas-wortel.jpg",
    basePrice: 20_000,
    calories: 105,
    volumeMl: 250,
    rating: 4.7,
    tag: "Segar",
    pointsBadge: 20,
    sizes: BOTTLE_250ML,
    toppings: NO_TOPPINGS,
  },
  {
    slug: "strawberry-wortel",
    name: "Strawberry + Wortel",
    category: "Buah & Sayur",
    description: "Strawberry segar, Wortel organik",
    ingredients: "Strawberry segar, Wortel organik",
    image: "/products/strawberry-wortel.jpg",
    basePrice: 23_000,
    calories: 100,
    volumeMl: 250,
    rating: 4.8,
    tag: "Vitamin C",
    pointsBadge: 23,
    sizes: BOTTLE_250ML,
    toppings: NO_TOPPINGS,
  },
  {
    slug: "jeruk-wortel",
    name: "Jeruk + Wortel",
    category: "Buah & Sayur",
    description: "Jeruk manis, Wortel organik",
    ingredients: "Jeruk manis, Wortel organik",
    image: "/products/jeruk-wortel.jpg",
    basePrice: 20_000,
    calories: 110,
    volumeMl: 250,
    rating: 4.9,
    tag: "Imunitas",
    pointsBadge: 20,
    sizes: BOTTLE_250ML,
    toppings: NO_TOPPINGS,
  },
  {
    slug: "jambu-merah",
    name: "Jambu Merah",
    category: "Buah Tropis",
    description: "Jambu biji merah pilihan",
    ingredients: "Jambu biji merah pilihan",
    image: "/products/jambu-merah.jpg",
    basePrice: 21_000,
    calories: 95,
    volumeMl: 250,
    rating: 4.8,
    tag: "Kaya Vitamin C",
    pointsBadge: 21,
    sizes: BOTTLE_250ML,
    toppings: NO_TOPPINGS,
  },
  {
    slug: "mangga",
    name: "Mangga",
    category: "Buah Tropis",
    description: "Mangga harum manis",
    ingredients: "Mangga harum manis",
    image: "/products/mangga.jpg",
    basePrice: 20_000,
    calories: 130,
    volumeMl: 250,
    rating: 4.9,
    tag: "Manis Alami",
    pointsBadge: 20,
    sizes: BOTTLE_250ML,
    toppings: NO_TOPPINGS,
  },
  {
    slug: "lemon-cia-seed",
    name: "Lemon Cia Seed",
    category: "Cia Seed Series",
    description: "Lemon segar, Chia Seed",
    ingredients: "Lemon segar, Chia Seed",
    image: "/products/lemon-cia-seed.jpg",
    basePrice: 25_000,
    calories: 90,
    volumeMl: 250,
    rating: 4.7,
    tag: "Detox",
    pointsBadge: 25,
    sizes: BOTTLE_250ML,
    toppings: NO_TOPPINGS,
  },
  {
    slug: "jeruk-cia-seed",
    name: "Jeruk Cia Seed",
    category: "Cia Seed Series",
    description: "Jeruk manis, Chia Seed",
    ingredients: "Jeruk manis, Chia Seed",
    image: "/products/jeruk-cia-seed.jpg",
    basePrice: 25_000,
    calories: 115,
    volumeMl: 250,
    rating: 4.8,
    tag: "Detox",
    pointsBadge: 25,
    sizes: BOTTLE_250ML,
    toppings: NO_TOPPINGS,
  },
  {
    slug: "terong-belanda",
    name: "Terong Belanda",
    category: "Buah Tropis",
    description: "Terong Belanda (Tamarillo)",
    ingredients: "Terong Belanda (Tamarillo)",
    image: "/products/terong-belanda.jpg",
    basePrice: 22_000,
    calories: 85,
    volumeMl: 250,
    rating: 4.6,
    tag: "Antioksidan",
    pointsBadge: 22,
    sizes: BOTTLE_250ML,
    toppings: NO_TOPPINGS,
  },
  {
    slug: "sirsak",
    name: "Sirsak",
    category: "Buah Tropis",
    description: "Sirsak segar",
    ingredients: "Sirsak segar",
    image: "/products/sirsak.jpg",
    basePrice: 23_000,
    calories: 110,
    volumeMl: 250,
    rating: 4.7,
    tag: "Kaya Serat",
    pointsBadge: 23,
    sizes: BOTTLE_250ML,
    toppings: NO_TOPPINGS,
  },
];

// Slugs no longer part of the menu — deactivated (not deleted) below so any
// past order history referencing them stays intact.
const RETIRED_PRODUCT_SLUGS = [
  "green-detox-glow",
  "citrus-sunshine-burst",
  "berry-vitality-booster",
  "dragon-power-smoothie",
  "ginger-turmeric-immunity-shot",
  "almond-creamy-protein",
];

const rewardItems = [
  {
    name: "1 Botol Jus Cold-Pressed Favorit",
    description: "Tukar poin dengan 1 botol jus cold-pressed reguler pilihanmu, gratis.",
    image: "🧃",
    pointsCost: 500,
    category: "Juice",
  },
  {
    name: "Gratis Ongkir Kurir Instan",
    description: "Potongan penuh biaya pengiriman instan untuk pesanan berikutnya.",
    image: "🚴",
    pointsCost: 150,
    category: "Shipping",
  },
  {
    name: "Upgrade Ukuran Large Gratis",
    description: "Upgrade otomatis ke ukuran Large tanpa biaya tambahan.",
    image: "⬆️",
    pointsCost: 100,
    category: "Upgrade",
  },
  {
    name: "Boks Insulasi Dingin Eksklusif",
    description: "Cold-insulated tote bag eksklusif member Joy & Juice.",
    image: "🎒",
    pointsCost: 300,
    category: "Merchandise",
  },
  {
    name: "Konsultasi Nutrisi 1-on-1",
    description: "Sesi konsultasi 30 menit bersama nutrisionis mitra Joy & Juice.",
    image: "🩺",
    pointsCost: 800,
    category: "Wellness",
  },
];

async function main() {
  console.log("Seeding products...");
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  console.log("Deactivating retired menu items...");
  const { count: retiredCount } = await prisma.product.updateMany({
    where: { slug: { in: RETIRED_PRODUCT_SLUGS } },
    data: { active: false },
  });
  console.log(`  -> deactivated ${retiredCount} old product(s)`);

  console.log("Seeding reward catalog...");
  for (const r of rewardItems) {
    const existing = await prisma.rewardItem.findFirst({ where: { name: r.name } });
    if (existing) {
      await prisma.rewardItem.update({ where: { id: existing.id }, data: r });
    } else {
      await prisma.rewardItem.create({ data: r });
    }
  }

  console.log("Seeding demo accounts...");
  const demoAccounts = [
    {
      username: "budisantoso",
      name: "Budi Santoso",
      email: "budi.santoso@email.com",
      phone: "+6281288992345",
      password: "password123",
      role: "CUSTOMER" as const,
      points: 450,
      lifetimePoints: 450,
      tier: "GOLD" as const,
    },
    {
      username: "customer",
      name: "Customer Demo",
      email: null,
      phone: null,
      password: "123456",
      role: "CUSTOMER" as const,
      points: 0,
      lifetimePoints: 0,
      tier: "BRONZE" as const,
    },
    {
      username: "admin",
      name: "Admin Joy & Juice",
      email: null,
      phone: null,
      password: "123456",
      role: "ADMIN" as const,
      points: 0,
      lifetimePoints: 0,
      tier: "BRONZE" as const,
    },
  ];

  for (const acc of demoAccounts) {
    const existing = await prisma.user.findUnique({ where: { username: acc.username } });
    if (existing) {
      console.log(`  -> ${acc.username} already exists, skipped`);
      continue;
    }
    const passwordHash = await bcrypt.hash(acc.password, 10);
    await prisma.user.create({
      data: {
        name: acc.name,
        username: acc.username,
        email: acc.email,
        phone: acc.phone,
        passwordHash,
        role: acc.role,
        points: acc.points,
        lifetimePoints: acc.lifetimePoints,
        tier: acc.tier,
      },
    });
    console.log(`  -> login: ${acc.username} / ${acc.password} (${acc.role})`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
