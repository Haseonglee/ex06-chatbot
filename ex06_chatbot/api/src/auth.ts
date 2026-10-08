// Better Auth 이메일 로그인 — /api/auth/*를 처리 · 세션 쿠키(HttpOnly) · session 테이블
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/auth-schema";

// BETTER_AUTH_SECRET · BETTER_AUTH_URL은 상위 .env(db/index.ts가 읽음)
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
  trustedOrigins: ["http://localhost:3000"],
  user: {
    additionalFields: {
      // 가입 입력으로 못 바꿈(input: false)
      role: { type: "string", defaultValue: "requester", input: false },
    },
  },
});
