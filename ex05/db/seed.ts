// 처음 데이터 — 테이블을 비우고 id를 1부터 다시 센 뒤 lib/data.ts의 8건을 그 순서대로 넣음(npm run db:seed)
import { sql } from "drizzle-orm";
import { db, client } from "./index";
import { tickets } from "./schema";
import { TICKETS } from "../lib/data";

export async function seed() {
  await db.execute(sql`TRUNCATE TABLE ${tickets} RESTART IDENTITY`);
  for (const t of TICKETS) {
    await db.insert(tickets).values({
      title: t.title,
      body: t.body ?? "",
      category: t.category,
      priority: t.priority,
      status: t.status,
      assignee: t.assignee,
    });
  }
}

// 직접 실행하면 seed() 후 접속을 닫음
if (process.argv[1]?.endsWith("seed.ts")) {
  seed().then(() => client.end());
}
