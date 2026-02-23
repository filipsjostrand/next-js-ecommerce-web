import { db } from "@/lib/db";
import Link from "next/link";

export default async function AdminDashboard() {
  const [orders, users, products] = await Promise.all([
    db.order.count(),
    db.user.count(),
    db.product.count(),
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        {/* SNABBKNAPP: LÄGG TILL PRODUKT */}
        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 cursor-pointer transition-all font-medium flex items-center gap-2 shadow-sm"
        >
          <span className="text-lg">➕</span> Add product
        </Link>
      </div>

      {/* STATISTIK-KORT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Stat title="Orders" value={orders} color="border-l-orange-500" />
        <Stat title="Users" value={users} color="border-l-green-500" />

        {/* Vi gör produkt-statistiken klickbar för att komma till listan */}
        <Link href="/admin/products" className="cursor-pointer block group">
          <Stat
            title="Products"
            value={products}
            color="border-l-blue-500"
            isClickable
          />
        </Link>
      </div>

      {/* VALFRITT: SEKTION FÖR SNABBA LÄNKAR */}
      <div className="bg-gray-50 p-6 rounded-xl border border-dashed border-gray-300">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Fast selection</h2>
        <div className="flex gap-4">
           <Link href="/admin/products" className="text-blue-600 hover:underline cursor-pointer text-sm font-medium">
             Show all products &rarr;
           </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ title, value, color, isClickable }: { title: string; value: number, color: string, isClickable?: boolean }) {
  return (
    <div className={`bg-white rounded-lg border p-6 border-l-4 ${color} ${isClickable ? 'group-hover:shadow-md' : ''} transition-shadow`}>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {isClickable && <p className="text-xs text-blue-500 mt-2 font-medium">Show list &rarr;</p>}
    </div>
  );
}