// 서버를 켜지 않고 앱에 바로 요청함(app.request). 데이터(메모리)는 위에서부터 이어서 씀
import { describe, it, expect } from "vitest";
import { app } from "./app";

const post = (path: string, body?: unknown) =>
  app.request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

describe("부서 헬프데스크 API", () => {
  it("GET /api/tickets → 200 · 8건 · 첫 건 VPN 접속 오류 · P1 → P4 순", async () => {
    const res = await app.request("/api/tickets");
    expect(res.status).toBe(200);
    const list = await res.json();
    expect(list).toHaveLength(8);
    expect(list[0].title).toBe("VPN 접속 오류");
    const priorities = list.map((t: { priority: number }) => t.priority);
    expect(priorities).toEqual([...priorities].sort((a, b) => a - b));
  });

  it("POST /api/tickets 모니터 교체 → 201 · 미분류 · P3 · open", async () => {
    const res = await post("/api/tickets", { title: "모니터 교체" });
    expect(res.status).toBe(201);
    const t = await res.json();
    expect(t.category).toBe("미분류");
    expect(t.priority).toBe(3);
    expect(t.status).toBe("open");
  });

  it("POST /api/tickets 공백 제목 · 숫자 제목 → 422 · 제목을 입력하세요", async () => {
    for (const title of ["  ", 123]) {
      const res = await post("/api/tickets", { title });
      expect(res.status).toBe(422);
      expect(await res.json()).toEqual({ code: "VALIDATION_ERROR", message: "제목을 입력하세요" });
    }
  });

  it("POST /api/tickets 제목 100자 → 201 · 101자 → 422", async () => {
    expect((await post("/api/tickets", { title: "a".repeat(100) })).status).toBe(201);
    const res = await post("/api/tickets", { title: "a".repeat(101) });
    expect(res.status).toBe(422);
    expect((await res.json()).message).toBe("제목은 100자 이하로 입력하세요");
  });

  it("POST /api/tickets 본문 1001자 → 422", async () => {
    const res = await post("/api/tickets", { title: "t", body: "a".repeat(1001) });
    expect(res.status).toBe(422);
    expect((await res.json()).message).toBe("본문은 1000자 이하로 입력하세요");
  });

  it("POST /api/tickets/1/assign → 200 · assigned · 나", async () => {
    const res = await post("/api/tickets/1/assign");
    expect(res.status).toBe(200);
    const t = await res.json();
    expect(t.status).toBe("assigned");
    expect(t.assignee).toBe("나");
  });

  it("배정 실패 → 409 · 404 · 422 · 422", async () => {
    const cases: [string, number, string][] = [
      ["/api/tickets/3/assign", 409, "open 상태만 배정할 수 있습니다"],
      ["/api/tickets/999/assign", 404, "요청을 찾을 수 없습니다"],
      ["/api/tickets/abc/assign", 422, "요청 번호가 올바르지 않습니다"],
      ["/api/tickets/0/assign", 422, "요청 번호가 올바르지 않습니다"],
    ];
    for (const [path, status, message] of cases) {
      const res = await post(path);
      expect(res.status).toBe(status);
      expect((await res.json()).message).toBe(message);
    }
  });

  it("실패 본문 → 키가 code · message 두 개뿐", async () => {
    const res = await post("/api/tickets", { title: "  " });
    expect(Object.keys(await res.json()).sort()).toEqual(["code", "message"]);
  });

  it("GET /doc → 200 · 경로 2개 · 상태 코드 200/201/404/409/422", async () => {
    const res = await app.request("/doc");
    expect(res.status).toBe(200);
    const doc = await res.json();
    expect(Object.keys(doc.paths)).toEqual(expect.arrayContaining(["/api/tickets", "/api/tickets/{id}/assign"]));
    const codes = new Set<string>();
    for (const item of Object.values(doc.paths) as Record<string, { responses: Record<string, unknown> }>[]) {
      for (const op of Object.values(item)) Object.keys(op.responses).forEach((k) => codes.add(k));
    }
    expect([...codes].sort()).toEqual(["200", "201", "404", "409", "422"]);
  });
});
