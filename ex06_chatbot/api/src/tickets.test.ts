// Hono 앱을 서버 켜지 않고 요청해 보는 테스트 — npm test
// 테스트끼리 데이터가 이어지므로 등록 · 배정은 아래 순서대로
import { test, expect, beforeAll } from "vitest";
import app from "./app";
import { seed } from "./db/seed";

// 로그인 쿠키(handler · requester)
let handlerCookie = "";
let requesterCookie = "";

async function signIn(email: string) {
  const res = await app.request("/api/auth/sign-in/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: process.env.SEED_PASSWORD }),
  });
  return res.headers.get("set-cookie")!.split(";")[0];
}

// 맨 앞에서 seed 한 번(실행할 때마다 8건 · id 9에서 출발) · 로그인
beforeAll(async () => {
  await seed();
  handlerCookie = await signIn("handler@test.local");
  requesterCookie = await signIn("requester@test.local");
});

// 쿠키를 안 주면 handler로 로그인한 요청
function post(path: string, data?: unknown, cookie = handlerCookie) {
  return app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
}

test("목록을 요청하면 8건을 P1부터 준다", async () => {
  const res = await app.request("/api/tickets");
  expect(res.status).toBe(200);
  const list = await res.json();
  expect(list.length).toBe(8);
  expect(list[0].priority).toBe(1);
});

test("제목이 있으면 등록된다", async () => {
  const res = await post("/api/tickets", { title: "테스트" });
  expect(res.status).toBe(201);
  const ticket = await res.json();
  expect(ticket.status).toBe("open");
});

test("빈 제목이면 반려된다", async () => {
  const res = await post("/api/tickets", { title: "  " });
  expect(res.status).toBe(422);
  const err = await res.json();
  expect(err.message).toBe("제목을 입력하세요");
});

test("본문이 4001자면 반려된다", async () => {
  const res = await post("/api/tickets", { title: "긴 본문", body: "가".repeat(4001) });
  expect(res.status).toBe(422);
  const err = await res.json();
  expect(err.message).toBe("본문은 4000자 이하로 입력하세요");
});

test("없는 번호를 배정하면 404", async () => {
  const res = await post("/api/tickets/999/assign");
  expect(res.status).toBe(404);
  const err = await res.json();
  expect(err.message).toBe("요청을 찾을 수 없습니다");
});

test("같은 요청을 두 번 배정하면 409", async () => {
  const first = await post("/api/tickets/1/assign");
  expect(first.status).toBe(200);
  const second = await post("/api/tickets/1/assign");
  expect(second.status).toBe(409);
});

test("로그인 없이 등록하면 401", async () => {
  const res = await post("/api/tickets", { title: "x" }, "");
  expect(res.status).toBe(401);
  const err = await res.json();
  expect(err.message).toBe("로그인이 필요합니다");
});

test("requester가 배정하면 403", async () => {
  const res = await post("/api/tickets/2/assign", undefined, requesterCookie);
  expect(res.status).toBe(403);
  const err = await res.json();
  expect(err.message).toBe("배정 권한이 없습니다");
});

test("문서에 엔드포인트 3개가 있다", async () => {
  const res = await app.request("/doc");
  expect(res.status).toBe(200);
  const doc = await res.json();
  let count = 0;
  for (const path of Object.values(doc.paths)) {
    count += Object.keys(path as object).length;
  }
  expect(count).toBe(3);
});
