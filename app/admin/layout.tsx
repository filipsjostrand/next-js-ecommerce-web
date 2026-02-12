export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-gray-50 p-6">
        <nav className="space-y-4">
          <a href="/admin" className="block font-medium">Dashboard</a>
          <a href="/admin/products">Products</a>
          <a href="/admin/orders">Orders</a>
          <a href="/admin/inventory">Inventory</a>
        </nav>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
