import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { getCartCount } from "@/lib/cart";
import { logoutAction } from "@/app/actions/auth-actions";
import { NavLinks } from "@/components/NavLinks";

export async function Navbar() {
  const user = await getCurrentUser();
  const cartCount = user ? await getCartCount(user.id) : 0;
  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-jj-border bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/menu" className="flex items-center gap-2 font-extrabold text-jj-orange-dark">
          <span className="text-2xl">🧃</span>
          <span className="text-lg">Joy &amp; Juice</span>
        </Link>

        <NavLinks />

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden items-center gap-1 rounded-full bg-jj-gold-bg px-3 py-1.5 text-xs font-semibold text-jj-gold sm:flex">
              ⭐ Points: {user.points.toLocaleString("id-ID")} pts
            </span>
          )}

          <Link
            href="/checkout"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-jj-border text-jj-text hover:bg-jj-bg"
            aria-label="Keranjang"
          >
            🛒
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-jj-pink text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-jj-orange text-xs font-bold text-white"
                title={user.name}
              >
                {initials}
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full border border-jj-border px-3 py-1.5 text-xs font-semibold text-jj-muted hover:bg-jj-bg"
                >
                  Keluar
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="jj-btn-primary rounded-full px-4 py-2 text-xs font-semibold text-white"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
