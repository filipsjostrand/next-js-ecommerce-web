import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

// 1. Define the type for our joined database result
interface CartItemWithProduct {
  id: string;
  quantity: number;
  product: {
    name: string;
    price: number;
  };
}

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // 2. Fetch from DB and cast to our interface
  const cartItems = (await db.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  })) as unknown as CartItemWithProduct[];

  if (cartItems.length === 0) {
    // Note: If you use localStorage, this check will trigger
    // because the DB is empty. Consider a Client Component instead
    // if you don't sync localStorage to DB on login.
    redirect("/cart");
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const tax = Math.round(subtotal * 0.1); // 10%
  const shipping = 1500; // 150 kr (assuming prices in cents)
  const total = subtotal + tax + shipping;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 grid gap-12 md:grid-cols-2 text-black">
      {/* LEFT — Order Summary */}
      <div>
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="space-y-6">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b pb-4 border-gray-100"
            >
              <div>
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
              </div>

              <p className="font-semibold">
                {((item.product.price * item.quantity) / 100).toFixed(2)} SEK
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-8 border-t pt-6 space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{(subtotal / 100).toFixed(2)} kr</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>Tax (10%)</span>
            <span>{(tax / 100).toFixed(2)} kr</span>
          </div>

          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>{(shipping / 100).toFixed(2)} kr</span>
          </div>

          <div className="flex justify-between font-bold text-xl pt-4 border-t border-gray-100 mt-4">
            <span>Total</span>
            <span>{(total / 100).toFixed(2)} kr</span>
          </div>
        </div>

        <Link
          href="/cart"
          className="inline-block mt-8 text-sm text-gray-400 hover:text-black transition-colors"
        >
          ← Back to cart
        </Link>
      </div>

      {/* RIGHT — Payment */}
      <div className="bg-gray-50 border rounded-2xl p-8 shadow-sm h-fit">
        <h2 className="text-xl font-bold mb-4">Secure Payment</h2>
        <p className="text-gray-600 mb-8 text-sm leading-relaxed">
          Your order will be processed securely. By clicking the button below,
          you agree to our terms of service.
        </p>

        <form action="/api/checkout" method="POST">
          <button
            type="submit"
            className="w-full rounded-xl bg-black text-white py-4 font-bold hover:bg-zinc-800 transition shadow-lg active:scale-[0.98] cursor-pointer"
          >
            Pay {(total / 100).toFixed(2)} kr
          </button>
        </form>

        <div className="mt-6 flex justify-center gap-4 grayscale opacity-50">
          {/* You could add small icons for Visa/Mastercard here */}
          <span className="text-[10px] font-bold uppercase tracking-widest">Stripe Secured</span>
        </div>
      </div>
    </main>
  );
}