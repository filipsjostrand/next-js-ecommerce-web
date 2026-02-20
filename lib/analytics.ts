import { db } from "@/lib/db";

export async function getRevenueStats() {
  return db.order.aggregate({
    _sum: { total: true },
    _count: true,
  });
}

export async function topProducts() {
  return db.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });
}
