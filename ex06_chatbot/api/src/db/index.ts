// DB 연결 — 상위 day2_vibe/.env의 DATABASE_URL을 읽음
import { config } from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

config({ path: "../.env", quiet: true });

// Supabase transaction pooler(6543)는 prepare를 못 씀
export const client = postgres(process.env.DATABASE_URL!, { prepare: false });
export const db = drizzle(client);
