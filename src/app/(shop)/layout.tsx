import { Navbar } from "@/components/Navbar";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">{children}</main>
      <footer className="border-t border-jj-border bg-white py-8 text-center text-xs text-jj-muted">
        © {new Date().getFullYear()} Joy &amp; Juice. Semua hak cipta dilindungi. Segar, Alami,
        100% Organik.
      </footer>
    </div>
  );
}
