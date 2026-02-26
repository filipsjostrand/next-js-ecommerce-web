import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "@/app/components/AddToCartButton";

export const revalidate = 60;

// Typa props för Next.js 15
type Props = {
  params: Promise<{ slug: string }>;
};

// Skapa ett interface för att säkra datan från Prisma
interface ProductWithCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: {
    name: string;
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  // Hämta produkten och casta den
  const product = (await db.product.findUnique({
    where: { slug },
    include: { category: true },
  })) as unknown as ProductWithCategory | null;

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 text-black">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="relative aspect-square w-full bg-gray-50 rounded-lg overflow-hidden border">
          <Image
            src={product.imageUrl || "/placeholder.png"} // Fallback om bilden saknas
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2 uppercase tracking-wide">
            {product.category.name}
          </p>

          <h1 className="text-3xl font-bold mb-4">
            {product.name}
          </h1>

          <p className="text-gray-600 mb-6 leading-relaxed">
            {product.description}
          </p>

          <p className="text-2xl font-semibold mb-6">
            {(product.price / 100).toFixed(0)} kr
          </p>

          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl || "/placeholder.png" // Säkra även här
            }}
          />
        </div>
      </div>
    </main>
  );
}