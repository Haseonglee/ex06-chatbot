"use client"; // useState·onClick을 쓰므로 브라우저에서 도는 컴포넌트

import { useEffect, useRef, useState, type SubmitEvent } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatBox() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight); // 새 글이 생기면 맨 아래로
  }, [messages, loading, error, open]);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault(); // 폼을 보내도 페이지가 새로고침되지 않게 막음
    const form = e.currentTarget;
    const content = String(new FormData(form).get("message") ?? "").trim();
    if (!content || loading) return;
    form.reset();
    const next: Message[] = [...messages, { role: "user", content }];
    setMessages(next);
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.reply) {
        setError(data.message ?? "답변을 받지 못했습니다");
      } else {
        setMessages([...next, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setError("답변을 받지 못했습니다");
    }
    setLoading(false);
  }

  return (
    <>
      {open && (
        <div className="chatbox" role="dialog" aria-label="챗봇">
          <div className="chathead">챗봇</div>
          <div className="chatlist" ref={listRef}>
            {messages.length === 0 && <p className="hint">궁금한 점을 물어보세요.</p>}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "chatmsg user" : "chatmsg bot"}>{m.content}</div>
            ))}
            {loading && <div className="chatmsg bot">…</div>}
            {error && <p className="err">{error}</p>}
          </div>
          <form className="chatform" noValidate onSubmit={handleSubmit}>
            <input type="text" name="message" placeholder="메시지를 입력하세요" autoComplete="off" />
            <button type="submit" className="primary" disabled={loading}>전송</button>
          </form>
        </div>
      )}
      <button className="primary chatfab" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? "닫기" : "챗봇"}
      </button>
    </>
  );
}
