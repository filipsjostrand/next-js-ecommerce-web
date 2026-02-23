import Link from "next/link";
import { Package } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center">
      <div className="flex justify-center mb-6">
        <Package size={64} className="text-gray-300" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">My orders</h1>
      <p className="text-gray-600 mb-8">
        If you have placed an order as a guest, you will find your confirmation in your email.
        Currently, an account is required to view order history here.
      </p>
      <Link
        href="/"
        className="text-blue-600 hover:underline font-medium"
      >
        Back to the store
      </Link>
    </div>
  );
}