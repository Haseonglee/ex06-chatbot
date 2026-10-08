// 공통 처리 — 로그인(/api/auth/*) · 라우트 연결 · JSON 아님 422 · 없는 주소 404 · 예상 못 한 오류 500 · /doc · /ui
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { HTTPException } from "hono/http-exception";
import tickets from "./routes/tickets";
import { auth } from "./auth";

const app = new OpenAPIHono();

// 로그인 · 로그아웃은 Better Auth가 처리
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/api/tickets", tickets);

app.doc("/doc", { openapi: "3.1.0", info: { title: "부서 헬프데스크 API", version: "1.0.0" } });
app.get("/ui", swaggerUI({ url: "/doc" }));

app.notFound((c) => c.json({ code: "NOT_FOUND", message: "없는 주소입니다" }, 404));
app.onError((err, c) => {
  // 본문 JSON을 읽지 못하면 Hono가 400 HTTPException을 던짐
  if (err instanceof HTTPException && err.status === 400) {
    return c.json({ code: "VALIDATION", message: "JSON 형식이 아닙니다" }, 422);
  }
  return c.json({ code: "INTERNAL", message: "서버 오류" }, 500);
});

export default app;
