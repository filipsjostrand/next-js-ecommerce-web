import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import CartIcon from "@/app/components/CartIcon";
import CartDrawer from "./components/CartDrawer";
import UserMenu from "./components/UserMenu";
import { Providers } from "./providers"; // ✅ Importera Providers

export const metadata: Metadata = {
  title: "Next E-Commerce",
  description: "Modern e-commerce store built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {/* ✅ Omslut allt med Providers */}
        <Providers>
          <CartDrawer />

          <header className="border-b">
            <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
              <Link href="/" className="font-bold text-xl">
                Sportify
              </Link>

              <nav className="flex items-center gap-6">
                <UserMenu />
                <CartIcon />
              </nav>
            </div>
          </header>

          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}