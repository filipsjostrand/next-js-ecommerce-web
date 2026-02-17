import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "@/app/components/AddToCartButton";

export const revalidate = 60;

// I Next.js 15 är params ett Promise
type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  // 1. Du MÅSTE vänta på params innan du hämtar slug
  const { slug } = await params;

  // 2. Nu har slug ett värde (t.ex. "pro-match-football") istället för undefined
  const product = await db.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="relative aspect-square w-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
            priority
          />
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-2">
            {product.category.name}
          </p>

          <h1 className="text-3xl font-bold mb-4">
            {product.name}
          </h1>

          <p className="text-gray-600 mb-6">
            {product.description}
          </p>

          <p className="text-2xl font-semibold mb-6">
            ${(product.price / 100).toFixed(2)}
          </p>

          <AddToCartButton
            productId={product.id}
            stock={product.stock ?? 0}
          />
        </div>
      </div>
    </main>
  );
}