import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import CartIcon from "@/app/components/CartIcon";
import CartDrawer from "./components/CartDrawer";

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
        {/* Navbar */}
        <CartDrawer /> {/* Add this here */}
        <header className="border-b">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl">
              MyStore
            </Link>

            <nav className="flex items-center gap-6">
              {/* <Link href="/categories/football">Football</Link>
              <Link href="/categories/basketball">Basketball</Link> */}
              <CartIcon />
            </nav>
          </div>
        </header>

        {/* Page content */}
        <main>{children}</main>
      </body>
    </html>
  );
}
