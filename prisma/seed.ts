import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcrypt";

const adapter = new PrismaBetterSqlite3({
  url: "prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Startar seeding...");

  const adminEmail = "admin@ggadmin.com";
  const adminPassword = "my_secret_pw_123";

  console.log(`Haschar lösenord för ${adminEmail}...`);
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // 1. Skapa/Uppdatera Admin
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`✅ Admin-användare klar.`);

  // 2. Rensa gammal data
  await prisma.orderItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 3. Skapa Kategorier
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Basket", slug: "basket" } }),
    prisma.category.create({ data: { name: "Träning", slug: "traning" } }),
    prisma.category.create({ data: { name: "Fotboll", slug: "fotboll" } }),
    prisma.category.create({ data: { name: "Löpning", slug: "lopning" } }),
  ]);

  console.log("✅ Kategorier skapade");

  const basket = categories.find(c => c.slug === "basket");
  const traning = categories.find(c => c.slug === "traning");
  const fotboll = categories.find(c => c.slug === "fotboll");

  // 4. Skapa Produkter (Priser i ören: 249 kr -> 24900)
  await prisma.product.createMany({
    data: [
      {
        name: "Elite Basketball",
        slug: "elite-basketball",
        description: "Professionell basketboll för både inomhus- och utomhusbruk.",
        price: 24900, // 249 kr
        stock: 40,
        imageUrl: "https://images.unsplash.com/photo-1519861531473-9200262188bf",
        categoryId: basket!.id,
      },
      {
        name: "Pro Match Fotboll",
        slug: "pro-match-fotboll",
        description: "FIFA-godkänd matchboll för professionellt spel.",
        price: 39900, // 399 kr
        stock: 50,
        imageUrl: "https://images.unsplash.com/photo-1600679472829-3044539ce8ed",
        categoryId: fotboll!.id,
      },
      {
        name: "Adjustable-Dumbbells",
        slug: "adjustable-dumbbells",
        description: "Platsbesparande hantlar perfekt för hemmaträning.",
        price: 89900, // 899 kr
        stock: 20,
        imageUrl: "https://images.unsplash.com/photo-1599058917212-d750089bc07e",
        categoryId: traning!.id,
      },
    ],
  });

  console.log("✅ Produkter skapade med priser i ören (SEK)");
}

main()
  .then(async () => {
    console.log("🌱 Seeding slutförd!");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding misslyckades:", e);
    await prisma.$disconnect();
    process.exit(1);
  });