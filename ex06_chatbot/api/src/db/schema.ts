// tickets 테이블 하나 — npm run db:push로 Supabase에 만듦
import { pgTable, pgEnum, serial, text, integer } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status", ["open", "assigned", "resolved"]);

// RLS 켜고 정책 0개(공개 키로는 못 읽고 못 씀) — 접근은 서버(Drizzle)로만
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  category: text("category").notNull().default("미분류"),
  priority: integer("priority").notNull().default(3),
  status: statusEnum("status").notNull().default("open"),
  assignee: text("assignee").notNull().default(""),
}).enableRLS();
