import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-gutter py-gutter sm:px-gutter-lg">
        {children}
      </main>
      <footer className="mt-auto border-t border-outline-variant/60 bg-surface-container-low">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-space-md px-gutter-lg py-margin md:flex-row">
          <div className="flex flex-col items-center gap-1 md:items-start">
            <Image src="/logo.png" alt="Joy & Juice" width={140} height={140} className="h-10 w-auto" />
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              © {new Date().getFullYear()} Joy &amp; Juice. All rights reserved. Cold-pressed daily.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-label-md text-label-md md:justify-end">
            <Link href="/menu" className="font-semibold text-primary hover:underline">
              Menu Storefront
            </Link>
            <Link href="/loyalty" className="text-on-surface-variant transition-colors hover:text-primary">
              Loyalty Rewards
            </Link>
            <Link href="/rewards" className="text-on-surface-variant transition-colors hover:text-primary">
              Katalog Hadiah
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
