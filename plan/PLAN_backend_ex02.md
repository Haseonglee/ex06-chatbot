# PLAN_backend_ex02 — Hono 구현, Next.js가 중계(BFF)

> 이유: 지금은 `openapi.yaml` 계약만 있고 그대로 답하는 서버가 없어서, 화면이 여전히 `lib/data.ts` 배열을 직접 고침. 그래서 계약대로 답하는 Hono 서버를 만들고, 화면은 Next.js `/api`를 거쳐(BFF) 그 서버를 부름.
> 코드 폴더: `ex02/` (`ex01/` 복사)

## 이번 범위
- Hono 서버(`ex02/server/index.ts`, 포트 8787)가 아래 API 계약 표 3개를 메모리 배열로 구현. Next.js `app/api/`는 받은 요청을 Hono에 넘기고 답을 그대로 돌려줌. 화면은 `/api/tickets`만 부름
- 새 패키지: `hono` · `@hono/node-server` · `tsx`(상위 폴더에 이미 설치됨)
- 하지 않음: Zod 입력 검사 · `@hono/zod-openapi`(ex03) · 테스트 · `openapi.yaml` 정리 · Swagger UI(ex04) · DB(ex05) · 로그인(401 · 403, ex06) · CORS(화면은 Hono를 직접 부르지 않음)

## API 계약 표

| 메서드 | 경로 | 하는 일 | 보내는 칸 | 성공 | 실패 · 메시지 |
|---|---|---|---|---|---|
| GET | `/api/tickets` | 목록(P1 → P4 순) | 없음 | 200 · `Ticket` 배열 | — |
| POST | `/api/tickets` | 요청 등록 | `title`(필수) · `body`(선택) | 201 · 만든 `Ticket` | 422 · "제목을 입력하세요" |
| POST | `/api/tickets/{id}/assign` | 나에게 배정 | 없음 | 200 · 바뀐 `Ticket` | 404 · "요청을 찾을 수 없습니다" · 409 · "open 상태만 배정할 수 있습니다" |

- `Ticket` 칸은 `lib/types.ts` 그대로(`id` · `title` · `body` · `category` · `priority` 1~4 · `status` open/assigned/resolved · `assignee`)
- 실패 응답은 모두 같은 모양: `{ "code": "오류 코드", "message": "화면에 보일 글자" }`

## 중계(BFF) 표

| 화면이 부르는 곳(Next.js) | 중계 파일 | 넘기는 곳(Hono) |
|---|---|---|
| GET · POST `/api/tickets` | `app/api/tickets/route.ts` | `http://localhost:8787/api/tickets` |
| POST `/api/tickets/{id}/assign` | `app/api/tickets/[id]/assign/route.ts` | `http://localhost:8787/api/tickets/{id}/assign` |

- 중계는 성공 · 실패 모두 Hono의 상태 코드와 JSON 본문을 바꾸지 않고 돌려줌
- Hono의 처음 데이터 = `lib/data.ts`의 8건. 등록 · 배정 결과 값은 `lib/tickets.ts`의 지금 규칙 그대로. Hono를 다시 켜면 처음 8건으로 돌아감

## 화면 변경
- 처음 열 때 `GET /api/tickets`로 목록을 받음(`TICKETS`를 직접 쓰지 않음)
- [등록] · [나에게 배정]은 API를 부르고, 성공하면 목록을 다시 받음. 실패하면 응답의 `message`를 안내 문장(`.msg`)에 보임
- 화면의 빈 제목 검사 · 탭 · 카드 모양은 그대로

## 구현 순서
1. `ex01/` → `ex02/` 복사(`node_modules` · `.next` 제외)
2. `server/index.ts`: Hono 앱 · 엔드포인트 3개 · 포트 8787로 켜기. `package.json`에 `"api": "tsx server/index.ts"`
3. `app/api/` 중계 파일 2개
4. `app/page.tsx`가 `/api/tickets`를 부르게 바꿈
마지막. `npm run build`

## 검증 방법
| 확인 | 방법 | 기대 결과 |
|---|---|---|
| 형식 | `openapi.yaml` 내용을 https://editor.swagger.io 에 붙여 넣기 | 오류 표시 없음 · 오른쪽에 엔드포인트 3개 |
| 계약 표 | 표의 줄마다 파일에서 경로 · 메서드 · 상태 코드 찾기 | 3개 엔드포인트 · 200/201/404/409/422 모두 있음 |
| 메시지 | 파일에서 실패 메시지 찾기 | 표의 글자와 같음 |
| 화면 | 터미널 2개: `npm run api` · `npm run dev` → http://localhost:3000 | ex00과 같음(카드 8장 · 배정 · 필터 · 등록) |
| Hono 직접 | `curl.exe -i http://localhost:8787/api/tickets` | 200 · 8건 · VPN 접속 오류가 맨 앞 |
| 중계 | `curl.exe -i http://localhost:3000/api/tickets` | Hono 직접과 같은 답 |
| 422 | `curl.exe -i -X POST http://localhost:3000/api/tickets -H "Content-Type: application/json" -d '{"title":"  "}'`(PowerShell 7) | 422 · "제목을 입력하세요" |
| 404 | `curl.exe -i -X POST http://localhost:3000/api/tickets/999/assign` | 404 · "요청을 찾을 수 없습니다" |
| 409 | `curl.exe -i -X POST http://localhost:3000/api/tickets/3/assign` | 409 · "open 상태만 배정할 수 있습니다" |
| 부르는 곳 | 개발자 도구 Network 탭을 연 채 [등록] · [나에게 배정] | 요청 주소가 모두 `localhost:3000/api/...`(8787 없음) |
| 저장 위치 | 등록 · 배정 후 F5 → `npm run api`를 껐다 켠 뒤 F5 | 바뀐 내용 그대로 → 처음 8건 |
| 빌드 | `npm run build` | 오류 없음 |
