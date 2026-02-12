import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";


export const revalidate = 60; // ISR

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params; // ✅ unwrap the promise

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
        </div>
      </div>
    </main>
  );
}
