import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Joy & Juice",
  description: "100% Jus Murni Cold-Pressed & Loyalty Rewards",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${plusJakarta.variable} ${beVietnamPro.variable} h-full antialiased`}
    >
      {/* Material Symbols Outlined — icon font used throughout the UI.
          `precedence` opts into React's stylesheet hoisting (App Router's
          recommended way to load a third-party stylesheet from anywhere in
          the tree), which the no-page-custom-font rule below doesn't know
          about — it only understands the older Pages Router convention. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
        precedence="default"
      />
      <body className="min-h-full flex flex-col bg-surface text-on-surface">{children}</body>
    </html>
  );
}
