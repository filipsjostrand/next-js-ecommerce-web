import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ShoppingBag, Package, Calendar, CreditCard } from "lucide-react";

// 1. Definiera typen för en order
interface Order {
  id: string;
  createdAt: Date;
  total: number;
  status: string;
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // 2. Hämta och casta ordrar explicit
  const orders = (await db.order.findMany({
    where: {
      userId: session.user.id
    },
    orderBy: {
      createdAt: "desc"
    },
  })) as Order[];

  return (
    <div className="max-w-3xl mx-auto p-6 min-h-screen text-black">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold">My profile</h1>
        <p className="text-gray-500">Logged in as: {session.user.email}</p>
      </header>

      <section>
        <div className="flex items-center gap-2 mb-6">
          <ShoppingBag size={20} className="text-black" />
          <h2 className="text-xl font-bold">Order history</h2>
        </div>

        {orders.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed rounded-2xl p-12 text-center">
            <Package className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium">You have no orders yet.</p>
            <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 3. Typa 'order' i loopen */}
            {orders.map((order: Order) => (
              <div key={order.id} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                      Order #{order.id.slice(-8)}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-black">
                        <CreditCard size={14} />
                        {(order.total / 100).toFixed(2)} kr
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                      order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status === 'COMPLETED' ? 'Sent' : 'Processing'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}