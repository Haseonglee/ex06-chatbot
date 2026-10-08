# 2일차 바이브코딩 실습 — 마이카마켓 챗봇

`ex06_chatbot/`이 챗봇이 들어 있는 최신 결과물입니다. 다른 PC에 **VS Code와 Node.js만** 설치돼 있으면 아래 순서대로 실행할 수 있습니다.

## 폴더 구성

| 폴더 · 파일 | 내용 |
|---|---|
| `ex06_chatbot/` | **실행 대상.** 화면(Next.js) + API(Hono) + 챗봇 |
| `ex06/` | 챗봇을 넣기 전 버전 |
| `ex00/` ~ `ex05/` | 단계별 결과물 (계획은 `plan/PLAN_backend_exXX.md`) |
| `SPEC.md` · `PLAN.md` · `plan/` | 무엇을 · 어떻게 만드는지 적은 문서 |
| `CLAUDE.md` | Claude Code 작업 규칙 |
| `agent_prompts/` · `plan_helper.md` | 에이전트 프롬프트와 계획 도우미 |
| `package.json` | 모든 `exXX/` 폴더가 함께 쓰는 공용 패키지 목록 |

## 준비물

- **VS Code**
- **Node.js** (LTS 버전 권장, `npm`이 같이 설치됩니다) — https://nodejs.org
- **Anthropic API 키** — 챗봇 답변에 필요합니다 (https://console.anthropic.com)
- Git은 없어도 됩니다.

Node.js를 설치한 뒤 VS Code를 **다시 켜세요.** 켜져 있던 VS Code는 새로 설치한 Node.js를 모릅니다.

## 1. 내려받기

- **Git이 없을 때:** 저장소 페이지 → 초록색 **Code** → **Download ZIP** → 압축을 풉니다.
- **Git이 있을 때:** `git clone https://github.com/Haseonglee/ex06-chatbot.git`

## 2. VS Code로 열기

VS Code → **파일 → 폴더 열기** → 내려받은 폴더(`package.json`이 바로 보이는 폴더)를 선택합니다.
터미널은 **터미널 → 새 터미널** (단축키 `` Ctrl+` ``) 로 엽니다.

## 3. 패키지 설치 (처음 한 번만)

```
npm install
cd ex06_chatbot
npm install
```

루트의 `npm install`이 Next.js · Hono 같은 공용 패키지를, `ex06_chatbot/`의 `npm install`이 Anthropic SDK를 설치합니다. 둘 다 해야 합니다.

## 4. API 키 넣기

`ex06_chatbot/` 폴더 안에 `.env` 파일을 새로 만들고 한 줄을 적습니다.

```
ANTHROPIC_API_KEY=발급받은_키
```

- `.env`는 `.gitignore`에 들어 있어서 git에 올라가지 않습니다. **키를 채팅 · 커밋 · 코드에 적지 마세요.** 이 저장소는 공개(public)입니다.
- `.env.example`에 있는 `DATABASE_URL` 등 나머지 변수는 로그인 · DB 기능용입니다. 챗봇 화면만 볼 때는 적지 않아도 됩니다.

## 5. 실행 (터미널 2개)

`ex06_chatbot/` 폴더에서 터미널을 두 개 엽니다 (터미널 패널의 **+** 또는 분할 버튼).

| 터미널 | 명령 | 열리는 곳 |
|---|---|---|
| 1 (API) | `npm run dev:api` | http://localhost:8787 |
| 2 (화면) | `npm run dev` | http://localhost:3000 |

브라우저에서 http://localhost:3000 을 열고 화면 오른쪽 아래의 챗봇 버튼을 누르면 됩니다.
API 서버를 켤 때 `BETTER_AUTH_URL` 경고가 나올 수 있는데, 챗봇 실행에는 영향이 없습니다.

끌 때는 각 터미널에서 `Ctrl+C`를 누릅니다.

## 문제가 생기면

| 증상 | 해결 |
|---|---|
| `npm`을 인식하지 못함 | Node.js를 설치한 뒤 VS Code를 완전히 껐다 켭니다. `node -v`로 확인합니다. |
| PowerShell에서 "스크립트를 실행할 수 없습니다" | 터미널 종류를 **Command Prompt**로 바꿉니다 (터미널 오른쪽 위 `v` 메뉴). |
| `EADDRINUSE` (포트 사용 중) | 3000 또는 8787번을 쓰는 서버가 이미 켜져 있습니다. 이전 터미널에서 `Ctrl+C`로 끄고 다시 실행합니다. |
| 챗봇이 답하지 않음 | `ex06_chatbot/.env`의 키가 맞는지 확인합니다. 고쳤다면 API 서버(`npm run dev:api`)를 껐다 다시 켭니다. |
