import type { Ticket } from "@/lib/types";

type Props = {
  ticket: Ticket;
  onAssign: (id: number) => void;
};

export default function TicketCard({ ticket, onAssign }: Props) {
  const label = { open: "나에게 배정", assigned: "배정 완료", resolved: "처리 완료" }[ticket.status];
  return (
    <div className="card" data-status={ticket.status} data-id={ticket.id}>
      <h3>{ticket.title}</h3>
      <p>{ticket.category} · P{ticket.priority}</p>
      <p><span className="badge">{ticket.status}</span>{ticket.assignee && ` · 담당: ${ticket.assignee}`}</p>
      <button disabled={ticket.status !== "open"} onClick={() => onAssign(ticket.id)}>{label}</button>
    </div>
  );
}
