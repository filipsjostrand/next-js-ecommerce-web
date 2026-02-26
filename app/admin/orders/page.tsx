import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

// 1. Definiera de interna typerna
interface AdminProduct {
  name: string;
}

interface AdminOrderItem {
  id: string;
  quantity: number;
  product: AdminProduct;
}

interface AdminOrder {
  id: string;
  createdAt: Date;
  customerName: string;
  customerEmail: string;
  address: string;
  total: number;
  status: string;
  items: AdminOrderItem[];
}

export default async function AdminOrdersPage() {
  // 2. Casta Prisma-resultatet till vårt interface
  const orders = (await db.order.findMany({
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
  })) as unknown as AdminOrder[];

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
            {/* 3. Typa 'order' i map-funktionen */}
            {orders.map((order: AdminOrder) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs text-black">
                  {order.id.slice(-8).toUpperCase()}
                </TableCell>
                <TableCell className="text-black">
                  {new Date(order.createdAt).toLocaleDateString("sv-SE")}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-black">{order.customerName}</span>
                    <span className="text-xs text-gray-500">{order.customerEmail}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-black">
                  {order.address}
                </TableCell>
                <TableCell className="text-black">
                  <div className="text-xs">
                    {/* 4. Typa även 'item' i den inre loopen */}
                    {order.items.map((item: AdminOrderItem) => (
                      <div key={item.id}>
                        {item.quantity}x {item.product.name}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="font-bold text-black">
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