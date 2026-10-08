// Hono 앱 — 경로 정의에서 만든 계약 문서를 /doc으로 내보냄. 데이터는 Supabase의 tickets 테이블(Drizzle로 읽고 씀)
// 입력 규칙은 Zod 스키마로 적고, @hono/zod-openapi가 핸들러 전에 검사함(실패 → 422)
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { tickets } from "../db/schema";

// 응답 모양
const TicketSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  body: z.string().optional(),
  category: z.string(),
  priority: z.number().int().min(1).max(4),
  status: z.enum(["open", "assigned", "resolved"]),
  assignee: z.string(),
});

const ErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});

// 입력 규칙 표
const CreateTicketSchema = z.object({
  title: z
    .string({ error: "제목을 입력하세요" })
    .trim()
    .min(1, { error: "제목을 입력하세요" })
    .max(100, { error: "제목은 100자 이하로 입력하세요" }),
  body: z.string({ error: "본문은 1000자 이하로 입력하세요" }).max(1000, { error: "본문은 1000자 이하로 입력하세요" }).optional(),
});

const AssignParamsSchema = z.object({
  id: z.coerce
    .number({ error: "요청 번호가 올바르지 않습니다" })
    .int({ error: "요청 번호가 올바르지 않습니다" })
    .min(1, { error: "요청 번호가 올바르지 않습니다" }),
});

const errorResponse = (description: string) => ({
  description,
  content: { "application/json": { schema: ErrorSchema } },
});

// 검사 실패 → 422 · VALIDATION_ERROR · 메시지 하나(표 위쪽 줄 먼저)
export const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json({ code: "VALIDATION_ERROR", message: result.error.issues[0].message }, 422);
    }
  },
});

// 목록(P1 → P4 순)
const listRoute = createRoute({
  method: "get",
  path: "/api/tickets",
  responses: {
    200: { description: "요청 목록", content: { "application/json": { schema: z.array(TicketSchema) } } },
  },
});

app.openapi(listRoute, async (c) => {
  const list = await db.select().from(tickets).orderBy(asc(tickets.priority), asc(tickets.id));
  return c.json(list, 200);
});

// 요청 등록
const createTicketRoute = createRoute({
  method: "post",
  path: "/api/tickets",
  request: {
    body: { required: true, content: { "application/json": { schema: CreateTicketSchema } } },
  },
  responses: {
    201: { description: "만든 요청", content: { "application/json": { schema: TicketSchema } } },
    422: errorResponse("입력 규칙 위반"),
  },
});

app.openapi(createTicketRoute, async (c) => {
  const input = c.req.valid("json");
  const [created] = await db
    .insert(tickets)
    .values({ title: input.title, body: input.body ?? "", category: "미분류", priority: 3, status: "open", assignee: "" })
    .returning();
  return c.json(created, 201);
});

// 나에게 배정
const assignRoute = createRoute({
  method: "post",
  path: "/api/tickets/{id}/assign",
  request: { params: AssignParamsSchema },
  responses: {
    200: { description: "바뀐 요청", content: { "application/json": { schema: TicketSchema } } },
    404: errorResponse("요청을 찾을 수 없습니다"),
    409: errorResponse("open 상태만 배정할 수 있습니다"),
    422: errorResponse("요청 번호가 올바르지 않습니다"),
  },
});

app.openapi(assignRoute, async (c) => {
  const { id } = c.req.valid("param");
  const [found] = await db.select().from(tickets).where(eq(tickets.id, id));
  if (!found) {
    return c.json({ code: "NOT_FOUND", message: "요청을 찾을 수 없습니다" }, 404);
  }
  if (found.status !== "open") {
    return c.json({ code: "CONFLICT", message: "open 상태만 배정할 수 있습니다" }, 409);
  }
  const [updated] = await db
    .update(tickets)
    .set({ status: "assigned", assignee: "나" })
    .where(eq(tickets.id, id))
    .returning();
  return c.json(updated, 200);
});

// 계약 문서(OpenAPI 3.1 JSON) · Swagger UI
app.doc31("/doc", {
  openapi: "3.1.0",
  info: { title: "부서 헬프데스크 API", version: "1.0.0" },
});

app.get("/ui", swaggerUI({ url: "/doc" }));
