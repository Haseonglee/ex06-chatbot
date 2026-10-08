// 테이블을 비우고 id를 1부터 다시 시작한 뒤 더미 8건을 넣음 · 계정 3개(있으면 둠) · 세션은 지움 — npm run db:seed
import { sql, eq } from "drizzle-orm";
import { db, client } from "./index";
import { tickets } from "./schema";
import { user, session } from "./auth-schema";
import { auth } from "../auth";
import { TICKETS } from "../../../lib/data";

const ACCOUNTS = [
  { email: "requester@test.local", name: "요청자", role: "requester" },
  { email: "handler@test.local", name: "김담당", role: "handler" },
  { email: "manager@test.local", name: "박부장", role: "manager" },
] as const;

export async function seed() {
  await db.execute(sql`truncate table tickets restart identity`);
  await db.insert(tickets).values(TICKETS.map(({ id, ...rest }) => rest));

  // 비밀번호는 상위 .env의 SEED_PASSWORD
  for (const a of ACCOUNTS) {
    const [found] = await db.select().from(user).where(eq(user.email, a.email));
    if (!found) {
      await auth.api.signUpEmail({ body: { email: a.email, name: a.name, password: process.env.SEED_PASSWORD! } });
      await db.update(user).set({ role: a.role }).where(eq(user.email, a.email));
    }
  }
  await db.delete(session);
}

// npm run db:seed로 직접 실행할 때만
if (process.argv[1]?.endsWith("seed.ts")) {
  seed().then(async () => {
    console.log("seed: 8건 · 계정 3개");
    await client.end();
  });
}
