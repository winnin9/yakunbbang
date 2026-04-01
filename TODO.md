# 야근빵 — 런칭 To Do

> 완료된 항목은 `- [x]`로 체크. 작업 시작 전 브랜치 따서 PR로 머지 권장.

---

## 🔴 런칭 필수

- [ ] **앱인토스 SDK 연동** — `src/hooks/useStorage.ts`의 localStorage를 Toss Storage API로 교체
- [ ] **앱인토스 공유 API 연동** — `src/pages/ReportPage.tsx`의 이미지 다운로드 방식을 Toss 공유 API로 교체
- [ ] **앱인토스 개발 환경 세팅** — 미니앱 SDK 설치, WebView 환경 로컬 테스트

---

## 🟡 오픈 전 권장

- [ ] **빵 이미지 7단계 리소스** — perfect~ash 각 단계별 일러스트 확보 및 적용 (`src/utils/breadCalculator.ts` BREAD_LABEL 참고)
- [ ] **공유 카드 디자인 시안** — 월간 리포트 이미지 카드 디자인 확정 (`src/pages/ReportPage.tsx` cardRef 영역)
- [ ] **제빵사 등급 카피라이팅 확정** — 5단계 코멘트 문구 (`src/utils/bakerGrade.ts` BAKER_GRADE_LABEL)
- [ ] **html2canvas 이모지 테스트** — iOS/Android 실기기에서 👨‍🍳 등 복합 이모지 공유 카드 렌더링 확인
- [ ] **모바일 실기기 최종 확인** — iPhone/Galaxy에서 레이아웃, 폰트, 터치 영역 체크

---

## 🟢 오픈 후 (MVP 후속)

- [ ] **빵 스킨 선택 기능** — 홈에서 스킨 선택 UI 추가. `src/types/index.ts`의 `BREAD_SKIN_IMAGE` 맵에 스킨 추가하면 됨
- [ ] **세션 삭제 기능** — 잘못 기록한 세션 삭제 (오븐 리스트에서 스와이프 삭제 등)
- [ ] **리워드 광고 (빵 스킨 변경)** — 광고 시청 시 해당 세션 스킨 변경
- [ ] **친구 비교 기능** — 공유 반응 확인 후 도입 검토
- [ ] **앱 내 푸시 알림** — 목표 시간 도달 시 알림

---

## ✅ 완료

- [x] 세션 유실 방지 (새로고침/앱 재시작 시 active 세션 복원)
- [x] 자정 넘기는 야근 자동 보정
- [x] 음수 초과율 긍정 피드백 ("일찍 완료")
- [x] localStorage 저장 실패 알림
- [x] 중복 세션 방지
- [x] OvenList 타임존 날짜 파싱 버그 수정
- [x] ReportPage 자정 이후 월 기준 고정 버그 수정
- [x] 아이콘 inline SVG로 통일 (뒤로가기, 월 이동, 오븐)
- [x] 오븐 리스트 썸네일 → 빵 이미지 + 상태 이모지 뱃지
- [x] 분 단위 10분 → 5분 세분화
