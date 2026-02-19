import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Definiera typer för inkommande data
interface CartItem {
  productId: string;
  quantity: number;
  product: {
    price: number;
  };
}

interface CustomerInfo {
  name: string;
  email: string;
  address: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, customer }: { items: CartItem[]; customer: CustomerInfo } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Korgen är tom" }, { status: 400 });
    }

    const order = await db.order.create({
      data: {
        customerEmail: customer.email,
        customerName: customer.name,
        address: customer.address,
        // Nu är 'i' typad som CartItem istället för any
        total: items.reduce((sum, i) => sum + (i.product.price * i.quantity), 0),
        status: "PENDING",
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
    });

    return NextResponse.json({ orderId: order.id, success: true });
  } catch (error) {
    console.error("CHECKOUT_ERROR:", error);
    return NextResponse.json({ error: "Kunde inte skapa order" }, { status: 500 });
  }
}

// // Add order to database (test without Stripe)

// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { items, customer } = body;

//     if (!items || items.length === 0) {
//       return NextResponse.json({ error: "Korgen är tom" }, { status: 400 });
//     }

//     // Skapa ordern i databasen
//     // Vi använder en "transaction" för att säkerställa att både order
//     // och orderrader skapas korrekt.

//   const order = await db.order.create({
//     data: {
//       customerEmail: customer.email,
//       customerName: customer.name,
//       address: customer.address,
//       total: items.reduce((sum: number, i: any) => sum + (i.product.price * i.quantity), 0),
//       status: "PENDING",
//       // Ändrat från orderItems till items (måste matcha schema.prisma)
//       items: {
//         create: items.map((item: any) => ({
//           productId: item.productId,
//           quantity: item.quantity,
//           price: item.product.price, // Ändrat från priceAtPurchase till price
//         })),
//       },
//     },
//   });

//     return NextResponse.json({ orderId: order.id, success: true });
//   } catch (error) {
//     console.error("CHECKOUT_ERROR:", error);
//     return NextResponse.json({ error: "Kunde inte skapa order" }, { status: 500 });
//   }
// }