import { db } from "@/lib/db";

export default async function OrdersPage() {
  const orders = await db.order.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-black">Customer Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found yet.</p>
      ) : (
        <div className="bg-white border rounded-lg">
          {/* Här loopar du ut ordrar på liknande sätt som produkter */}
          <p className="p-4 text-black">Total orders: {orders.length}</p>
        </div>
      )}
    </div>
  );
}