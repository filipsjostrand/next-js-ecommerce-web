import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 1. Definiera produkt-typen
interface InventoryProduct {
  id: string;
  name: string;
  stock: number;
  price: number;
}

export default async function InventoryPage() {
  const session = await getServerSession(authOptions);

  // Säkerhetskoll (valfritt men rekommenderat för admin)
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // 2. Hämta produkterna med explicit typning
  const products = (await db.product.findMany({
    select: {
      id: true,
      name: true,
      stock: true,
      price: true,
    },
    orderBy: { name: "asc" },
  })) as InventoryProduct[];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>
      <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4 text-left font-semibold">Product</th>
            <th className="p-4 text-left font-semibold">Stock Level</th>
            <th className="p-4 text-left font-semibold">Price</th>
          </tr>
        </thead>
        <tbody>
          {/* 3. Typa 'p' i map-funktionen */}
          {products.map((p: InventoryProduct) => (
            <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="p-4 text-black font-medium">{p.name}</td>
              <td className={`p-4 font-medium ${p.stock < 10 ? 'text-red-500' : 'text-black'}`}>
                {p.stock} units
              </td>
              <td className="p-4 text-black">
                ${(p.price / 100).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}