"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE_LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/loyalty", label: "Loyalty Portal" },
  { href: "/rewards", label: "Rewards" },
];

export function NavLinks({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const links = isAdmin ? [...BASE_LINKS, { href: "/admin/orders", label: "Admin Orders" }] : BASE_LINKS;

  return (
    <nav className="hidden items-center space-x-6 md:flex">
      {links.map((link) => {
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
