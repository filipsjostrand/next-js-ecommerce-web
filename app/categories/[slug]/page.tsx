import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

// 1. Definiera ett interface för produkten så att .map() är säker
interface CategoryProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  // 2. Hämta kategorin och casta produkterna till vårt interface
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

  // Casta produkterna för att undvika 'any' i .map()
  const products = category.products as unknown as CategoryProduct[];

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 text-black">
      <h1 className="text-3xl font-bold mb-8">{category.name}</h1>

      {products.length === 0 ? (
        <p className="text-gray-500">No products in this category yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group"
            >
              <div className="border rounded-xl p-4 h-full transition hover:shadow-lg bg-white">
                <div className="relative aspect-square w-full mb-4 overflow-hidden rounded-lg">
                  <Image
                    src={product.imageUrl || "/placeholder.png"} // Fallback om bild saknas
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <h2 className="font-bold text-sm md:text-base group-hover:text-zinc-600 transition line-clamp-2">
                  {product.name}
                </h2>

                <p className="text-gray-500 font-semibold mt-2">
                  {(product.price / 100).toFixed(0)} kr
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}