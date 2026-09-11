# Joy & Juice

A cold-pressed juice ordering app with a real loyalty points program: browse the menu, customize
and add drinks to your cart, check out through a 3-step flow (cart → shipping → payment & points),
and track/redeem points from a Loyalty Portal and Rewards catalog.

Built with **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Prisma/SQLite + Auth.js
(NextAuth v5, Credentials provider)**.

## Getting started

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db and applies the schema
npm run db:seed          # seeds products, reward catalog, and a demo account
npm run dev
```

Open http://localhost:3000. You'll be redirected to `/login` — either sign up a new account or
use the seeded demo account:

- **Email:** `budi.santoso@email.com`
- **Password:** `password123`
- Starts with 450 points and Gold tier, matching the original mockups.

`.env` is already created for local dev (SQLite file + a generated `AUTH_SECRET`). See
`.env.example` if you need to recreate it.

## Pages

| Route | Description |
|---|---|
| `/login`, `/signup` | Real email+password auth (bcrypt-hashed, Auth.js JWT sessions). |
| `/menu` | Hero banner, category filters, product grid, and a live customization panel (size, ice level, sweetness, toppings). |
| `/checkout` | 3-step flow: **Keranjang** (edit quantities) → **Pengiriman** (instant courier / pickup, address, WhatsApp) → **Pembayaran & Poin** (payment method + point redemption), with a live order summary. |
| `/orders/[id]` | Order confirmation / receipt after checkout. |
| `/loyalty` | Points balance, tier progress bar, and full points transaction history. Includes a one-time "claim welcome bonus" action. |
| `/rewards` | Points redemption catalog (free juice, free shipping, merchandise, etc.). |

Admin Orders (visible in the original screenshots' nav) was intentionally left out of this build's
scope per your answers — happy to add it next if useful.

## Business rules & assumptions

The screenshots implied a loyalty math model but didn't fully specify it. I made the following
reasonable, easy-to-retune choices — see [`src/lib/tiers.ts`](src/lib/tiers.ts) and
[`src/lib/pricing.ts`](src/lib/pricing.ts):

- **Tiers** are derived from lifetime points earned (never decreases on redemption): Bronze (0+),
  Silver (150+, 1.25x points, Rp5.000 checkout discount), Gold (400+, 1.5x, Rp10.000), Platinum
  (800+, 2x, Rp20.000).
- **Points earned** per order = `floor((subtotal − member discount − points-redeemed discount) / 1000) × tier multiplier`.
- **Point redemption** is a fixed block of 100 points for Rp10.000 off (1 point = Rp100), toggled
  with a single checkbox — matching the mockup. It's written generically (`REDEEM_BLOCK_SIZE` in
  `tiers.ts`) if you'd rather allow partial/variable redemption later.
- **PPN 11% & packaging** are noted as already included in listed prices (as the mockup's footnote
  says), not added as a separate line item.
- **Payment methods** (QRIS / Virtual Account / Manual Transfer) are UI-only simulations — placing
  an order marks it `PAID` immediately. No real payment gateway is wired up (that's a deliberate
  scope decision; integrating Midtrans/Xendit/etc. would be the natural next step).
- **Product photos** are emoji placeholders instead of real photography/stock images, so nothing
  was downloaded from the web without your say-so. Swap `Product.image` in
  `prisma/seed.ts` for real image URLs whenever you have assets.

## Project structure

```
prisma/schema.prisma       Data model (User, Product, CartItem, Order, PointsTransaction, RewardItem, ...)
prisma/seed.ts             Seeds the 6 menu products, reward catalog, and demo account
src/auth.ts / auth.config.ts   Auth.js (NextAuth v5) config — split so proxy.ts stays lightweight
src/proxy.ts                Route guard (Next.js 16 renamed `middleware.ts` → `proxy.ts`)
src/lib/                    Business logic: pricing, tiers, cart, products, current-user helpers
src/app/actions/            Server Actions: auth, cart, checkout, loyalty, rewards
src/app/(shop)/             Menu, checkout, loyalty, rewards, orders — all behind the Navbar layout
src/components/             UI split by feature (menu, checkout, loyalty, rewards, auth)
```

## Known limitations / good next steps

- No real payment processing (see above).
- SQLite is great for local dev but is a single file — move to Postgres before deploying with
  multiple instances.
- `npm audit` reports a high-severity advisory in `deepmerge-ts` (a transitive dependency of the
  Prisma CLI's config loader) — it's a build-time-only dependency (stack-exhaustion DoS), not
  something exposed to end users of the running app, but worth revisiting when Prisma ships a fix.
- Next.js 16 is very new (released after my training data); I cross-checked the APIs I used
  (Server Actions, the `proxy.ts` rename, route props) against the docs bundled in
  `node_modules/next/dist/docs` rather than assuming — worth doing the same if you upgrade further.
