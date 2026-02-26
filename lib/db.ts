// lib/db.ts

// Skapar konfigurationen som biblioteket efterfrågar
export const dbConfig = {
  url: "sqlite.db", // Här är 'url' som TypeScript klagade på att den saknade
};

// Om databasen behöver användas på andra ställen i koden manuellt:
import Database from 'better-sqlite3';
export const sqlite = new Database(dbConfig.url);