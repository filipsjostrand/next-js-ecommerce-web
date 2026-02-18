import { PrismaClient } from "../lib/generated/prisma";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data (safe order)
  await prisma.orderItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Categories
await prisma.category.createMany({
  data: [
    { name: "Basketball", slug: "basketball" },
    { name: "Fitness", slug: "fitness" },
    { name: "Football", slug: "football" },
    { name: "Running", slug: "running" },
  ],
});

  console.log("✅ Categories created");

  // Fetch categories for relations
  const basketball = await prisma.category.findUnique({
    where: { slug: "basketball" },
  });

  const fitness = await prisma.category.findUnique({
    where: { slug: "fitness" },
  });

  const football = await prisma.category.findUnique({
    where: { slug: "football" },
  });

  if (!football || !basketball || !fitness) {
    throw new Error("Categories not found");
  }

  // Products
  await prisma.product.createMany({
    data: [
      {
        name: "Elite Basketball",
        slug: "elite-basketball",
        description: "Indoor/outdoor composite leather basketball.",
        price: 2499,
        stock: 40,
        imageUrl:
          "https://images.unsplash.com/photo-1519861531473-9200262188bf",
        categoryId: basketball.id,
      },
      {
        name: "Pro Match Football",
        slug: "pro-match-football",
        description: "FIFA-approved professional match football.",
        price: 2999,
        stock: 50,
        imageUrl:
          "https://images.unsplash.com/photo-1600679472829-3044539ce8ed",
        categoryId: football.id,
      },
      {
        name: "Adjustable Dumbbells",
        slug: "adjustable-dumbbells",
        description: "Space-saving adjustable dumbbells for home workouts.",
        price: 8999,
        stock: 20,
        imageUrl:
          "https://images.unsplash.com/photo-1599058917212-d750089bc07e",
        categoryId: fitness.id,
      },
    ],
  });

  console.log("✅ Products created");
}

main()
  .then(() => {
    console.log("🌱 Seeding finished");
  })
  .catch((e) => {
    console.error("❌ Seeding failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });