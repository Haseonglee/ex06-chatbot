// 중계(BFF) — 받은 요청을 Hono에 넘기고 상태 코드 · JSON 본문을 그대로 돌려줌
const HONO = "http://localhost:8787/api/tickets";

export async function GET() {
  const res = await fetch(HONO, { cache: "no-store" });
  return Response.json(await res.json(), { status: res.status });
}

export async function POST(req: Request) {
  const res = await fetch(HONO, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await req.text(),
  });
  return Response.json(await res.json(), { status: res.status });
}
