import { db } from "@/lib/db";

export default async function AdminDashboard() {
  const [orders, users, products] = await Promise.all([
    db.order.count(),
    db.user.count(),
    db.product.count(),
  ]);

  return (
    <div className="grid grid-cols-3 gap-6">
      <Stat title="Orders" value={orders} />
      <Stat title="Users" value={users} />
      <Stat title="Products" value={products} />
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-lg border p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  );
}