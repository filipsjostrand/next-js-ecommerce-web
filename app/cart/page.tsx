import CartClient from "./CartClient";

export default function CartPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Din varukorg</h1>
      <CartClient />
    </main>
  );
}