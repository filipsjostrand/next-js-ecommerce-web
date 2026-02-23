import Link from "next/link";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react"; // Om du använder lucide-react, annars ersätt med emojis

export default function SuccessPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-100">
        {/* Ikon-animation (enkel) */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-3 text-green-600">
            <CheckCircle2 size={48} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Thank you for your purchase!
        </h1>
        <p className="text-gray-600 mb-8">
          We have received your order and sent a confirmation to your email.
        </p>

        <div className="space-y-4">
          <Link
            href="/orders"
            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <ShoppingBag size={18} />
            See my orders
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-gray-50 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
          >
            Continue shopping
            <ArrowRight size={18} />
          </Link>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          Do you need help? <Link href="/contact" className="underline hover:text-gray-600 cursor-pointer">Contact support</Link>
        </p>
      </div>
    </div>
  );
}