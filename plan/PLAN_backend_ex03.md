# PLAN_backend_ex03 — Zod 입력 검사

> 이유: 지금은 Hono가 받은 칸을 `String(...)`으로 바꾸고 `if`로 빈 제목만 막아서, 숫자 제목 · 아주 긴 제목 · `abc` 같은 id가 그냥 통과함. 그래서 입력 규칙을 Zod 스키마로 한곳에 적고, `@hono/zod-openapi`가 요청마다 그 규칙으로 먼저 검사하게 함.
> 코드 폴더: `ex03/` (`ex02/` 복사)

## 이번 범위
- `server/index.ts`의 엔드포인트 3개를 `@hono/zod-openapi` 경로 정의로 바꾸고, 아래 입력 규칙 표를 Zod 스키마로 적음. 규칙에 어긋난 요청은 핸들러에 들어가기 전에 422로 답함
- 새 패키지: `zod` · `@hono/zod-openapi`(상위 폴더에 이미 설치됨)
- 하지 않음: 테스트 · `openapi.yaml` 정리 · 문서 주소(`/doc`) · Swagger UI(ex04) · DB(ex05) · 로그인(401 · 403, ex06) · 화면(Next.js) · 중계 파일의 Zod 검사

## API 계약 표

| 메서드 | 경로 | 하는 일 | 보내는 칸 | 성공 | 실패 · 메시지 |
|---|---|---|---|---|---|
| GET | `/api/tickets` | 목록(P1 → P4 순) | 없음 | 200 · `Ticket` 배열 | — |
| POST | `/api/tickets` | 요청 등록 | `title`(필수) · `body`(선택) | 201 · 만든 `Ticket` | 422 · 입력 규칙 표의 메시지 |
| POST | `/api/tickets/{id}/assign` | 나에게 배정 | 없음 | 200 · 바뀐 `Ticket` | 422 · "요청 번호가 올바르지 않습니다" · 404 · "요청을 찾을 수 없습니다" · 409 · "open 상태만 배정할 수 있습니다" |

- `Ticket` 칸은 `lib/types.ts` 그대로(`id` · `title` · `body` · `category` · `priority` 1~4 · `status` open/assigned/resolved · `assignee`)
- 실패 응답은 모두 같은 모양: `{ "code": "오류 코드", "message": "화면에 보일 글자" }`

## 입력 규칙 표

| 위치 | 칸 | 규칙 | 어기면 422 · `message` |
|---|---|---|---|
| 등록 본문 | `title` | 글자 · 필수 · 앞뒤 공백을 지운 뒤 1자 이상 | "제목을 입력하세요"(없음 · 공백뿐 · 글자가 아님) |
| 등록 본문 | `title` | 앞뒤 공백을 지운 뒤 100자 이하 | "제목은 100자 이하로 입력하세요" |
| 등록 본문 | `body` | 글자 · 선택 · 1000자 이하 | "본문은 1000자 이하로 입력하세요"(글자가 아니어도 같은 메시지) |
| 배정 경로 | `id` | 1 이상 정수 | "요청 번호가 올바르지 않습니다" |

- 422의 `code`는 모두 `VALIDATION_ERROR`. 여러 칸이 틀려도 `message`는 하나(표 위쪽 줄 먼저). `@hono/zod-openapi` 기본 실패 답(400 · Zod 오류 목록)은 쓰지 않음
- 표에 없는 칸은 저장하지 않음. 통과한 값으로 등록 · 배정하는 규칙은 `lib/tickets.ts` 그대로
- 응답 `Ticket` · 실패 모양도 Zod 스키마로 적음(칸은 위 계약 표 그대로)

## 중계(BFF) 표

| 화면이 부르는 곳(Next.js) | 중계 파일 | 넘기는 곳(Hono) |
|---|---|---|
| GET · POST `/api/tickets` | `app/api/tickets/route.ts` | `http://localhost:8787/api/tickets` |
| POST `/api/tickets/{id}/assign` | `app/api/tickets/[id]/assign/route.ts` | `http://localhost:8787/api/tickets/{id}/assign` |

- 중계는 성공 · 실패 모두 Hono의 상태 코드와 JSON 본문을 바꾸지 않고 돌려줌
- Hono의 처음 데이터 = `lib/data.ts`의 8건. 등록 · 배정 결과 값은 `lib/tickets.ts`의 지금 규칙 그대로. Hono를 다시 켜면 처음 8건으로 돌아감

## 화면 변경
- 없음. 새 메시지(100자 · 1000자)도 ex02처럼 응답의 `message`가 안내 문장(`.msg`)에 그대로 보임
- 화면의 빈 제목 검사 · 탭 · 카드 모양은 그대로

## 구현 순서
1. `ex02/` → `ex03/` 복사(`node_modules` · `.next` 제외)
2. `server/index.ts`: `Hono` 대신 `OpenAPIHono`. 입력 규칙 표 · `Ticket` · 실패 모양을 Zod 스키마로 적고, 엔드포인트 3개를 경로 정의로 바꿈. 핸들러는 검사를 통과한 값만 씀(`String(...)` · 빈 제목 `if` 삭제)
3. 검사 실패 답: 422 · `VALIDATION_ERROR` · 입력 규칙 표의 메시지 하나
4. `openapi.yaml`: 배정에 422 응답 추가
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
| 숫자 제목 | 422 줄의 `-d`를 `'{"title":123}'`로 | 422 · "제목을 입력하세요" |
| 100자 | 422 줄의 `-d`를 `('{"title":"' + 'a'*100 + '"}')`로 | 201 |
| 101자 | 422 줄의 `-d`를 `('{"title":"' + 'a'*101 + '"}')`로 | 422 · "제목은 100자 이하로 입력하세요" · 화면에서 같은 입력 → 같은 안내 · 카드 수 그대로 |
| 긴 본문 | 422 줄의 `-d`를 `('{"title":"t","body":"' + 'a'*1001 + '"}')`로 | 422 · "본문은 1000자 이하로 입력하세요" |
| 잘못된 id | `curl.exe -i -X POST http://localhost:3000/api/tickets/abc/assign` · `.../0/assign` | 둘 다 422 · "요청 번호가 올바르지 않습니다" |
| 실패 모양 | 위 422 응답 본문 | `code`(`VALIDATION_ERROR`) · `message` 두 칸만(Zod 오류 목록 없음) |
| 검사 위치 | `server/index.ts`에서 `String(` 찾기 | 없음(검사는 Zod 스키마에서만) |
| 빌드 | `npm run build` | 오류 없음 |
