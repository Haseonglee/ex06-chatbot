export type Status = "open" | "assigned" | "resolved";

export type Ticket = {
  id: number;
  title: string;
  body?: string;
  category: string;
  priority: number;
  status: Status;
  assignee: string;
};
