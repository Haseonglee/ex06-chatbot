// drizzle-kit 설정(npm run db:push) — 스키마 db/schema.ts · 접속은 .env의 DATABASE_URL
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
