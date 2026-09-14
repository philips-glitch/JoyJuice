"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/loyalty", label: "Loyalty Portal" },
  { href: "/rewards", label: "Rewards" },
];

// Note: Admin Dashboard is intentionally not in this list — it's a
// separate area (src/app/admin) with its own layout, reached via the
// distinct "Admin" entry point in Navbar/MobileMenu, not mixed into the
// customer storefront's main nav.
export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center space-x-6 md:flex">
      {LINKS.map((link) => {
        const active = pathname?.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              active
                ? "border-b-2 border-primary pb-1 font-label-lg text-label-lg font-bold text-primary"
                : "font-label-lg text-label-lg font-medium text-on-surface-variant transition-colors hover:text-primary"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
