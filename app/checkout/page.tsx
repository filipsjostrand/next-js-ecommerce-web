import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  const cartItems = await db.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    redirect("/cart");
  }

  // 🔒 Always calculate totals on server
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const tax = Math.round(subtotal * 0.1); // 10%
  const shipping = 1500; // $15
  const total = subtotal + tax + shipping;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 grid gap-12 md:grid-cols-2">
      {/* LEFT — Order Summary */}
      <div>
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

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

        {/* Totals */}
        <div className="mt-8 border-t pt-6 space-y-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${(subtotal / 100).toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Tax (10%)</span>
            <span>${(tax / 100).toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Shipping</span>
            <span>${(shipping / 100).toFixed(2)}</span>
          </div>

          <div className="flex justify-between font-bold text-lg pt-4">
            <span>Total</span>
            <span>${(total / 100).toFixed(2)}</span>
          </div>
        </div>

        <Link
          href="/cart"
          className="inline-block mt-6 text-sm text-gray-500 hover:underline"
        >
          ← Back to cart
        </Link>
      </div>

      {/* RIGHT — Payment */}
      <div className="border rounded-lg p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Secure Payment</h2>

        <p className="text-gray-600 mb-6">
          All transactions are encrypted and securely processed.
        </p>

        <form action="/api/checkout" method="POST">
          <button
            type="submit"
            className="w-full rounded-md bg-black text-white py-3 font-medium hover:bg-gray-800 transition"
          >
            Pay ${(total / 100).toFixed(2)}
          </button>
        </form>
      </div>
    </main>
  );
}
