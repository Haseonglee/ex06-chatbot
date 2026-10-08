# PLAN_backend_ex05 — Supabase + Drizzle

> 이유: 지금은 데이터가 Hono 메모리 배열에만 있어 `npm run api`를 다시 켜면 등록 · 배정한 내용이 사라짐. 그래서 데이터를 Supabase(PostgreSQL)의 `tickets` 테이블에 두고, Hono가 Drizzle로 읽고 씀.
> 코드 폴더: `ex05/` (`ex04/` 복사)

## 이번 범위
- Hono의 메모리 배열(`let tickets`)을 없애고, 목록 · 등록 · 배정을 `tickets` 테이블 조회 · 넣기 · 고치기로 바꿈. API 계약(주소 · 상태 코드 · 메시지)은 그대로
- 접속 정보: `ex05/.env`의 `DATABASE_URL` 한 줄에서 읽음(값은 Supabase 대시보드에서 받음. 코드 · PLAN에 적지 않음)
- 새 패키지: `drizzle-orm` · `postgres` · `dotenv` · `drizzle-kit`(상위 폴더에 이미 설치됨)
- 하지 않음: 로그인 · 사용자 테이블(401 · 403, ex06) · Google 로그인(ex07) · 마이그레이션 파일(`drizzle-kit generate` · `migrate`) · Supabase JS 클라이언트 · RLS · 화면

## 테이블 표 (`tickets`, `db/schema.ts`)

| 칸 | 타입 | 규칙 |
|---|---|---|
| `id` | 정수 | 기본 키 · 자동 증가(1부터) |
| `title` | 글자 | 필수 |
| `body` | 글자 | 필수 · 기본값 `""` |
| `category` | 글자 | 필수 |
| `priority` | 정수 | 필수(1~4) |
| `status` | 글자 | 필수 · `open` · `assigned` · `resolved` 중 하나 |
| `assignee` | 글자 | 필수 · 기본값 `""` |

| 파일 | 하는 일 |
|---|---|
| `.env` | `DATABASE_URL=` 한 줄(`ex05/` 바로 아래) |
| `db/schema.ts` | 위 테이블 정의 |
| `db/index.ts` | `.env`를 읽고(`dotenv/config`) `postgres` + Drizzle로 접속한 `db`를 내보냄 |
| `drizzle.config.ts` | `drizzle-kit`이 쓸 설정(스키마 `db/schema.ts` · `DATABASE_URL`) |
| `db/seed.ts` | `seed()`: 테이블을 비우고 id를 1부터 다시 세게 한 뒤 `lib/data.ts`의 8건을 그 순서대로 넣음(id는 넣지 않음 → 1~8) |

- 목록 = `priority` 오름차순, 같으면 `id` 오름차순
- 등록 = `title`(다듬은 값) · `body`(없으면 `""`) · `category` "미분류" · `priority` 3 · `status` "open" · `assignee` ""로 넣고, 넣은 줄을 돌려줌(id는 DB가 정함)
- 배정 = id로 찾음 → 없으면 404 · open이 아니면 409 · 아니면 `status` "assigned" · `assignee` "나"로 고친 줄을 돌려줌

## API 계약 표

| 메서드 | 경로 | 하는 일 | 보내는 칸 | 성공 | 실패 · 메시지 |
|---|---|---|---|---|---|
| GET | `/api/tickets` | 목록(P1 → P4 순) | 없음 | 200 · `Ticket` 배열 | — |
| POST | `/api/tickets` | 요청 등록 | `title`(필수) · `body`(선택) | 201 · 만든 `Ticket` | 422 · 입력 규칙 표의 메시지 |
| POST | `/api/tickets/{id}/assign` | 나에게 배정 | 없음 | 200 · 바뀐 `Ticket` | 422 · "요청 번호가 올바르지 않습니다" · 404 · "요청을 찾을 수 없습니다" · 409 · "open 상태만 배정할 수 있습니다" |
| GET | `/doc` | 계약 문서(OpenAPI 3.1 JSON, 제목 "부서 헬프데스크 API") | 없음 | 200 | — |
| GET | `/ui` | Swagger UI(`/doc`을 읽음) | 없음 | 200 · HTML | — |

