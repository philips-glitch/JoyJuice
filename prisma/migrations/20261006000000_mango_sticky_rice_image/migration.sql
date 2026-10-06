-- Swap the placeholder photo for the real Mango Sticky Rice poster, unless
-- an admin has already set a different image.
UPDATE "Product"
SET "image" = '/products/mango-sticky-rice.jpg'
WHERE "slug" = 'mango-sticky-rice' AND "image" = '/products/mangga.jpg';
