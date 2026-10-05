-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- Carry over the free-text categories already on products, keeping the order
-- they appeared on the menu (first product created in each comes first).
-- Seasonal Menu takes slot 0 so it leads the tabs.
INSERT INTO "Category" ("id", "name", "sortOrder")
SELECT 'cat_' || md5(c."category"), c."category", ROW_NUMBER() OVER (ORDER BY c."firstCreated")
FROM (
    SELECT "category", MIN("createdAt") AS "firstCreated" FROM "Product" GROUP BY "category"
) c;

INSERT INTO "Category" ("id", "name", "sortOrder")
VALUES ('cat_seasonal_menu', 'Seasonal Menu', 0)
ON CONFLICT ("name") DO NOTHING;

-- AlterTable: swap the free-text column for a foreign key
ALTER TABLE "Product" ADD COLUMN "categoryId" TEXT;

UPDATE "Product" p SET "categoryId" = c."id" FROM "Category" c WHERE c."name" = p."category";

ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "Product" DROP COLUMN "category";

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seasonal launch item
INSERT INTO "Product" (
    "id", "slug", "name", "categoryId", "description", "ingredients", "image",
    "basePrice", "calories", "volumeMl", "rating", "tag", "pointsBadge", "sizes", "toppings"
)
SELECT
    'prod_mango_sticky_rice', 'mango-sticky-rice', 'Mango Sticky Rice', c."id",
    'Mangga harum, ketan, santan kelapa', 'Mangga harum, ketan, santan kelapa', '/products/mangga.jpg',
    20000, 180, 250, 4.8, 'Seasonal', 20,
    '[{"id":"250ml","label":"Botol 250ml","priceDelta":0}]', '[]'
FROM "Category" c
WHERE c."name" = 'Seasonal Menu'
ON CONFLICT ("slug") DO NOTHING;
