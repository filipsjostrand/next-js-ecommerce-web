import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link"; // ✅ Importera Link

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const category = await db.category.findUnique({
    where: { slug },
    include: {
      products: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">{category.name}</h1>

      {category.products.length === 0 ? (
        <p className="text-gray-500">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {category.products.map((product) => (
            /* ✅ Omslut kortet med Link och peka på rätt URL */
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group" // Lägg till group för roliga hover-effekter
            >
              <div className="border rounded-lg p-4 h-full transition hover:shadow-md">
                <div className="relative aspect-square w-full mb-4">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>

                <h2 className="font-medium group-hover:text-blue-600 transition">
                  {product.name}
                </h2>

                <p className="text-sm text-gray-500">
                  {(product.price / 10).toFixed(2)} kr
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}