// tickets 테이블 정의 — 칸은 lib/types.ts의 Ticket과 같음
import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  category: text("category").notNull(),
  priority: integer("priority").notNull(),
  status: text("status", { enum: ["open", "assigned", "resolved"] }).notNull(),
  assignee: text("assignee").notNull().default(""),
});