- `Ticket` 칸은 `lib/types.ts` 그대로(`id` · `title` · `body` · `category` · `priority` 1~4 · `status` open/assigned/resolved · `assignee`)
- 실패 응답은 모두 같은 모양: `{ "code": "오류 코드", "message": "화면에 보일 글자" }`
- `/doc` · `/ui`는 Hono(8787)에만 있음. 중계 파일은 만들지 않음

## 테스트 표 (`server/app.test.ts`)

| 요청 | 기대 |
|---|---|
| GET `/api/tickets` | 200 · 8건 · 첫 건 "VPN 접속 오류" · priority가 1 → 4 순 |
| POST `/api/tickets` `{"title":"모니터 교체"}` | 201 · `category` "미분류" · `priority` 3 · `status` "open" |
| POST `/api/tickets` `{"title":"  "}` · `{"title":123}` | 422 · `VALIDATION_ERROR` · "제목을 입력하세요" |
| POST `/api/tickets` 제목 100자 · 101자 | 201 · 422 "제목은 100자 이하로 입력하세요" |
| POST `/api/tickets` 본문 1001자 | 422 · "본문은 1000자 이하로 입력하세요" |
| POST `/api/tickets/1/assign` | 200 · `status` "assigned" · `assignee` "나" |
| POST `/api/tickets/3/assign` · `/999/assign` · `/abc/assign` · `/0/assign` | 409 · 404 · 422 · 422(각 메시지는 계약 표 그대로) |
| 실패 본문 | 키가 `code` · `message` 두 개뿐 |
| GET `/doc` | 200 · `paths`에 `/api/tickets` · `/api/tickets/{id}/assign` · 상태 코드 200/201/404/409/422 |

- 테스트 시작 전(`beforeAll`) `seed()`로 테이블을 처음 8건으로 되돌리고, 그 뒤는 위 표 순서대로 데이터를 이어서 씀
- 테스트는 `.env`의 같은 DB를 씀. `npm test` 뒤에는 화면 데이터도 처음 8건 + 테스트가 넣은 건이 됨
- 입력 규칙 · 등록 · 배정 규칙은 ex03 그대로(테스트만 더함)

## 중계(BFF) 표

| 화면이 부르는 곳(Next.js) | 중계 파일 | 넘기는 곳(Hono) |
|---|---|---|
| GET · POST `/api/tickets` | `app/api/tickets/route.ts` | `http://localhost:8787/api/tickets` |
| POST `/api/tickets/{id}/assign` | `app/api/tickets/[id]/assign/route.ts` | `http://localhost:8787/api/tickets/{id}/assign` |

- 중계는 성공 · 실패 모두 Hono의 상태 코드와 JSON 본문을 바꾸지 않고 돌려줌
- Hono는 Supabase의 `tickets` 테이블을 읽고 씀. 처음 데이터는 `npm run db:seed`가 넣는 `lib/data.ts`의 8건. Hono를 다시 켜도 데이터는 그대로

## 화면 변경
- 없음

## 구현 순서
1. `ex04/` → `ex05/` 복사(`node_modules` · `.next` 제외)
2. `db/schema.ts` · `db/index.ts` · `drizzle.config.ts`: 테이블 표 · 파일 표 그대로. `.env`는 `DATABASE_URL=` 키만 두고 값은 사용자가 채움
3. `db/seed.ts`: `seed()`를 내보내고, 직접 실행하면 `seed()` 후 접속을 닫음. `package.json`에 `"db:push": "drizzle-kit push"` · `"db:seed": "tsx db/seed.ts"` 추가
4. `server/app.ts`: `let tickets`와 `lib/data.ts` · `lib/tickets.ts` 불러오기를 지우고, 세 핸들러를 테이블 표 아래 규칙대로 `db`로 바꿈. 스키마 · 경로 정의 · `/doc` · `/ui`는 그대로
5. `server/app.test.ts`: `beforeAll`에서 `seed()`. 테스트 표는 그대로
마지막. `npm run db:push` · `npm run db:seed` · `npm test` · `npm run build`

## 검증 방법
- 실제 DB(Supabase 접속)가 있어야 하는 줄: 테이블 · 처음 데이터 · 화면 · Hono 직접 · 중계 · 404 · 409 · 부르는 곳 · 저장 위치 · 100자 · 101자의 화면 부분 · 테스트 · 테스트가 잡는가

