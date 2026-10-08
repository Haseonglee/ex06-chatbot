# PLAN — 부서 헬프데스크 계획 (서브 플랜 목록)

> `SPEC.md`(무엇을 · 왜)를 **어떻게 만드는가**는 `plan/` 폴더의 서브 플랜에 나눠 적음. 이 문서는 어느 서브 플랜을 기준으로 삼는지만 정함.

## 서브 플랜

| 파일 | 내용 |
|---|---|
| `plan/PLAN_frontend_99.md` | 화면(프론트엔드) 계획. 1일차 결과(`ex00/`)를 자세히 적은 것 |
| `plan/PLAN_backend_exXX.md` | 서버(백엔드) 계획. `ex01`부터 단계마다 하나씩 늘어남(누적형) |

## 참조 규칙

- 작업할 때 참조하는 서브 플랜은 **두 개뿐**:
  1. `plan/PLAN_frontend_99.md`
  2. `plan/PLAN_backend_exXX.md` 중 **번호가 가장 높은 것 1개**
- 번호가 더 낮은 `PLAN_backend_exXX.md`는 읽지 않음(가장 높은 번호가 앞 단계 내용을 모두 담고 있음).
- 두 서브 플랜이 서로 다르게 적힌 곳은 `PLAN_backend_exXX.md`를 따름.
- 코드는 `PLAN_backend_exXX.md`와 같은 번호의 `exXX/` 폴더에 만듦.
