// 엔드포인트 1개 POST /api/chat — Zod 스키마로 입력 검사 · 문서를 함께 만듦
// Anthropic API(Haiku)를 호출해 답을 돌려줌 · 키는 .env의 ANTHROPIC_API_KEY(서버에서만 읽음)
// 시스템 프롬프트는 api/system_prompt.txt를 요청마다 읽음(고치면 서버를 다시 켜지 않아도 반영됨 · 비어 있으면 보내지 않음)
import { readFileSync } from "node:fs";
import { config } from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

config({ path: ".env", quiet: true });
const anthropic = new Anthropic();

// 응답 양식
const ChatReplySchema = z.object({ reply: z.string() }).openapi("ChatReply");

const ErrorSchema = z
  .object({ code: z.string(), message: z.string() })
  .openapi("Error");

// 입력 규칙 표
const ChatSchema = z.object(
  {
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"], { error: "role은 user 또는 assistant여야 합니다" }),
          content: z
            .string({ error: "메시지를 입력하세요" })
            .trim()
            .min(1, "메시지를 입력하세요")
            .max(2000, "메시지는 2000자 이하로 입력하세요"),
        }),
        { error: "메시지를 입력하세요" }
      )
      .min(1, "메시지를 입력하세요"),
  },
  { error: "JSON 형식이 아닙니다" }
);

const json = (schema: z.ZodType, description: string) => ({
  content: { "application/json": { schema } },
  description,
});

// 라우트 정의 1개
const chatRoute = createRoute({
  method: "post",
  path: "/",
  request: { body: { content: { "application/json": { schema: ChatSchema } }, required: true } },
  responses: {
    200: json(ChatReplySchema, "챗봇 답변"),
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

route.openapi(chatRoute, async (c) => {
  const { messages } = c.req.valid("json");
  const system = readFileSync("api/system_prompt.txt", "utf8").trim();
  const res = await anthropic.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 4096,
    ...(system ? { system } : {}),
    messages,
  });
  const reply = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
  return c.json({ reply }, 200);
});

export default route;
