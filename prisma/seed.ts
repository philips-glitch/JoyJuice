import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const REGULAR_LARGE_SIZES = JSON.stringify([
  { id: "reg", label: "Reguler 350ml", priceDelta: 0 },
  { id: "large", label: "Large 500ml", priceDelta: 12_000 },
]);

const SHOT_SIZES = JSON.stringify([
  { id: "reg", label: "Reguler 100ml", priceDelta: 0 },
  { id: "large", label: "Large 200ml", priceDelta: 15_000 },
]);

const STANDARD_TOPPINGS = JSON.stringify([
  { id: "chia", label: "Organic Chia Seeds", priceDelta: 5_000 },
  { id: "collagen", label: "Hydrolyzed Marine Collagen", priceDelta: 10_000 },
]);

const products = [
  {
    slug: "green-detox-glow",
    name: "Green Detox Glow",
    category: "Detox & Cleanses",
    description: "Kale, Apel Hijau, Mentimun, Lemon, Jahe",
    ingredients: "Kale, Apel Hijau, Mentimun, Lemon, Jahe",
    image: "🥬",
    basePrice: 38_000,
    calories: 110,
    volumeMl: 350,
    rating: 4.9,
    tag: "Detox Favorit",
    pointsBadge: 38,
    sizes: REGULAR_LARGE_SIZES,
    toppings: STANDARD_TOPPINGS,
  },
  {
    slug: "citrus-sunshine-burst",
    name: "Citrus Sunshine Burst",
    category: "Cold-Pressed",
    description: "Jeruk Valencia, Wortel Organik, Kunyit, Nanas",
    ingredients: "Jeruk Valencia, Wortel Organik, Kunyit, Nanas",
    image: "🍊",
    basePrice: 35_000,
    calories: 135,
    volumeMl: 350,
    rating: 4.8,
    tag: "Vitamin C Tinggi",
    pointsBadge: 35,
    sizes: REGULAR_LARGE_SIZES,
    toppings: STANDARD_TOPPINGS,
  },
  {
    slug: "berry-vitality-booster",
    name: "Berry Vitality Booster",
    category: "Smoothies & Bowls",
    description: "Strawberry, Blueberry, Acai, Chia Seeds, Air Kelapa",
    ingredients: "Strawberry, Blueberry, Acai, Chia Seeds, Air Kelapa",
    image: "🍓",
    basePrice: 45_000,
    calories: 160,
    volumeMl: 350,
    rating: 5.0,
    tag: "Superfood",
    pointsBadge: 45,
    sizes: REGULAR_LARGE_SIZES,
    toppings: STANDARD_TOPPINGS,
  },
  {
    slug: "dragon-power-smoothie",
    name: "Dragon Power Smoothie",
    category: "Smoothies & Bowls",
    description: "Buah Naga Merah, Pisang, Oat Milk, Madu Hutan",
    ingredients: "Buah Naga Merah, Pisang, Oat Milk, Madu Hutan",
    image: "🐉",
    basePrice: 40_000,
    calories: 210,
    volumeMl: 400,
    rating: 4.7,
    tag: "Plant Milk",
    pointsBadge: 40,
    sizes: REGULAR_LARGE_SIZES,
    toppings: STANDARD_TOPPINGS,
  },
  {
    slug: "ginger-turmeric-immunity-shot",
    name: "Ginger Turmeric Immunity Shot",
    category: "Immune Boosters",
    description: "Jahe Merah, Kunyit Asam, Jeruk Nipis, Lada Hitam",
    ingredients: "Jahe Merah, Kunyit Asam, Jeruk Nipis, Lada Hitam",
    image: "🫚",
    basePrice: 25_000,
    calories: 45,
    volumeMl: 100,
    rating: 4.9,
    tag: "Anti-Inflamasi",
    pointsBadge: 25,
    sizes: SHOT_SIZES,
    toppings: JSON.stringify([]),
  },
  {
    slug: "almond-creamy-protein",
    name: "Almond Creamy Protein",
    category: "Smoothies & Bowls",
    description: "Raw Almond, Vanilla Bean, Kurma Medjool, Garam Himalaya",
    ingredients: "Raw Almond, Vanilla Bean, Kurma Medjool, Garam Himalaya",
    image: "🌰",
    basePrice: 48_000,
    calories: 240,
    volumeMl: 350,
    rating: 4.9,
    tag: "Dairy Free",
    pointsBadge: 48,
    sizes: REGULAR_LARGE_SIZES,
    toppings: STANDARD_TOPPINGS,
  },
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
