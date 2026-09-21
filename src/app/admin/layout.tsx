import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/app/actions/auth-actions";
import { Icon } from "@/components/Icon";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCurrentUser();
  if (user.role !== "ADMIN") {
    redirect("/menu");
  }

  // Self-registered accounts can't log in until they're verified here, so the
  // count rides along in the nav — otherwise people sit unapproved unseen.
  const pendingVerification = await prisma.user.count({
    where: { verified: false, role: "CUSTOMER" },
  });
  const badges = { "/admin/customers": pendingVerification };

  return (
    <div className="flex min-h-screen flex-1 bg-surface-container-low">
      {/* Dedicated admin shell — deliberately its own layout, not the
          customer storefront's Navbar/Footer (no search bar, cart,
          "Order Now", etc.). Only reachable by role === ADMIN. */}
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-outline-variant/60 bg-surface-container-lowest md:flex">
        <div className="flex items-center gap-2 border-b border-outline-variant/60 px-6 py-5">
          <Image src="/logo.png" alt="Joy & Juice" width={120} height={120} className="h-9 w-auto" />
          <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
            Admin
          </span>
        </div>
        <AdminNav badges={badges} />
        <div className="border-t border-outline-variant/60 p-3">
          <Link
            href="/menu"
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low"
          >
            <Icon name="storefront" className="!text-lg" />
            Kembali ke Storefront
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container-low"
            >
              <Icon name="logout" className="!text-lg" />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Compact top bar + horizontal nav for mobile, where the sidebar is hidden. */}
        <header className="flex items-center justify-between bg-surface-container-lowest px-4 pt-3 md:hidden">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Joy & Juice" width={100} height={100} className="h-8 w-auto" />
            <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-on-surface-variant">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/menu"
              aria-label="Kembali ke Storefront"
              className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low"
            >
              <Icon name="storefront" />
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Keluar"
                className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low"
              >
                <Icon name="logout" />
              </button>
            </form>
          </div>
        </header>
        <div className="pt-3 md:hidden">
          <AdminNav variant="mobile" badges={badges} />
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-gutter py-gutter sm:px-gutter-lg">
          {children}
        </main>
      </div>
    </div>
  );
}
