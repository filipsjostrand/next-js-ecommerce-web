import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

export default async function AdminOrdersPage() {
  // 1. Hämta alla ordrar sorterade på nyast först
  const orders = await db.order.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Customer orders</h1>
        <p className="text-muted-foreground">{orders.length} st total</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs">
                  {order.id.slice(-8).toUpperCase()}
                </TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString("sv-SE")}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{order.customerName}</span>
                    <span className="text-xs text-gray-500">{order.customerEmail}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {order.address}
                </TableCell>
                <TableCell>
                  <div className="text-xs">
                    {order.items.map((item) => (
                      <div key={item.id}>
                        {item.quantity}x {item.product.name}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-bold">
                  {(order.total / 100).toFixed(2)} kr
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    order.status === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {order.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// import { db } from "@/lib/db";

// export default async function OrdersPage() {
//   const orders = await db.order.findMany({
//     include: { user: true },
//     orderBy: { createdAt: "desc" },
//   });

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-6 text-black">Customer Orders</h1>
//       {orders.length === 0 ? (
//         <p className="text-gray-500">No orders found yet.</p>
//       ) : (
//         <div className="bg-white border rounded-lg">
//           {/* Här loopar du ut ordrar på liknande sätt som produkter */}
//           <p className="p-4 text-black">Total orders: {orders.length}</p>
//         </div>
//       )}
//     </div>
//   );
// }