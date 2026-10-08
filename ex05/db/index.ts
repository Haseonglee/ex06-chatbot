// DB 접속 — .env의 DATABASE_URL을 읽어 postgres + Drizzle로 접속한 db를 내보냄
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

// Supabase Transaction 풀러(6543)는 prepared statement를 쓰지 못해 prepare: false
export const client = postgres(process.env.DATABASE_URL!, { prepare: false });
export const db = drizzle(client);
