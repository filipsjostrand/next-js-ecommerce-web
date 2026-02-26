import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// I Prisma 7 skickar vi URL:en direkt till adaptern här
const adapter = new PrismaBetterSqlite3({
  url: "file:./prisma/dev.db", // Se till att sökvägen stämmer (ofta med file: prefix)
});

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}