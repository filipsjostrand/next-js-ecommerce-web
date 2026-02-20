import { defineConfig } from "prisma/config";

export default defineConfig({
  migrations: {
    path: "./prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },

  datasource: {
    url: "file:./prisma/dev.db",
  },
});
