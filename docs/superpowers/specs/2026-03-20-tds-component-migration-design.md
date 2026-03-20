# TDS 컴포넌트 마이그레이션 설계

## 목표

야근빵 앱의 모든 버튼과 색상을 `@toss/tds-mobile` 컴포넌트로 교체한다.

## 아키텍처

React 18로 다운그레이드 후 TDS Mobile 패키지를 설치하고, `TDSMobileAITProvider`로 앱을 감싼다. 버튼 전체를 TDS `Button` / `TextButton`으로 교체하고, 하드코딩된 색상값을 `@toss/tds-colors` 토큰으로 대체한다. 레이아웃 구조와 `TimeInput`은 변경하지 않는다.

## 기술 스택

- `react@^18`, `react-dom@^18` (19 → 18 다운그레이드)
- `@toss/tds-mobile` — Button, TextButton 컴포넌트
- `@toss/tds-mobile-ait` — TDSMobileAITProvider
- `@toss/tds-colors` — 색상 토큰
- `@emotion/react@^11` — TDS 내부 스타일링 의존성

---

## 의존성 변경

```bash
npm install react@^18 react-dom@^18 @toss/tds-mobile @toss/tds-mobile-ait @toss/tds-colors @emotion/react@^11 --legacy-peer-deps
npm install --save-dev @types/react@^18 @types/react-dom@^18 --legacy-peer-deps
```

> `--legacy-peer-deps` 필요: lock 파일과 peer dependency 충돌 방지

### Vite + Emotion 설정

TDS는 Emotion CSS-in-JS를 사용하므로 `vite.config.ts`에서 `@vitejs/plugin-react`에 Emotion 지원을 추가한다.

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({ jsxImportSource: '@emotion/react' })],
})
```

---

## Provider 설정

`src/main.tsx`에서 `TDSMobileAITProvider`를 추가한다. `StrictMode`는 유지한다.

```tsx
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait'

<StrictMode>
  <TDSMobileAITProvider>
    <App />
  </TDSMobileAITProvider>
</StrictMode>
```

---

## 색상 토큰 매핑

코드베이스에 실제로 존재하는 하드코딩 색상값 기준으로 매핑한다.

| 현재 hex | TDS 토큰 | 용도 |
|----------|----------|------|
| `#ff6b35` | `colors.orange500` | 주 포인트 컬러, 버튼 배경, 텍스트 |
| `#333` | `colors.gray800` | "빵 완성" 버튼 배경 (활성 중 화면) |
| `#eee` | `colors.gray100` | 보조 버튼 배경, OvenList 구분선 (`borderBottom`) |
| `#f5f5f5` | `colors.gray50` | 카드 배경 (ResultPage, BakerGrade) |
| `#fff` | `colors.white` | ShareCard 텍스트, 버튼 텍스트 |
| `#666` | `colors.gray600` | 서브 텍스트 |
| `#999` | `colors.gray400` | 빈 상태 텍스트 |

> `index.css`의 `body { background: #fff }`는 CSS 파일이므로 JS 토큰을 사용할 수 없어 그대로 유지한다.

### 교체하지 않는 색상 (명시적 제외)

- `#f0fff4`, `#fff0f0`, `#fff8f0` — 시맨틱 배경색, TDS 토큰 없음, 현행 유지
- `#ffd700` — ShareCard 그라디언트 전용, 현행 유지
- `rgba(255,255,255,0.2)` — ShareCard 카드 내부 반투명 배경, 현행 유지
- `linear-gradient(135deg, #ff6b35, #ffd700)` — ShareCard 배경 전체, html2canvas 호환 이슈로 inline style 유지

---

## 버튼 교체 범위

| 실제 버튼 텍스트 | TDS 컴포넌트 | variant | 위치 |
|----------------|------------|---------|------|
| `빵 굽기 시작 🔥` | Button | `fill` | HomePage |
| `빵 완성 🍞` | Button | `fill` | HomePage (활성 중 화면) |
| `🗂️ 오븐 보기` | Button | `border` | ResultPage |
| `🏠 홈으로` | Button | `fill` | ResultPage |
| `월간 리포트 →` | TextButton | — | OvenPage (텍스트 스타일) |
| `🏠 홈으로` | Button | `border` | OvenPage |
| `← 뒤로` | Button | `border` | ReportPage |
| `📤 공유 카드 저장` | Button | `fill` | ShareCard |

> ShareCard의 "공유 카드 저장" 버튼은 html2canvas 캡처 대상 밖에 있으므로 TDS Button 교체 가능.

---

## 교체 파일 범위

페이지:
- `src/pages/HomePage.tsx`
- `src/pages/ResultPage.tsx`
- `src/pages/OvenPage.tsx`
- `src/pages/ReportPage.tsx`

컴포넌트:
- `src/components/BakerGrade.tsx`
- `src/components/OvenList.tsx`
- `src/components/BreadDisplay.tsx`
- `src/components/ShareCard.tsx` (버튼만, 그라디언트 배경 유지)

기타:
- `src/main.tsx` — Provider 추가
- `vite.config.ts` — Emotion JSX import source 추가
- `src/index.css` — 변경 없음

### 변경하지 않는 것

- `TimeInput.tsx` — select 드롭다운 방식 유지
- ShareCard 카드 DOM — html2canvas 호환을 위해 inline style 유지
- 레이아웃 구조 (flexbox, padding, borderRadius 등)
- 페이지 라우팅 로직

---

## 성공 기준

- `npm run build` 오류 없음
- 모든 버튼이 TDS `Button` 또는 `TextButton`으로 렌더링됨
- 교체 대상 hex값(`#ff6b35`, `#333`, `#eee`, `#f5f5f5`, `#666`, `#999`, `#fff`)이 TSX 파일에 남지 않음 (단, ShareCard `cardRef` 내부 inline style 제외 — html2canvas 호환)
- `TimeInput` 시간 선택 동작 이상 없음
- `ShareCard` 공유 이미지 다운로드 정상 동작
