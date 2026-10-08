# PLAN_backend_ex04 — Vitest 테스트, openapi.yaml 정리

> 이유: 지금은 고칠 때마다 curl 10여 줄을 손으로 다시 쳐야 하고, Zod 경로 정의와 손으로 쓴 `openapi.yaml`이 따로 있어 한쪽만 고치면 계약이 어긋남. 그래서 검증 줄을 Vitest 테스트로 옮겨 `npm test` 한 번으로 확인하고, 계약 문서는 경로 정의에서 만들어 `/doc`으로 내보냄.
> 코드 폴더: `ex04/` (`ex03/` 복사)

## 이번 범위
- `server/index.ts`를 앱(`server/app.ts`)과 서버 켜기(`server/index.ts`)로 나누고, 아래 테스트 표를 `server/app.test.ts`로 씀. 테스트는 서버를 켜지 않고 앱에 바로 요청함(`app.request`)
- 계약 문서: 경로 정의에서 만든 문서를 `GET /doc`(JSON)으로, Swagger UI를 `GET /ui`로 보임. 손으로 쓴 `openapi.yaml`은 지움
- 새 패키지: `vitest` · `@hono/swagger-ui`(상위 폴더에 이미 설치됨)
- 하지 않음: DB(ex05) · 로그인(401 · 403, ex06) · 화면(Next.js) · 중계 파일 테스트 · 화면 테스트 · 테스트 커버리지

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

- 한 파일 안의 테스트는 데이터(메모리)를 이어서 씀. 위 표 순서대로 두면 기대가 맞음
- 입력 규칙 · 등록 · 배정 규칙은 ex03 그대로(테스트만 더함)

## 중계(BFF) 표

| 화면이 부르는 곳(Next.js) | 중계 파일 | 넘기는 곳(Hono) |
|---|---|---|
| GET · POST `/api/tickets` | `app/api/tickets/route.ts` | `http://localhost:8787/api/tickets` |
| POST `/api/tickets/{id}/assign` | `app/api/tickets/[id]/assign/route.ts` | `http://localhost:8787/api/tickets/{id}/assign` |

- 중계는 성공 · 실패 모두 Hono의 상태 코드와 JSON 본문을 바꾸지 않고 돌려줌
- Hono의 처음 데이터 = `lib/data.ts`의 8건. 등록 · 배정 결과 값은 `lib/tickets.ts`의 지금 규칙 그대로. Hono를 다시 켜면 처음 8건으로 돌아감

## 화면 변경
- 없음

## 구현 순서
1. `ex03/` → `ex04/` 복사(`node_modules` · `.next` 제외)
2. `server/app.ts`: `server/index.ts`의 스키마 · 경로 정의 · 핸들러를 옮기고 `app`을 내보냄. `server/index.ts`는 `app`을 불러와 8787에서 켜기만 함
3. `server/app.ts`: `/doc`(계약 표의 제목 · OpenAPI 3.1) · `/ui`(Swagger UI) 추가. `openapi.yaml` 삭제
4. `server/app.test.ts`: 테스트 표 그대로. `package.json`에 `"test": "vitest run"` 추가
마지막. `npm test` · `npm run build`

## 검증 방법
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
| 저장 위치 | 등록 · 배정 후 F5 → `npm run api`를 껐다 켠 뒤 F5 | 바뀐 내용 그대로 → 처음 8건 |
| 숫자 제목 | 422 줄의 `-d`를 `'{"title":123}'`로 | 422 · "제목을 입력하세요" |
| 100자 | 422 줄의 `-d`를 `('{"title":"' + 'a'*100 + '"}')`로 | 201 |
| 101자 | 422 줄의 `-d`를 `('{"title":"' + 'a'*101 + '"}')`로 | 422 · "제목은 100자 이하로 입력하세요" · 화면에서 같은 입력 → 같은 안내 · 카드 수 그대로 |
| 긴 본문 | 422 줄의 `-d`를 `('{"title":"t","body":"' + 'a'*1001 + '"}')`로 | 422 · "본문은 1000자 이하로 입력하세요" |
| 잘못된 id | `curl.exe -i -X POST http://localhost:3000/api/tickets/abc/assign` · `.../0/assign` | 둘 다 422 · "요청 번호가 올바르지 않습니다" |
| 실패 모양 | 위 422 응답 본문 | `code`(`VALIDATION_ERROR`) · `message` 두 칸만(Zod 오류 목록 없음) |
| 검사 위치 | `server/app.ts`에서 `String(` 찾기 | 없음(검사는 Zod 스키마에서만) |
| 테스트 | `npm test`(서버를 켜지 않은 채) | 모든 테스트 통과 |
| 테스트가 잡는가 | `lib/tickets.ts`의 `"나"`를 `"너"`로 바꾸고 `npm test` → 되돌리고 `npm test` | 배정 테스트 실패 → 다시 모두 통과 |
| 문서 하나 | `ex04/`에서 `openapi.yaml` 찾기 | 없음(계약 문서는 `/doc`만) |
| 빌드 | `npm run build` | 오류 없음 |
