import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";

// 1. Skapa formateraren högst upp
const formatter = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
});

export default async function HomePage() {
  const featuredProducts = await db.product.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
    },
  });

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <main className="space-y-16">
      {/* Hero */}
      <section className="bg-black text-white">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <h1 className="text-4xl font-bold md:text-6xl text-white">
            Gear up. Play harder.
          </h1>
          <p className="mt-6 text-lg text-gray-300">
            Premium sports equipment built for performance.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6">
        <h2 className="mb-6 text-2xl font-semibold text-black">Shop by category</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="rounded-lg border p-6 text-center hover:bg-gray-50 transition"
            >
              <span className="text-lg font-medium text-black">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-6 mb-20">
        <h2 className="mb-6 text-2xl font-semibold text-black">Latest arrivals</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl border bg-gray-100">
                <Image
                  src={product.imageUrl || "/placeholder.png"}
                  alt={product.name}
                  fill
                  className="object-cover transition group-hover:scale-105"
                />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold text-black">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.category.name}</p>

                {/* 2. FIXEN: Här delas priset med 100 och formateras */}
                <p className="mt-1 text-xl font-semibold text-black">
                  {formatter.format(product.price / 100)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}