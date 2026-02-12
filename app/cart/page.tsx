import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CartPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const cartItems = await db.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b pb-4"
              >
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>

                <p className="font-semibold">
                  $
                  {(
                    (item.product.price * item.quantity) /
                    100
                  ).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${(total / 100).toFixed(2)}</span>
          </div>

          <Link
            href="/checkout"
            className="inline-block mt-6 bg-black text-white px-6 py-3 rounded-md"
          >
            Proceed to Checkout
          </Link>
        </>
      )}
    </main>
  );
}
