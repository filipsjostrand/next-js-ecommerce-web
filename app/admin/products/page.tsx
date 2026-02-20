import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export default async function AdminProducts() {
  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const categories = await db.category.findMany();

  // SERVER ACTION: Lägg till produkt
  async function addProduct(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const price = Math.round(parseFloat(formData.get("price") as string) * 100); // Omvandla till ören
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const categoryId = formData.get("categoryId") as string;

    // Hämta stock från formuläret, konvertera till nummer
    const stock = parseInt(formData.get("stock") as string) || 0;

    // Skapa en enkel slug (t.ex. "Elite Basketball" -> "elite-basketball")
    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    await db.product.create({
      data: {
        name,
        slug,
        price,
        description,
        imageUrl,
        categoryId,
        stock,
      },
    });

    revalidatePath("/admin/products"); // Uppdatera listan direkt
    revalidatePath("/categories/[slug]"); // Uppdatera kategorisidan
  }

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">Handle Products</h1>

      {/* FORMULÄR FÖR ATT LÄGGA TILL */}
      <section className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Add new product</h2>
        <form action={addProduct} className="grid grid-cols-2 gap-4">
          <input name="name" placeholder="Produktnamn" className="border p-2 rounded text-black" required />
          <input name="price" type="number" step="0.01" placeholder="Pris (t.ex. 149.50)" className="border p-2 rounded text-black" required />
          <input name="stock" type="number" placeholder="Antal i lager" className="border p-2 rounded text-black" required />
          <input name="imageUrl" placeholder="Bild-URL (t.ex. /images/ball.jpg)" className="border p-2 rounded text-black" required />
          <select name="categoryId" className="border p-2 rounded text-black" required>
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <textarea name="description" placeholder="Beskrivning" className="border p-2 rounded col-span-2 text-black" rows={3} />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
            Save product
          </button>
        </form>
      </section>

      {/* LISTA PÅ PRODUKTER */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Available products</h2>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-left bg-white">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4 text-right">Perform action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4 text-gray-500">{p.category?.name}</td>
                  <td className="p-4">{(p.price / 100).toFixed(2)} kr</td>
                  <td className="p-4 text-right">
                    <button className="text-red-500 hover:underline">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}