import { db } from "@/lib/db";

export async function getRecommendations(userId?: string) {
  if (!userId) {
    return db.product.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
    });
  }

  const categories = await db.orderItem.findMany({
    where: { order: { userId } },
    select: { product: { select: { categoryId: true } } },
  });

  const categoryIds = [
    ...new Set(categories.map(c => c.product.categoryId)),
  ];

  return db.product.findMany({
    where: { categoryId: { in: categoryIds } },
    take: 6,
  });
}