| 확인 | 방법 | 기대 결과 |
|---|---|---|
| 형식 | `npm run api` → http://localhost:8787/doc 내용을 https://editor.swagger.io 에 붙여 넣기 | 오류 표시 없음 · 오른쪽에 엔드포인트 3개 |
| 계약 표 | http://localhost:8787/ui | 3개 엔드포인트 · 200/201/404/409/422 모두 있음 |
| 메시지 | `/doc`에서 배정의 404 · 409 · 422 설명 찾기 | 계약 표의 글자와 같음 |
| 화면 | 터미널 2개: `npm run api` · `npm run dev` → http://localhost:3000 | ex00과 같음(카드 8장 · 배정 · 필터 · 등록) |
| Hono 직접 | `curl.exe -i http://localhost:8787/api/tickets` | 200 · 8건 · VPN 접속 오류가 맨 앞 |
| 중계 | `curl.exe -i http://localhost:3000/api/tickets` | Hono 직접과 같은 답 |
| 422 | `curl.exe -i -X POST http://localhost:3000/api/tickets -H "Content-Type: application/json" -d '{"title":"  "}'`(PowerShell 7) | 422 · "제목을 입력하세요" |
| 404 | `curl.exe -i -X POST http://localhost:3000/api/tickets/999/assign` | 404 · "요청을 찾을 수 없습니다" |
| 409 | `curl.exe -i -X POST http://localhost:3000/api/tickets/3/assign` | 409 · "open 상태만 배정할 수 있습니다" |
| 부르는 곳 | 개발자 도구 Network 탭을 연 채 [등록] · [나에게 배정] | 요청 주소가 모두 `localhost:3000/api/...`(8787 없음) |
| 저장 위치 | 등록 · 배정 후 F5 → `npm run api`를 껐다 켠 뒤 F5 → `npm run db:seed` 후 F5 | 바뀐 내용 그대로 → 바뀐 내용 그대로 → 처음 8건 |
| 숫자 제목 | 422 줄의 `-d`를 `'{"title":123}'`로 | 422 · "제목을 입력하세요" |
| 100자 | 422 줄의 `-d`를 `('{"title":"' + 'a'*100 + '"}')`로 | 201 |
| 101자 | 422 줄의 `-d`를 `('{"title":"' + 'a'*101 + '"}')`로 | 422 · "제목은 100자 이하로 입력하세요" · 화면에서 같은 입력 → 같은 안내 · 카드 수 그대로 |
| 긴 본문 | 422 줄의 `-d`를 `('{"title":"t","body":"' + 'a'*1001 + '"}')`로 | 422 · "본문은 1000자 이하로 입력하세요" |
| 잘못된 id | `curl.exe -i -X POST http://localhost:3000/api/tickets/abc/assign` · `.../0/assign` | 둘 다 422 · "요청 번호가 올바르지 않습니다" |
| 실패 모양 | 위 422 응답 본문 | `code`(`VALIDATION_ERROR`) · `message` 두 칸만(Zod 오류 목록 없음) |
| 검사 위치 | `server/app.ts`에서 `String(` 찾기 | 없음(검사는 Zod 스키마에서만) |
| 테스트 | `npm test`(서버를 켜지 않은 채) | 모든 테스트 통과 |
| 테스트가 잡는가 | `server/app.ts`의 `"나"`를 `"너"`로 바꾸고 `npm test` → 되돌리고 `npm test` | 배정 테스트 실패 → 다시 모두 통과 |
| 문서 하나 | `ex05/`에서 `openapi.yaml` 찾기 | 없음(계약 문서는 `/doc`만) |
| 테이블 | `npm run db:push` → Supabase 대시보드 Table Editor | `tickets` 테이블 · 칸 7개가 테이블 표와 같음 |
| 처음 데이터 | `npm run db:seed` → Table Editor의 `tickets` | 8줄 · id 1~8 · `lib/data.ts`와 같은 값 |
| 메모리 없음 | `server/app.ts`에서 `let tickets` · `TICKETS` 찾기 | 없음 |
| 접속 정보 위치 | `ex05/`의 코드 파일(`.ts`)에서 `postgres://` · `postgresql://` 찾기 | 없음(`.env`에만 있음) |
| 빌드 | `npm run build` | 오류 없음 |
