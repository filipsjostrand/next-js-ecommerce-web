import Link from "next/link"; // 1. Importera Link

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex text-black">
      <aside className="w-64 border-r bg-gray-50 p-6">
        <nav className="space-y-4 flex flex-col">
          {/* 2. Använd <Link> istället för <a> för att slippa omladdning */}
          <Link href="/admin" className="font-medium hover:text-blue-600 transition">
            Dashboard
          </Link>
          <Link href="/admin/products" className="hover:text-blue-600 transition">
            Products
          </Link>
          <Link href="/admin/orders" className="hover:text-blue-600 transition">
            Orders
          </Link>
          <Link href="/admin/inventory" className="hover:text-blue-600 transition">
            Inventory
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8 bg-white">{children}</main>
    </div>
  );
}