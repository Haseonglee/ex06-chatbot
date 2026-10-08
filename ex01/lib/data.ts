// 더미 요청 8개(가상의 샘플) — DB 서버가 생기면 이 자리가 실제 DB 조회로 바뀜
import type { Ticket } from "./types";

export const TICKETS: Ticket[] = [
  { id: 1, title: "VPN 접속 오류", category: "INCIDENT", priority: 1, status: "open", assignee: "" },
  { id: 2, title: "계정 잠금 해제", category: "ACCOUNT", priority: 2, status: "open", assignee: "" },
  { id: 3, title: "폴더 권한 신청", category: "PERMISSION", priority: 3, status: "assigned", assignee: "김대리" },
  { id: 4, title: "월간 데이터 추출", category: "DATA_REQUEST", priority: 4, status: "open", assignee: "" },
  { id: 5, title: "프린터 연결 안 됨", category: "INCIDENT", priority: 2, status: "resolved", assignee: "박주임" },
  { id: 6, title: "신규 입사자 계정 생성", category: "ACCOUNT", priority: 3, status: "open", assignee: "" },
  { id: 7, title: "공유 드라이브 용량 증설", category: "PERMISSION", priority: 4, status: "assigned", assignee: "이과장" },
  { id: 8, title: "분기 실적 자료 요청", category: "DATA_REQUEST", priority: 2, status: "open", assignee: "" },
];

export const FILTERS = ["전체", "open", "assigned", "resolved"] as const;
export type Filter = (typeof FILTERS)[number];
