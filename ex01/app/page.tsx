"use client"; // useState·onClick을 쓰므로 브라우저에서 도는 컴포넌트

import { useState, type SubmitEvent } from "react";
import TicketCard from "@/components/TicketCard";
import { TICKETS, FILTERS, type Filter } from "@/lib/data";
import { filterTickets, assignTicket, sortByPriority, addTicket } from "@/lib/tickets";

export default function Page() {
  const [filter, setFilter] = useState<Filter>("전체");
  const [tickets, setTickets] = useState(TICKETS);
  const [message, setMessage] = useState("");
  const visible = sortByPriority(filterTickets(tickets, filter));

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault(); // 폼을 보내도 페이지가 새로고침되지 않게 막음
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") ?? "");
    const body = String(form.get("body") ?? "");

    if (title.trim() == "") {
      setMessage("제목을 입력하세요");
    } else {
      setTickets(addTicket(tickets, title, body));
      setMessage("등록됨: " + title.trim());
      e.currentTarget.reset();
    }
  }

  return (
    <main className="app">
      <h1>부서 헬프데스크</h1>
      <div className="moscow">
        <span className="must">Must ① 요청 목록 · ② 나에게 배정</span>
        <span className="should">Should ④ 상태 필터</span>
        <span className="could">Could ③ 요청 등록 폼</span>
        <span className="wont">Won&apos;t 로그인·권한 · DB 저장 · AI 분류</span>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <input name="title" placeholder="요청 제목 (필수)" />
        <input name="body" placeholder="본문 (선택)" />
        <button type="submit">등록</button>
        {message && <span className="msg">{message}</span>}
      </form>
      <div className="tabs">
        {FILTERS.map((f) => (
          <button key={f} className={f === filter ? "tab on" : "tab"} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      <div className="board">
        {visible.map((t) => (
          <TicketCard key={t.id} ticket={t} onAssign={(id) => setTickets(assignTicket(tickets, id))} />
        ))}
      </div>
    </main>
  );
}
