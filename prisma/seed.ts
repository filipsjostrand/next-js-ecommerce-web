import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcrypt";

// Vi måste berätta för Prisma hur den ska prata med SQLite, precis som i db.ts
const adapter = new PrismaBetterSqlite3({
  url: "prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

// import { PrismaClient } from "@prisma/client"; // Använd standard-importen
// import bcrypt from "bcrypt";

// // Vi skapar en vanlig klient. Den kommer använda DATABASE_URL från din .env
// const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Startar seeding...");

  const adminEmail = "admin@ggadmin.com";
  // Vi hårdkodar lösenordet här för att vara 100% säkra på vad som hamnar i DB
  const adminPassword = "my_secret_pw_123";

  console.log(`Haschar lösenord för ${adminEmail}...`);
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // 1. Skapa/Uppdatera Admin
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: "admin",
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log(`✅ Admin-användare klar. Lösenordet är: ${adminPassword}`);

  // 2. Rensa gammal butiksdata (viktigt för att undvika dubbletter)
  await prisma.orderItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 3. Skapa Kategorier
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Basketball", slug: "basketball" } }),
    prisma.category.create({ data: { name: "Fitness", slug: "fitness" } }),
    prisma.category.create({ data: { name: "Football", slug: "football" } }),
    prisma.category.create({ data: { name: "Running", slug: "running" } }),
  ]);

  console.log("✅ Kategorier skapade");

  const basketball = categories.find(c => c.slug === "basketball");
  const fitness = categories.find(c => c.slug === "fitness");
  const football = categories.find(c => c.slug === "football");

  // 4. Skapa Produkter
  await prisma.product.createMany({
    data: [
      {
        name: "Elite Basketball",
        slug: "elite-basketball",
        description: "Indoor/outdoor composite leather basketball.",
        price: 2499,
        stock: 40,
        imageUrl: "https://images.unsplash.com/photo-1519861531473-9200262188bf",
        categoryId: basketball!.id,
      },
      {
        name: "Pro Match Football",
        slug: "pro-match-football",
        description: "FIFA-approved professional match football.",
        price: 2999,
        stock: 50,
        imageUrl: "https://images.unsplash.com/photo-1600679472829-3044539ce8ed",
        categoryId: football!.id,
      },
      {
        name: "Adjustable Dumbbells",
        slug: "adjustable-dumbbells",
        description: "Space-saving adjustable dumbbells for home workouts.",
        price: 8999,
        stock: 20,
        imageUrl: "https://images.unsplash.com/photo-1599058917212-d750089bc07e",
        categoryId: fitness!.id,
      },
    ],
  });

  console.log("✅ Produkter skapade");
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