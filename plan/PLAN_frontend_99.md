# PLAN_frontend_99 — 화면 계획 (1일차 결과 · 이미 구현됨)

> `SPEC.md`(1일차 요구 명세)의 화면을 **어떻게 만들었는가**를 적은 계획서. `PLAN.md`가 가리키는 서브 플랜 중 하나.
> 상태: **구현 완료**. 코드: `ex00/` 폴더(1일차 `full_stack_ex10`과 같은 코드).
> 이 문서는 고치지 않음. 2일차 변경(서버 · 화면 모두)은 `plan/PLAN_backend_exXX.md`에 적음.

## 탐색 — 출발할 때 있던 것과 제약

- 요구는 `SPEC.md`의 US-01~US-04 · AC-01~AC-04. 범위 밖(Won't): 로그인 · 권한, DB 저장, AI 자동 분류, 챗봇 · SLA 시계.
- 1일차 범위는 **화면만**. 데이터는 코드 안의 더미 배열(메모리)이고, 서버 API · DB · 로그인은 없음.
- 실행 환경: Node.js 20.9 이상. 패키지는 상위 `day2_vibe` 폴더에서 `npm install` 한 번(ex 폴더들이 같이 씀) → `ex00` 폴더에서 `npm run dev` → http://localhost:3000.

## 계획 — 기술 선택과 구조

### 기술

| 항목 | 선택 |
|---|---|
| 화면 프레임워크 | Next.js 16(App Router, `next ^16.3.8`) + React 19(`react ^19.3.0`) |
| 언어 | TypeScript(strict, `typescript ^7.0.2`). 경로 별칭 `@/*` → 프로젝트 루트. 폼 이벤트 타입은 React의 `SubmitEvent<HTMLFormElement>`(그대로 둘 것) |
| 스타일 | `app/globals.css` 한 파일(일반 CSS 클래스) |
| 데이터 | `lib/data.ts`의 배열 — 서버 · DB 없음 |
| 상태 관리 | 페이지 컴포넌트의 `useState`만 |

### 파일 구조

| 파일 | 하는 일 |
|---|---|
| `app/layout.tsx` | `<html lang="ko">` 뼈대 · 탭 제목 "부서 헬프데스크" · `globals.css` 불러오기 |
| `app/page.tsx` | 한 페이지 전체(목록 · 등록 폼 · 상태 탭). 맨 위 `"use client"`(브라우저에서 도는 컴포넌트) |
| `components/TicketCard.tsx` | 요청 카드 하나 |
| `lib/types.ts` | 데이터 모양(`Status` · `Ticket`) |
| `lib/data.ts` | 더미 요청 8건(`TICKETS`) · 상태 탭 목록(`FILTERS`) |
| `lib/tickets.ts` | 목록을 다루는 함수 4개 |
| `package.json` · `next.config.ts` · `tsconfig.json` | 실행 명령(`dev` · `build` · `start`) · 패키지 위치(상위 폴더) 설정 · TypeScript 설정 |

### 데이터 모양 (`lib/types.ts`)

- `Status` = `"open" | "assigned" | "resolved"`
- `Ticket` = `{ id: number; title: string; body?: string; category: string; priority: number; status: Status; assignee: string }`
  - `priority`는 1~4(P1이 가장 급함). `assignee`가 빈 문자열이면 담당자 없음.

### 더미 데이터 (`lib/data.ts`)

| id | 제목 | 분류 | 우선순위 | 상태 | 담당자 |
|---|---|---|---|---|---|
| 1 | VPN 접속 오류 | INCIDENT | 1 | open | — |
| 2 | 계정 잠금 해제 | ACCOUNT | 2 | open | — |
| 3 | 폴더 권한 신청 | PERMISSION | 3 | assigned | 김대리 |
| 4 | 월간 데이터 추출 | DATA_REQUEST | 4 | open | — |
| 5 | 프린터 연결 안 됨 | INCIDENT | 2 | resolved | 박주임 |
| 6 | 신규 입사자 계정 생성 | ACCOUNT | 3 | open | — |
| 7 | 공유 드라이브 용량 증설 | PERMISSION | 4 | assigned | 이과장 |
| 8 | 분기 실적 자료 요청 | DATA_REQUEST | 2 | open | — |

- `FILTERS` = `["전체", "open", "assigned", "resolved"]`, `Filter`는 이 넷 중 하나.

### 목록 함수 (`lib/tickets.ts`) — 원본 배열은 고치지 않고 항상 새 배열을 돌려줌

| 함수 | 동작 |
|---|---|
| `filterTickets(tickets, filter)` | "전체"면 그대로, 아니면 그 상태인 요청만 |
| `assignTicket(tickets, id)` | 그 id의 요청만 `status: "assigned"`, `assignee: "나"`로 바꾼 새 배열. 로그인이 없으므로 담당자는 고정 글자 "나". 상태는 확인하지 않음(open이 아닌 카드는 버튼 비활성으로만 막음) |
| `sortByPriority(tickets)` | 복사본을 우선순위 오름차순(P1 → P4)으로 정렬. 같은 우선순위는 원래 순서 유지 |
| `addTicket(tickets, title, body)` | 제목 앞뒤 공백을 지우고, 비어 있으면 원래 배열을 그대로 돌려줌. 아니면 새 요청을 맨 뒤에 붙인 새 배열: `id` = 지금 가장 큰 id + 1(목록이 비면 1, for 반복문으로 계산), `title` = 다듬은 제목, `body` = 받은 본문(비어 있어도 빈 문자열로 저장), `category: "미분류"`, `priority: 3`, `status: "open"`, `assignee: ""` |

### 화면 (`app/page.tsx` · `components/TicketCard.tsx`)

- 상태값 3개: `filter`(처음 "전체") · `tickets`(처음 `TICKETS`) · `message`(처음 빈 문자열).
- 보이는 목록 = `sortByPriority(filterTickets(tickets, filter))`.
- 위에서부터 차례로:
  1. 제목 `<h1>부서 헬프데스크</h1>`
  2. MoSCoW 표시 줄(`.moscow`): `<span>` 4개 — "Must ① 요청 목록 · ② 나에게 배정" · "Should ④ 상태 필터" · "Could ③ 요청 등록 폼" · "Won't 로그인·권한 · DB 저장 · AI 분류"(취소선은 CSS `.moscow .wont`로)
  3. 등록 폼(`.form`): 입력칸 `title`(placeholder "요청 제목 (필수)") · `body`("본문 (선택)") · [등록] 버튼 · 안내 문장 `<span class="msg">`(있을 때만)
     - 입력칸은 `useState`로 관리하지 않음. 제출할 때 `FormData`로 읽고, 성공하면 `e.currentTarget.reset()`으로 비움.
     - 제출하면 페이지 새로고침을 막고, 제목이 공백뿐이면 "제목을 입력하세요"를 보이고 목록은 그대로.
     - 아니면 `addTicket`으로 목록에 붙이고 "등록됨: (다듬은 제목)"을 보이고 폼을 비움.
     - 빈 제목 검사는 화면(`handleSubmit`)과 `addTicket` **두 곳에 모두 있음** — 둘 다 유지.
     - 안내 문장은 다음 [등록] 때까지 그대로 남음(배정 · 탭 전환으로 지워지지 않음).
  4. 상태 탭(`.tabs`): `FILTERS`마다 버튼 하나, 고른 탭은 `tab on`. 누르면 `filter`가 바뀜.
     - 등록 · 배정 뒤에도 고른 탭은 그대로이고, 보이는 목록은 그 탭 기준으로 다시 계산됨(예: [open] 탭에서 배정하면 그 카드가 사라짐).
  5. 카드 판(`.board`): 보이는 목록의 요청마다 `TicketCard`.
- `TicketCard`(props: `ticket`, `onAssign(id)`):
  - `<div class="card" data-status={상태} data-id={id}>` 안에 차례로: 제목 `<h3>` · `<p>`"분류 · P우선순위" · `<p>`상태 배지(`.badge`, 영문 상태값 그대로)와 담당자가 있으면 " · 담당: 이름" · 버튼.
  - 본문(`body`)은 저장만 하고 카드에는 보이지 않음.
  - 버튼 글자: open "나에게 배정" · assigned "배정 완료" · resolved "처리 완료". open이 아니면 비활성.
  - 누르면 `onAssign(id)` → 페이지가 `assignTicket`으로 목록을 바꿈.

### 스타일 (`app/globals.css`) — 이미 있는 클래스

- `.app` · `.moscow`(must · should · could · wont 색) · `.form` · `.msg` · `.tabs` · `.tab`(`.on`이면 진한 배경) · `.board`(줄바꿈되는 가로 배치) · `.card`(세로로 쌓는 카드, 상태별 배경 · 테두리: open 주황 · assigned 초록 · resolved 회색) · `.badge` · 카드 버튼이 비활성이면 테두리 · 글자만 회색.
- 화면 폭 480px 이하에서는 카드가 한 줄을 다 씀.
- 색 · 폭(카드 170px) · 여백 같은 세부 값은 지금 `globals.css` 그대로 유지(MoSCoW는 배경색 칩, 카드 기본 모양이 open 주황이고 assigned · resolved만 덮어씀).

## 구현 순서 (1일차에 한 순서)

| 순서 | 한 일 | 산출물 |
|---|---|---|
| 1 | 데이터 모양과 더미 8건 | `lib/types.ts` · `lib/data.ts` |
| 2 | 카드 컴포넌트 | `components/TicketCard.tsx` |
| 3 | 목록 + 우선순위 정렬(AC-01) | `app/page.tsx` · `sortByPriority` |
| 4 | 나에게 배정(AC-02) · 상태 필터(AC-03) | `assignTicket` · `filterTickets` · 상태 탭 |
| 5 | 요청 등록 폼(AC-04 · Could) | `addTicket` · 등록 폼 · 안내 문장 |
| 6 | 스타일 | `app/globals.css` |

## 검증 방법 — 지금(ex00) 상태에서 이렇게 보이면 정상

| 확인 | 방법 | 기대 결과 |
|---|---|---|
| AC-01 목록 | `npm run dev` → http://localhost:3000 | 카드 8장, P1 → P4 순(VPN 접속 오류가 맨 앞), 카드마다 제목 · 분류 · 우선순위 |
| AC-02 배정 | "VPN 접속 오류"의 [나에게 배정] | 그 카드만 assigned · "담당: 나" · 버튼이 "배정 완료"로 비활성 |
| AC-03 필터 | [open] 탭 → [전체] 탭 | open만 보임 → 다시 전부 |
| AC-04 빈 제목 | 제목 비운 채 [등록] | "제목을 입력하세요" · 카드 수 그대로 |
| 등록 | 제목 "모니터 교체" → [등록] | "등록됨: 모니터 교체" · 카드 추가(미분류 · P3 · open, 기존 P3 카드들 뒤) · 폼 비워짐 |
| 알려진 한계 | 등록 · 배정 후 F5 | 처음 8건으로 돌아감(데이터를 저장하지 않음 — SPEC의 Won't "DB 저장") |
| 빌드 | `npm run build` | 오류 없음 |
