// BFF 중계 — 받은 요청을 Hono(:8787)로 그대로 넘기고 응답을 그대로 돌려줌(쿠키도 양쪽으로)
const API = "http://localhost:8787";

async function relay(req: Request) {
  const url = new URL(req.url);
  try {
    const res = await fetch(API + url.pathname + url.search, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.get("cookie") ?? "",
        origin: req.headers.get("origin") ?? "http://localhost:3000",
      },
      body: req.method === "GET" ? undefined : await req.text(),
    });
    const headers = new Headers({ "Content-Type": "application/json" });
    for (const c of res.headers.getSetCookie()) headers.append("Set-Cookie", c);
    return new Response(await res.text(), { status: res.status, headers });
  } catch {
    return Response.json({ code: "BAD_GATEWAY", message: "API 서버에 연결할 수 없습니다" }, { status: 502 });
  }
}

export const GET = relay;
export const POST = relay;
