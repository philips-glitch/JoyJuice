"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Icon";

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/admin/orders", label: "Orders", icon: "receipt_long" },
  { href: "/admin/products", label: "Products", icon: "local_drink" },
  { href: "/admin/customers", label: "Customers", icon: "group" },
];

export function AdminNav({ variant = "sidebar" }: { variant?: "sidebar" | "mobile" }) {
  const pathname = usePathname();

  if (variant === "mobile") {
    return (
      <nav className="scrollbar-none flex items-center gap-2 overflow-x-auto border-b border-outline-variant/60 bg-surface-container-lowest px-3 pb-3 md:hidden">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 font-label-md text-label-md transition-colors ${
                active
                  ? "bg-primary text-on-primary"
                  : "border border-outline-variant text-on-surface-variant"
              }`}
            >
              <Icon name={item.icon} filled={active} className="!text-base" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {ADMIN_NAV_ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 rounded-lg px-3 py-2.5 font-label-lg text-label-lg transition-colors ${
              active
                ? "bg-primary/10 text-primary"
                : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
            }`}
          >
            <Icon name={item.icon} filled={active} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
