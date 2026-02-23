import { db } from "@/lib/db";

export default async function InventoryPage() {
  const products = await db.product.findMany({
    orderBy: { stock: "asc" }, // Visa de med minst i lager först
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-black">Inventory Management</h1>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-black">Product</th>
              <th className="p-4 text-black">In Stock</th>
              <th className="p-4 text-black">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-4 text-black">{p.name}</td>
                <td className="p-4 text-black">{p.stock} units</td>
                <td className="p-4">
                  {p.stock <= 5 ? (
                    <span className="text-red-600 font-bold text-sm">Low Stock</span>
                  ) : (
                    <span className="text-green-600 text-sm">Healthy</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}