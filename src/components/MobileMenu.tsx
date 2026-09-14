"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { logoutAction } from "@/app/actions/auth-actions";

const LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/loyalty", label: "Loyalty Portal" },
  { href: "/rewards", label: "Rewards" },
];

/**
 * The header collapses nav links, the points pill, and the logout button
 * below `md`/`sm` — this gives mobile viewports a way back to all of them.
 */
export function MobileMenu({
  isAdmin,
  isLoggedIn,
  points,
}: {
  isAdmin: boolean;
  isLoggedIn: boolean;
  points: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Menu"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low"
      >
        <Icon name={open ? "close" : "menu"} />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-40 border-b border-outline-variant/60 bg-surface-container-lowest shadow-md">
          <nav className="flex flex-col gap-1 p-gutter">
            {isLoggedIn && (
              <div className="mb-1 flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-3 py-1.5 font-label-md text-label-md text-amber-900">
                <Icon name="stars" filled className="!text-sm text-amber-600" />
                <span className="font-bold">Points: {points.toLocaleString("id-ID")} pts</span>
              </div>
            )}
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 font-label-lg text-label-lg text-on-surface hover:bg-surface-container-low"
              >
                {link.label}
              </Link>
            ))}

            {/* Separate section — the admin dashboard is its own area,
                not part of the storefront nav list above. */}
            {isAdmin && (
              <>
                <div className="my-1 border-t border-outline-variant/60" />
                <Link
                  href="/admin/orders"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-inverse-surface px-3 py-2 font-label-lg text-label-lg text-inverse-on-surface"
                >
                  <Icon name="admin_panel_settings" className="!text-base" />
                  Admin Dashboard
                </Link>
              </>
            )}

            {isLoggedIn ? (
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full rounded-lg px-3 py-2 text-left font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-low"
                >
                  Keluar
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-primary px-3 py-2 text-center font-label-lg text-label-lg text-on-primary"
              >
                Masuk
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
