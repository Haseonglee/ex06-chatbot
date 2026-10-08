// 중계(BFF) — 배정 요청을 Hono에 넘기고 상태 코드 · JSON 본문을 그대로 돌려줌
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`http://localhost:8787/api/tickets/${id}/assign`, { method: "POST" });
  return Response.json(await res.json(), { status: res.status });
}
