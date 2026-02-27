import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  migrations: {
    path: "./prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },

  datasource: {
    // Läsning från .env-fil
    url: process.env.DATABASE_URL,
  },
});


// SQL-db
// import { defineConfig } from "prisma/config";

// export default defineConfig({
//   migrations: {
//     path: "./prisma/migrations",
//     seed: "tsx prisma/seed.ts",
//   },

//   datasource: {
//     url: "file:./prisma/dev.db",
//   },
// });
