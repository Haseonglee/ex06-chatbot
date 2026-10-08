// 엔드포인트 3개(계약 기준은 /doc) — Zod 스키마로 입력 검사 · 문서를 함께 만듦
// 데이터는 Supabase tickets 테이블(Drizzle로 읽고 씀 · 서버를 다시 켜도 남음)
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { asc, eq } from "drizzle-orm";
import { db } from "../db";
import { tickets } from "../db/schema";
import { auth } from "../auth";

// 응답 양식
const TicketSchema = z
  .object({
    id: z.number().int(),
    title: z.string(),
    body: z.string().optional(),
    category: z.string(),
    priority: z.number().int().min(1).max(4),
    status: z.enum(["open", "assigned", "resolved"]),
    assignee: z.string(),
  })
  .openapi("Ticket");

const ErrorSchema = z
  .object({ code: z.string(), message: z.string() })
  .openapi("Error");

// 입력 규칙 표
const CreateTicketSchema = z.object(
  {
    title: z.string({ error: "제목을 입력하세요" }).trim().min(1, "제목을 입력하세요"),
    body: z.string().max(4000, "본문은 4000자 이하로 입력하세요").optional(),
  },
  { error: "JSON 형식이 아닙니다" }
);

const IdParamSchema = z.object({
  id: z.coerce
    .number({ error: "id는 숫자여야 합니다" })
    .int("id는 숫자여야 합니다")
    .min(1, "id는 숫자여야 합니다")
    .openapi({ param: { name: "id", in: "path" }, example: 1 }),
});

const json = (schema: z.ZodType, description: string) => ({
  content: { "application/json": { schema } },
  description,
});

// 라우트 정의 3개
const listRoute = createRoute({
  method: "get",
  path: "/",
  responses: { 200: json(z.array(TicketSchema), "목록(P1 → P4 순)") },
});

const createTicketRoute = createRoute({
  method: "post",
  path: "/",
  request: { body: { content: { "application/json": { schema: CreateTicketSchema } }, required: true } },
  responses: {
    201: json(TicketSchema, "만든 요청"),
    401: json(ErrorSchema, "로그인이 필요합니다"),
    422: json(ErrorSchema, "입력 오류"),
  },
});

const assignRoute = createRoute({
  method: "post",
  path: "/{id}/assign",
  request: { params: IdParamSchema },
  responses: {
    200: json(TicketSchema, "바뀐 요청"),
    401: json(ErrorSchema, "로그인이 필요합니다"),
    403: json(ErrorSchema, "배정 권한이 없습니다"),
    404: json(ErrorSchema, "요청을 찾을 수 없습니다"),
    409: json(ErrorSchema, "open 상태만 배정할 수 있습니다"),
    422: json(ErrorSchema, "입력 오류"),
  },
});

// 검사가 틀리면 422 · 첫 번째 이유 하나만
const route = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json({ code: "VALIDATION", message: result.error.issues[0].message }, 422);
    }
  },
});

route.openapi(listRoute, async (c) => {
  const list = await db.select().from(tickets).orderBy(asc(tickets.priority), asc(tickets.id));
  return c.json(list, 200);
});

route.openapi(createTicketRoute, async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ code: "UNAUTHORIZED", message: "로그인이 필요합니다" }, 401);
  }
  const { title, body } = c.req.valid("json");
  const [created] = await db.insert(tickets).values({ title, body: body ?? "" }).returning();
  return c.json(created, 201);
});

route.openapi(assignRoute, async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ code: "UNAUTHORIZED", message: "로그인이 필요합니다" }, 401);
  }
  if (session.user.role !== "handler" && session.user.role !== "manager") {
    return c.json({ code: "FORBIDDEN", message: "배정 권한이 없습니다" }, 403);
  }
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
    .set({ status: "assigned", assignee: session.user.name })
    .where(eq(tickets.id, id))
    .returning();
  return c.json(updated, 200);
});

export default route;
