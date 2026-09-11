import Link from "next/link";
import { getActiveProducts } from "@/lib/products";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { requireCurrentUser } from "@/lib/current-user";
import { TIER_CONFIG } from "@/lib/tiers";

export default async function MenuPage() {
  const user = await requireCurrentUser();
  const products = await getActiveProducts();
  const tier = TIER_CONFIG[user.tier];

  return (
    <div className="flex flex-col gap-8">
      <section className="jj-card flex flex-col gap-6 overflow-hidden p-6 sm:p-8 lg:flex-row lg:items-center">
        <div className="flex-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-jj-green-bg px-3 py-1 text-xs font-semibold text-jj-green">
            ✓ 100% Organik &amp; Cold-Pressed Segar Tiap Subuh
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-jj-text sm:text-4xl">
            100% Jus Murni Cold-Pressed &amp; Dapatkan Poin Setiap Tegukan!
          </h1>
          <p className="mt-3 max-w-xl text-sm text-jj-muted">
            Dibuat dari hasil panen lokal pilihan tanpa pemanis buatan, tanpa pengawet, dan tanpa
            setetes air pun. Nutrisi hidup murni langsung ke botol kaca Anda.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="#kategori"
              className="jj-btn-primary rounded-full px-5 py-2.5 text-sm font-semibold text-white"
            >
              🛍 Pesan Sekarang
            </a>
            <Link
              href="/rewards"
              className="rounded-full border border-jj-border px-5 py-2.5 text-sm font-semibold text-jj-orange-dark hover:bg-jj-bg"
            >
              🎁 Klaim Bonus Poin
            </Link>
          </div>
        </div>

        <div className="jj-card flex w-full max-w-sm items-center gap-3 border-jj-gold-bg bg-jj-gold-bg/60 p-4">
          <span className="text-2xl">🏅</span>
          <div className="text-sm">
            <p className="font-semibold text-jj-gold">Member {tier.label} Active</p>
            <p className="text-xs text-jj-gold">
              Cashback poin {tier.multiplier}x hari ini · Saldo {user.points.toLocaleString("id-ID")}{" "}
              pts
            </p>
          </div>
        </div>
      </section>

      <section id="kategori">
        <MenuBrowser products={products} />
      </section>

      <section className="jj-card flex flex-col items-start gap-4 bg-gradient-to-r from-jj-orange to-jj-pink p-8 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
            Joy &amp; Juice Rewards Program
          </span>
          <h3 className="mt-3 text-2xl font-bold">Tukar Poin dengan Jus Gratis &amp; Diskon Eksklusif</h3>
          <p className="mt-2 max-w-xl text-sm text-white/90">
            Setiap Rp10.000 belanja bernilai 10 poin. Kumpulkan poin dan tukarkan di halaman
            Rewards tanpa syarat tersembunyi.
          </p>
        </div>
        <Link
          href="/rewards"
          className="whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-jj-orange-dark"
        >
          Buka Rewards →
        </Link>
      </section>
    </div>
  );
}
