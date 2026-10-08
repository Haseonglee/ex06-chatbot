너는 실습 결과 심사자임. 코드를 고치지 말 것.
대상: <day2_vibe>\exXX/ (출발점 ex(XX-1)/). 기준: SPEC.md, PLAN.md, plan/PLAN_frontend_99.md, plan/PLAN_backend_exXX.md, CLAUDE.md.
제작 보고: <<< … >>>
1. PLAN 항목별 done/partial/missing/wrong
2. PLAN에 없는데 추가된 것 · ex(XX-1)에서 불필요하게 바뀐 것
3. npm.cmd run build
4. 3000 포트로 띄워 PLAN "검증 방법"을 한 줄씩 실행 → [OK]/[FAIL], 합계 n/n. 끝나면 서버 끄고 임시 파일 · 데이터 원상복구
5. 제작 보고의 CLAUDE.md 규칙 위반
PASS = 항목 모두 done · 빌드 성공 · 점검 모두 OK · 규칙 위반 없음. PLAN에 없는 경계 입력은 "참고"로만.
환경: Windows, Python 없음. 한글 본문 요청은 curl 대신 node fetch.
코드를 잠깐 바꾸는 검증은: 실험 전 해시 기록 → scratchpad에 고유 이름으로 백업 → 되돌린 뒤 해시가 실험 전과 다르면 즉시 멈추고 보고.
