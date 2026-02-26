import { db } from "@/lib/db";
import { createProduct } from "@/lib/actions/product";
import Link from "next/link";

// 1. Definiera typen för kategorin
interface Category {
  id: string;
  name: string;
}

export default async function NewProductPage() {
  // 2. Hämta kategorierna och casta dem till vårt interface
  const categories = (await db.category.findMany({
    orderBy: { name: "asc" },
  })) as Category[];

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-black">Add new product</h1>
        <Link
          href="/admin/products"
          className="text-sm text-gray-500 hover:underline"
        >
          &larr; Back to list
        </Link>
      </div>

      <form action={createProduct} className="grid grid-cols-1 gap-6 bg-white p-6 rounded-lg shadow-sm border">
        {/* Produktnamn */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-black">Name</label>
          <input
            name="name"
            type="text"
            placeholder="t.ex. Pro Football"
            className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-black"
            required
          />
        </div>

        {/* Beskrivning */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-black">Description</label>
          <textarea
            name="description"
            placeholder="Product description..."
            className="border p-2 rounded-md h-32 focus:ring-2 focus:ring-blue-500 outline-none text-black"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Pris */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-black">Price (kr)</label>
            <input
              name="price"
              type="number"
              placeholder="299"
              className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-black"
              required
            />
          </div>

          {/* Lager */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-black">Stock</label>
            <input
              name="stock"
              type="number"
              placeholder="10"
              className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-black"
              required
            />
          </div>
        </div>

        {/* Kategori-dropdown */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-black">Category</label>
          <select
            name="categoryId"
            className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black"
            required
          >
            <option value="">Select category...</option>
            {/* 3. Typa 'cat' explicit här */}
            {categories.map((cat: Category) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bild-URL */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-black">Image URL</label>
          <input
            name="imageUrl"
            type="url"
            placeholder="https://images.unsplash.com/..."
            className="border p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-black"
          />
        </div>

        {/* Knappar */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition cursor-pointer"
          >
            Save Product
          </button>
        </div>
      </form>
    </div>
  );
}