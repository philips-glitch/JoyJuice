"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/loyalty", label: "Loyalty Portal" },
  { href: "/rewards", label: "Rewards" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-6 text-sm font-medium text-jj-muted md:flex">
      {LINKS.map((link) => {
        const active = pathname?.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              active
                ? "border-b-2 border-jj-orange pb-1 text-jj-orange-dark"
                : "pb-1 hover:text-jj-text"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
