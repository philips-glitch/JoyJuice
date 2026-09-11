# Joy & Juice

A cold-pressed juice ordering app with a real loyalty points program: browse the menu, customize
and add drinks to your cart, check out through a 3-step flow (cart → shipping → payment & points),
and track/redeem points from a Loyalty Portal and Rewards catalog.

Built with **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Prisma/Postgres + Auth.js
(NextAuth v5, Credentials provider)**.

## Getting started

The app needs a real Postgres database (it originally used local SQLite, but that doesn't survive
on serverless hosts like Vercel — see [Deploying to Vercel](#deploying-to-vercel) below for the
easiest way to get one).

```bash
npm install
# put a real Postgres connection string + AUTH_SECRET in .env (see .env.example)
npx prisma migrate deploy   # applies the schema to your database
npm run db:seed             # seeds products, reward catalog, and demo accounts
npm run dev
```

Open http://localhost:3000. You'll be redirected to `/login` — either sign up a new account or
use one of the seeded demo accounts (login accepts **username or email**):

| Username | Password | Role | Notes |
|---|---|---|---|
| `customer` | `123456` | Customer | Fresh account, 0 points, Bronze tier |
| `admin` | `123456` | Admin | `role: ADMIN` in the database — no admin-only UI is wired up yet (see below) |
| `budisantoso` (or `budi.santoso@email.com`) | `password123` | Customer | 450 points, Gold tier — matches the original mockups |

`.env` is gitignored on purpose (it holds real secrets) — see `.env.example` for the two variables
you need: `DATABASE_URL` and `AUTH_SECRET`.

## Deploying to Vercel

1. **Import the repo** into Vercel as a new project.
2. **Add a database** — in the project's **Storage** tab, add **Prisma Postgres** from the Vercel
   Marketplace. This automatically sets `DATABASE_URL` for Production, Preview, and Development.
3. **Set `AUTH_SECRET`** — Project Settings → Environment Variables → add `AUTH_SECRET` for all
   three environments. Generate one with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   This step is what was missing when you saw *"There was a problem with the server
   configuration"* on login — that's Auth.js's generic error for a missing/invalid `AUTH_SECRET`.
4. **Redeploy.** The `build` script (`prisma migrate deploy && next build`) applies the schema to
   your new database automatically on every deploy — no manual migration step needed.
5. **Seed the production database once** — pull the env vars locally and run the seed script
   against them:
   ```bash
   npx vercel link
   npx vercel env pull .env
   npm run db:seed
   ```

For local development against the same database, run `npx vercel env pull .env` any time to sync
your local `.env` with what's configured in Vercel.

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
- **Accounts have a `username` (required, unique) and an optional `email`.** Login accepts either.
  Every `User` also has a `role` (`CUSTOMER` | `ADMIN`) in the schema; the seeded `admin` account is
  flagged `ADMIN` but there's no admin-only page or permission check using it yet — that's ready
  for whenever you want an actual admin panel (e.g. Admin Orders) built on top of it.
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
- `npm audit` reports a high-severity advisory in `deepmerge-ts` (a transitive dependency of the
  Prisma CLI's config loader) — it's a build-time-only dependency (stack-exhaustion DoS), not
  something exposed to end users of the running app, but worth revisiting when Prisma ships a fix.
- Next.js 16 is very new (released after my training data); I cross-checked the APIs I used
  (Server Actions, the `proxy.ts` rename, route props) against the docs bundled in
  `node_modules/next/dist/docs` rather than assuming — worth doing the same if you upgrade further.
