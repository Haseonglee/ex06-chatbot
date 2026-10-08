// Hono 서버 — openapi.yaml 계약대로 답함. 데이터는 메모리 배열(다시 켜면 처음 8건)
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { TICKETS } from "../lib/data";
import { assignTicket, sortByPriority, addTicket } from "../lib/tickets";
import type { Ticket } from "../lib/types";

let tickets: Ticket[] = TICKETS;

const app = new Hono();

// 목록(P1 → P4 순)
app.get("/api/tickets", (c) => c.json(sortByPriority(tickets), 200));

// 요청 등록
app.post("/api/tickets", async (c) => {
  const input = await c.req.json<{ title?: string; body?: string }>();
  const title = String(input.title ?? "");
  const body = String(input.body ?? "");
  if (title.trim() == "") {
    return c.json({ code: "VALIDATION_ERROR", message: "제목을 입력하세요" }, 422);
  }
  tickets = addTicket(tickets, title, body);
  return c.json(tickets[tickets.length - 1], 201);
});

// 나에게 배정
app.post("/api/tickets/:id/assign", (c) => {
  const id = Number(c.req.param("id"));
  const found = tickets.find((t) => t.id === id);
  if (!found) {
    return c.json({ code: "NOT_FOUND", message: "요청을 찾을 수 없습니다" }, 404);
  }
  if (found.status !== "open") {
    return c.json({ code: "CONFLICT", message: "open 상태만 배정할 수 있습니다" }, 409);
  }
  tickets = assignTicket(tickets, id);
  return c.json(tickets.find((t) => t.id === id), 200);
});

serve({ fetch: app.fetch, port: 8787 });
console.log("Hono 서버: http://localhost:8787");
