
// db.ts for SQLite
// import { PrismaClient } from "@prisma/client";
// import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };

// // I Prisma 7 skickar vi URL:en direkt till adaptern här
// const adapter = new PrismaBetterSqlite3({
//   url: "file:./prisma/dev.db", // Se till att sökvägen stämmer (ofta med file: prefix)
// });

// export const db =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     adapter,
//   });

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = db;
// }

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// 1. Skapa en anslutningspool till Postgres (Neon)
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// 2. Skapa adapter som Prisma kräver i version 7
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 3. Initiera PrismaClient med adapter
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}