import Link from "next/link";
import Image from "next/image";
import { getActiveProducts } from "@/lib/products";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { getCurrentUser } from "@/lib/current-user";
import { getTierConfigMap } from "@/lib/tier-config.server";
import { Icon } from "@/components/Icon";

// 085360564737 in international format (leading 0 → 62), as wa.me requires.
const OPEN_PO_WHATSAPP_URL = `https://wa.me/6285360564737?text=${encodeURIComponent(
  "Halo Joy & Juice, saya mau Open PO.\nVarian: \nJumlah botol: \nTanggal kirim/ambil: ",
)}`;

export default async function MenuPage() {
  // Anyone can browse the menu — registration is only required to actually
  // transact (add to cart, checkout). getCurrentUser() returns null instead
  // of redirecting, so the hero banner below has an explicit guest state.
  const user = await getCurrentUser();
  const [products, tierConfig] = await Promise.all([getActiveProducts(), getTierConfigMap()]);
  const tier = user ? tierConfig[user.tier] : null;

  return (
    <div className="flex flex-col gap-space-xl">
      {/* HERO BANNER */}
      <section className="relative overflow-hidden rounded-xl border border-outline-variant/60 bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-container-high p-6 shadow-sm md:p-10">
        <div className="pointer-events-none absolute -top-20 -right-20 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="pointer-events-none absolute right-40 -bottom-20 h-80 w-80 rounded-full bg-rose-200/30 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          <div className="flex flex-col items-start gap-4 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1 font-label-md text-label-md text-primary shadow-xs">
              <Icon name="verified" filled className="!text-sm text-emerald-600" />
              <span>Segar, Nikmat, Penuh Kebaikan Buah!</span>
            </div>
            <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-background sm:font-display-lg sm:text-display-lg">
              Kesegaran Buah Pilihan dalam Setiap Botol!
            </h1>
            <p className="max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
              Nikmati perpaduan buah pilihan dengan rasa yang segar, nikmat, dan menyegarkan kapan
              saja.
            </p>

            <div className="flex items-center gap-3 rounded-lg border border-amber-300/80 bg-amber-50 p-3 text-amber-950">
              <Icon name="loyalty" filled className="font-bold text-secondary" />
              <span className="font-label-lg text-label-lg font-bold">
                Promo Spesial: Dapatkan 1 botol jus 250 ml setiap pembelian 15 jus
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-space-md pt-2">
              <a
                href="#kategori"
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-label-lg text-label-lg text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95"
              >
                <Icon name="local_mall" className="!text-sm" />
                <span>Pesan Sekarang</span>
              </a>
              <Link
                href={user ? "/loyalty" : "/signup"}
                className="flex items-center gap-2 rounded-lg bg-secondary px-5 py-3 font-label-lg text-label-lg text-white shadow-sm transition-all hover:bg-rose-700 active:scale-95"
              >
                <Icon name="redeem" filled className="!text-sm" />
                <span>{user ? "Klaim Bonus Poin Member Baru" : "Daftar & Klaim Bonus Poin"}</span>
              </Link>
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <div className="relative mx-auto overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-md">
              <div className="relative flex h-80 w-full items-end justify-center gap-1.5 overflow-hidden bg-gradient-to-br from-amber-100 via-rose-50 to-emerald-50 p-3 pt-16 sm:gap-4 sm:p-6">
                {[
                  {
                    src: "/products/mangga.jpg",
                    alt: "Mangga",
                    label: "Mangga",
                    tagClass: "bg-amber-400 text-amber-950",
                  },
                  {
                    src: "/products/jambu-merah.jpg",
                    alt: "Jambu Merah",
                    label: "Jambu Merah",
                    tagClass: "bg-rose-500 text-white",
                  },
                  {
                    src: "/products/nanas-strawberry.jpg",
                    alt: "Nanas + Strawberry",
                    label: "Nanas + Strawberry",
                    tagClass: "bg-orange-400 text-orange-950",
                  },
                ].map((photo) => (
                  <div key={photo.src} className="relative flex flex-shrink-0 flex-col items-center gap-2">
                    <span
                      className={`-rotate-3 whitespace-nowrap rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold shadow-sm sm:px-2.5 sm:py-1 sm:font-label-sm sm:text-label-sm ${photo.tagClass}`}
                    >
                      {photo.label}
                    </span>
                    <div className="relative h-48 w-16 overflow-hidden rounded-lg border-2 border-white shadow-lg sm:h-56 sm:w-24">
                      <Image src={photo.src} alt={photo.alt} fill sizes="120px" className="object-cover" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-3 p-3.5">
                  {user && tier ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                          <Icon name="nature_people" filled />
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">
                            Member {tier.label} Active
                          </p>
                          <p className="font-body-sm text-body-sm text-outline">
                            Cashback Poin {tier.multiplier}x Hari Ini
                          </p>
                        </div>
                      </div>
                      <span className="h-8 w-px flex-shrink-0 bg-outline-variant" />
                      <div className="flex flex-col items-end">
                        <span className="font-label-sm text-label-sm text-outline">Saldo</span>
                        <span className="font-headline-sm text-headline-sm font-bold text-primary">
                          {user.points.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                          <Icon name="person_add" filled />
                        </div>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">
                            Belum Punya Akun?
                          </p>
                          <p className="font-body-sm text-body-sm text-outline">
                            Daftar untuk mulai pesan &amp; kumpulkan poin
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/signup"
                        className="font-label-lg text-label-lg font-bold text-primary hover:underline"
                      >
                        Daftar →
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="kategori">
        <MenuBrowser products={products} isLoggedIn={!!user} />
      </section>

      {/* OPEN PO — bulk / event / advance orders are handled by hand over WhatsApp */}
      <section
        id="open-po"
        className="flex flex-col items-start gap-5 rounded-xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm md:flex-row md:items-center md:justify-between md:p-8"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Icon name="event_available" filled />
          </div>
          <div className="flex flex-col gap-1">
            <span className="w-fit rounded-full bg-emerald-600 px-3 py-0.5 font-label-sm text-label-sm font-bold uppercase tracking-wider text-white">
              Open PO
            </span>
            <h2 className="font-headline-sm text-headline-sm text-emerald-950">
              Pesan Jus untuk Acara, Kantor, atau Stok Mingguan
            </h2>
            <p className="max-w-2xl font-body-md text-body-md text-emerald-900/80">
              Butuh banyak botol atau mau pesan dari jauh hari? Chat kami langsung via WhatsApp —
              kami bantu atur varian, jumlah, dan jadwal pengirimannya.
            </p>
          </div>
        </div>
        <a
          href={OPEN_PO_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-shrink-0 items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 font-label-lg text-label-lg font-bold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-95"
        >
          <Icon name="chat" filled className="!text-base" />
          <span>Chat WhatsApp untuk PO</span>
        </a>
      </section>

      {/* LOYALTY CLUB CALLOUT BANNER */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-secondary p-8 text-white shadow-sm md:p-10">
        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-1/3 items-center justify-center opacity-10">
          <Icon name="card_membership" className="!text-[9rem]" />
        </div>
        <div className="relative z-10 flex max-w-2xl flex-col items-start gap-3">
          <span className="rounded-full bg-amber-300 px-3 py-1 font-label-sm text-label-sm font-bold uppercase tracking-wider text-amber-950">
            Joy &amp; Juice Rewards Program
          </span>
          <h2 className="font-headline-lg text-headline-lg text-white">
            Tukar Poin dengan Jus Gratis &amp; Diskon Eksklusif
          </h2>
          <p className="font-body-md text-body-md text-orange-50">
            Setiap Rp 10.000 belanja bernilai 10 poin. Kumpulkan 500 poin dan klaim 1 botol Jus
            Cold-Pressed reguler pilihan Anda tanpa syarat tersembunyi.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <Link
              href="/loyalty"
              className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 font-label-lg text-label-lg font-bold text-orange-600 shadow-sm transition-colors hover:bg-amber-50"
            >
              <Icon name="stars" filled className="!text-sm text-amber-500" />
              <span>Buka Loyalty Portal</span>
            </Link>
            <Link
              href="/rewards"
              className="font-label-lg text-label-lg text-white underline underline-offset-4 transition-colors hover:text-amber-200"
            >
              Lihat Katalog Hadiah &amp; Level Member →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
