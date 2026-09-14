import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { getCartCount } from "@/lib/cart";
import { logoutAction } from "@/app/actions/auth-actions";
import { NavLinks } from "@/components/NavLinks";
import { MobileMenu } from "@/components/MobileMenu";
import { Icon } from "@/components/Icon";

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
    <header className="sticky top-0 z-30 border-b border-outline-variant/60 bg-surface-container-lowest/90 backdrop-blur relative">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-gutter sm:px-gutter-lg">
        <div className="flex flex-1 items-center gap-space-lg">
          <Link href="/menu" className="flex items-center gap-2">
            <span className="text-2xl">🧃</span>
            <span className="flex items-center gap-1 text-xl font-extrabold tracking-tight text-primary">
              Joy <span className="text-emerald-600">&amp;</span> Juice
            </span>
          </Link>

          <div className="relative hidden w-72 lg:block">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
              <Icon name="search" className="text-lg" />
            </span>
            <input
              type="text"
              placeholder="Cari jus segar, smoothie..."
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 font-body-sm text-body-sm text-on-surface transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <NavLinks isAdmin={user?.role === "ADMIN"} />

        <div className="flex items-center gap-space-sm sm:gap-space-md">
          {user && (
            <div className="hidden items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-3 py-1.5 font-label-md text-label-md text-amber-900 sm:flex">
              <Icon name="stars" filled className="!text-sm text-amber-600" />
              <span className="font-bold">Points: {user.points.toLocaleString("id-ID")} pts</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              aria-label="Notifications"
              className="relative rounded-full p-2 text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-low"
            >
              <Icon name="notifications" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-secondary" />
            </button>

            <Link
              href="/checkout"
              aria-label="Keranjang"
              className="relative rounded-full p-2 text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-low"
            >
              <Icon name="shopping_bag" />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary font-label-sm text-label-sm text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary"
                title={user.name}
              >
                {initials}
              </div>
            ) : (
              <button
                aria-label="Profile"
                className="rounded-full p-2 text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-low"
              >
                <Icon name="account_circle" />
              </button>
            )}
          </div>

          {user ? (
            <form action={logoutAction}>
              <button
                type="submit"
                className="hidden items-center justify-center rounded-lg border border-outline-variant px-4 py-2 font-label-lg text-label-lg text-on-surface-variant transition-colors hover:bg-surface-container-low sm:inline-flex"
              >
                Keluar
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="hidden items-center justify-center rounded-lg bg-primary px-4 py-2 font-label-lg text-label-lg text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95 sm:inline-flex"
            >
              Masuk
            </Link>
          )}

          <MobileMenu
            isAdmin={user?.role === "ADMIN"}
            isLoggedIn={!!user}
            points={user?.points ?? 0}
          />
        </div>
      </div>
    </header>
  );
}
