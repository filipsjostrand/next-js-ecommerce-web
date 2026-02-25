import Link from "next/link";
import { CheckCircle2, ShoppingBag, Mail } from "lucide-react"; // Lade till Mail-ikonen
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface StripeProductMetadata {
  productId: string;
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) redirect("/");

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });

  const existingOrder = await db.order.findFirst({
    where: { stripeSessionId: sessionId },
  });

  if (!existingOrder) {
    // 1. Adress-logik
    const shipping = session.shipping_details?.address;
    const billing = session.customer_details?.address;
    const addressObj = shipping || billing;
    let fullAddress = "Ingen adress angiven";

    if (addressObj) {
      const line1 = addressObj.line1 || "";
      const line2 = addressObj.line2 ? `, ${addressObj.line2}` : "";
      const postal = addressObj.postal_code || "";
      const city = addressObj.city || "";
      fullAddress = `${line1}${line2}, ${postal} ${city}`.trim();
    }

    // 2. Hämta detaljerade rader
    const lineItemsDetails = await stripe.checkout.sessions.listLineItems(sessionId, {
      expand: ["data.price.product"],
    });

    // 3. Skapa Ordern
    const newOrder = await db.order.create({
      data: {
        total: session.amount_total || 0,
        status: "COMPLETED",
        stripeSessionId: sessionId,
        userId: session.metadata?.userId === "guest" ? null : session.metadata?.userId,
        customerEmail: session.customer_details?.email || "unknown",
        customerName: session.shipping_details?.name || session.customer_details?.name || "Gäst",
        address: fullAddress,
        items: {
          create: lineItemsDetails.data.map((item) => {
            const product = item.price?.product as Stripe.Product;
            const pId = (item.metadata?.productId) || product?.metadata?.productId;

            return {
              productId: pId as string,
              quantity: item.quantity || 1,
              price: item.amount_total || 0,
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });

    // 4. Uppdatera lager
    await Promise.all(
      newOrder.items.map((item) =>
        db.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    );

    // 5. Produktlista till mail
    const productListHtml = lineItemsDetails.data.map((item) => `
      <li style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px; list-style: none;">
        <strong>${item.description}</strong><br />
        Antal: ${item.quantity} st — ${(item.amount_total / 100).toFixed(2)} kr
      </li>
    `).join("");

    // 6. Skicka mail
    if (session.customer_details?.email) {
      try {
        await resend.emails.send({
          from: 'Sportify <onboarding@resend.dev>',
          to: session.customer_details.email,
          subject: `Orderbekräftelse - Order #${newOrder.id.slice(-6)}`,
          html: `
            <div style="font-family: sans-serif; color: #333;">
              <h1>Tack för din beställning!</h1>
              <p>Hej ${session.customer_details.name},</p>
              <div style="background: #f9f9f9; padding: 20px; border-radius: 10px;">
                <p><strong>Order-ID:</strong> ${newOrder.id}</p>
                <p><strong>Adress:</strong> ${fullAddress}</p>
                <h3>Produkter:</h3>
                <ul>${productListHtml}</ul>
                <p><strong>Totalt:</strong> ${(session.amount_total || 0) / 100} kr</p>
              </div>
            </div>
          `,
        });
      } catch (e) {
        console.error("Mail error:", e);
      }
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-100">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-3 text-green-600">
            <CheckCircle2 size={48} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tack!</h1>
        <p className="mb-6 text-gray-600">Din order har blivit registrerad.</p>

        {/* NY RUTA: E-postbekräftelse */}
        <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-3 text-left">
          <div className="text-blue-500 shrink-0">
            <Mail size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">Orderbekräftelse skickad</p>
            <p className="text-xs text-blue-700">Vi har skickat en kopia av din order till {session.customer_details?.email}.</p>
          </div>
        </div>

        <p className="mb-8 text-sm text-gray-400 font-mono">Order ID: {sessionId.slice(-10)}</p>

        <Link href="/profile" className="bg-black text-white py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all">
          <ShoppingBag size={18} /> Se mina ordrar
        </Link>
      </div>
    </div>
  );
}