import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 1. Vänta på params (Viktigt i Next.js 15)
  const { id } = await params;

  // 2. Hämta produkten och kategorier
  const product = await db.product.findUnique({
    where: { id },
  });

  const categories = await db.category.findMany();

  if (!product) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold">Produkten hittades inte.</h1>
        <Link href="/admin/products/new" className="text-blue-600 underline">
          Gå tillbaka till listan
        </Link>
      </div>
    );
  }

  // 3. Server Action för att spara ändringar
  async function updateProduct(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    // Konvertera kronor från formuläret till ören för databasen
    const price = Math.round(parseFloat(formData.get("price") as string) * 100);
    const stock = parseInt(formData.get("stock") as string) || 0;
    const description = formData.get("description") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const categoryId = formData.get("categoryId") as string;

    const slug = name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    await db.product.update({
      where: { id }, // Använder id från params ovan
      data: {
        name,
        slug,
        price,
        stock,
        description,
        imageUrl,
        categoryId,
      },
    });

    // Rensa cache så att ändringarna syns överallt
    revalidatePath("/admin/products/new");
    revalidatePath("/");

    // Skicka tillbaka användaren
    redirect("/admin/products/new");
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/products/new" className="text-red-500 hover:text-black">
          &larr; Cancel
        </Link>
        <h1 className="text-2xl font-bold text-black">Edit product</h1>
      </div>

      <section className="bg-white p-6 rounded-xl border shadow-sm">
        <form action={updateProduct} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-semibold text-gray-700">Name</label>
            <input
              name="name"
              defaultValue={product.name}
              className="w-full border p-2 rounded text-black mt-1"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Price (i SEK)</label>
            <input
              name="price"
              type="number"
              step="0.01"
              defaultValue={product.price / 100} // Visa som kronor (t.ex. 133)
              className="w-full border p-2 rounded text-black mt-1"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">In stock</label>
            <input
              name="stock"
              type="number"
              defaultValue={product.stock}
              className="w-full border p-2 rounded text-black mt-1"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="text-sm font-semibold text-gray-700">Image URL</label>
            <input
              name="imageUrl"
              defaultValue={product.imageUrl || ""}
              className="w-full border p-2 rounded text-black mt-1"
              required
            />
          </div>

          <div className="col-span-2">
            <label className="text-sm font-semibold text-gray-700">Category</label>
            <select
              name="categoryId"
              defaultValue={product.categoryId}
              className="w-full border p-2 rounded text-black mt-1"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <textarea
              name="description"
              defaultValue={product.description || ""}
              className="w-full border p-2 rounded text-black mt-1"
              rows={4}
            />
          </div>

          <button
            type="submit"
            className="col-span-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-bold cursor-pointer mt-4"
          >
            Save changes
          </button>
        </form>
      </section>
    </div>
  );
}