import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: "../.env", quiet: true });

export default defineConfig({
  dialect: "postgresql",
  schema: ["./api/src/db/schema.ts", "./api/src/db/auth-schema.ts"],
  dbCredentials: { url: process.env.DATABASE_URL! },
  tablesFilter: ["tickets", "user", "session", "account", "verification"],
});
