# PLAN_backend_ex01 — OpenAPI 계약

> 이유: 지금은 화면이 `lib/data.ts` 배열을 직접 고쳐서, 서버를 만들면 화면과 서버가 무엇을 주고받을지 정해진 게 없음. 그래서 서버를 만들기 전에 계약을 기계가 읽는 문서(`openapi.yaml`)로 먼저 씀.
> 코드 폴더: `ex01/` (`ex00/` 복사)

## 이번 범위
- `ex01/openapi.yaml` 한 파일을 새로 씀(OpenAPI 3.1). 엔드포인트 3개: 목록 · 등록 · 나에게 배정
- 새 패키지: 없음
- 하지 않음: 서버 구현 · 화면이 서버 부르기(ex02) · 입력 규칙 세부(본문 길이 등, ex03) · 테스트(ex04) · DB(ex05) · 로그인(401 · 403, ex06)

## API 계약 표

| 메서드 | 경로 | 하는 일 | 보내는 칸 | 성공 | 실패 · 메시지 |
|---|---|---|---|---|---|
| GET | `/api/tickets` | 목록(P1 → P4 순) | 없음 | 200 · `Ticket` 배열 | — |
| POST | `/api/tickets` | 요청 등록 | `title`(필수) · `body`(선택) | 201 · 만든 `Ticket` | 422 · "제목을 입력하세요" |
| POST | `/api/tickets/{id}/assign` | 나에게 배정 | 없음 | 200 · 바뀐 `Ticket` | 404 · "요청을 찾을 수 없습니다" · 409 · "open 상태만 배정할 수 있습니다" |

- `Ticket` 칸은 `lib/types.ts` 그대로(`id` · `title` · `body` · `category` · `priority` 1~4 · `status` open/assigned/resolved · `assignee`)
- 실패 응답은 모두 같은 모양: `{ "code": "오류 코드", "message": "화면에 보일 글자" }`

## 화면 변경
- 없음

## 구현 순서
1. `ex00/` → `ex01/` 복사(`node_modules` · `.next` 제외)
2. `ex01/openapi.yaml`에 위 표의 엔드포인트 3개와 `Ticket` · 오류 모양을 적음
3. 표와 파일을 나란히 놓고 경로 · 메서드 · 상태 코드 · 메시지를 사람이 검토
마지막. `npm run build`

## 검증 방법
| 확인 | 방법 | 기대 결과 |
|---|---|---|
| 형식 | `openapi.yaml` 내용을 https://editor.swagger.io 에 붙여 넣기 | 오류 표시 없음 · 오른쪽에 엔드포인트 3개 |
| 계약 표 | 표의 줄마다 파일에서 경로 · 메서드 · 상태 코드 찾기 | 3개 엔드포인트 · 200/201/404/409/422 모두 있음 |
| 메시지 | 파일에서 실패 메시지 찾기 | 표의 글자와 같음 |
| 화면 그대로 | `npm run dev` → http://localhost:3000 | ex00과 같음(카드 8장 · 배정 · 필터 · 등록) |
| 빌드 | `npm run build` | 오류 없음 |
