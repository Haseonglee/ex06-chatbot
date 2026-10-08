// 목록을 다루는 함수들 — 원본 배열은 고치지 않고 항상 새 배열을 돌려줌
import type { Ticket } from "./types";
import type { Filter } from "./data";

export function filterTickets(tickets: Ticket[], filter: Filter): Ticket[] {
  if (filter === "전체") return tickets;
  return tickets.filter((t) => t.status === filter);
}

export function assignTicket(tickets: Ticket[], id: number): Ticket[] {
  return tickets.map((t) => (t.id === id ? { ...t, status: "assigned", assignee: "나" } : t));
}

export function sortByPriority(tickets: Ticket[]): Ticket[] {
  return tickets.slice().sort((a, b) => a.priority - b.priority); // AC-01: P1 → P4 순
}

// 새 요청을 목록 맨 뒤에 붙인 '새 배열'을 돌려줌 (US-04 · AC-04)
export function addTicket(tickets: Ticket[], title: string, body: string): Ticket[] {
  const localtitle = title.trim();
  if (localtitle == "") {
    return tickets;
  }

  let localid = 0;
  for (let i = 0; i < tickets.length; ++i) {
    const token = tickets[i];
    localid = token.id > localid ? token.id : localid;
  }
  localid += 1;
  const newTicket: Ticket = { id: localid, title: localtitle, body: body, category: "미분류", priority: 3, status: "open", assignee: "" };

  return [...tickets, newTicket];
}
