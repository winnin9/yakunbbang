# TDS 컴포넌트 마이그레이션 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 야근빵 앱의 모든 버튼과 색상을 `@toss/tds-mobile` 컴포넌트로 교체한다.

**Architecture:** React 18로 다운그레이드 후 TDS Mobile을 설치하고 TDSMobileAITProvider로 앱을 감싼다. 각 페이지의 `<button>`을 TDS `Button`/`TextButton`으로 교체하고 하드코딩 hex 색상값을 `@toss/tds-colors` 토큰으로 대체한다. ShareCard 내 html2canvas 캡처 영역(`cardRef`)의 inline style은 변경하지 않는다.

**Tech Stack:** `@toss/tds-mobile`, `@toss/tds-mobile-ait`, `@toss/tds-colors`, `@emotion/react@^11`, React 18

**Spec:** `docs/superpowers/specs/2026-03-20-tds-component-migration-design.md`

---

## 수정 파일 목록

| 파일 | 변경 내용 |
|------|-----------|
| `package.json` | react/react-dom 18로 다운그레이드, TDS 패키지 추가 |
| `vite.config.ts` | Emotion JSX import source 설정 |
| `src/main.tsx` | TDSMobileAITProvider 추가 |
| `src/pages/HomePage.tsx` | 버튼 2개 + 색상 교체 |
| `src/pages/ResultPage.tsx` | 버튼 2개 + 색상 교체 |
| `src/pages/OvenPage.tsx` | 버튼 2개(Button+TextButton) + 색상 교체 |
| `src/pages/ReportPage.tsx` | 버튼 1개 + 색상 교체 |
| `src/components/BakerGrade.tsx` | 색상만 교체 |
| `src/components/OvenList.tsx` | 색상만 교체 |
| `src/components/BreadDisplay.tsx` | 색상만 교체 |
| `src/components/ShareCard.tsx` | 저장 버튼만 교체, cardRef 내부 유지 |

---

## Task 1: 의존성 설치 + Vite 설정 + Provider

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Modify: `src/main.tsx`

- [ ] **Step 1: React 18 다운그레이드 + TDS 패키지 설치**

```bash
cd /Users/winning/projects/yakunbbang
npm install react@^18 react-dom@^18 @toss/tds-mobile @toss/tds-mobile-ait @toss/tds-colors @emotion/react@^11 --legacy-peer-deps
npm install --save-dev @types/react@^18 @types/react-dom@^18 --legacy-peer-deps
```

- [ ] **Step 2: 설치 확인**

```bash
node -e "const p = require('./node_modules/react/package.json'); console.log('react:', p.version)"
node -e "const p = require('./node_modules/@toss/tds-mobile/package.json'); console.log('tds-mobile:', p.version)"
```

Expected: react 18.x.x, tds-mobile 버전 출력

- [ ] **Step 3: `@toss/tds-colors` 토큰 이름 확인**

```bash
node -e "const c = require('./node_modules/@toss/tds-colors'); console.log(Object.keys(c.colors).filter(k => k.includes('orange') || k.includes('gray')).join('\n'))"
```

Expected: `orange500`, `gray50`, `gray100`, `gray400`, `gray600`, `gray800`, `white` 등이 출력됨
> 만약 토큰 이름이 다르면 이후 Task에서 실제 토큰명으로 교체할 것

- [ ] **Step 4: `vite.config.ts` 수정 — Emotion 지원 추가**

파일 전체를 아래로 교체:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({ jsxImportSource: '@emotion/react' })],
})
```

- [ ] **Step 5: `src/main.tsx` 수정 — TDSMobileAITProvider 추가**

파일 전체를 아래로 교체:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TDSMobileAITProvider } from '@toss/tds-mobile-ait'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TDSMobileAITProvider>
      <App />
    </TDSMobileAITProvider>
  </StrictMode>,
)
```

- [ ] **Step 6: 빌드 확인**

```bash
npm run build 2>&1
```

Expected: `✓ built in` — 오류 없음

- [ ] **Step 7: 커밋**

```bash
git add package.json package-lock.json vite.config.ts src/main.tsx
git commit -m "feat: TDS Mobile 설치 및 Provider 설정 (React 18)"
```

---

## Task 2: HomePage 마이그레이션

현재 코드: `src/pages/HomePage.tsx`
- 버튼 2개: "빵 굽기 시작 🔥" (`#ff6b35`), "빵 완성 🍞" (`#333`)
- 색상: `#ff6b35`, `#333`, `#666`

**Files:**
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 1: HomePage.tsx 상단 import 교체**

기존:
```tsx
// import 없음 (버튼은 HTML 네이티브)
```

추가할 import:
```tsx
import { Button } from '@toss/tds-mobile'
import { colors } from '@toss/tds-colors'
```

- [ ] **Step 2: "빵 완성 🍞" 버튼 교체**

현재 (약 30-35번째 줄, 활성 중 화면 내):
```tsx
<button
  onClick={handleEnd}
  style={{ marginTop: 32, padding: '16px 32px', fontSize: 18, background: '#333', color: '#fff', border: 'none', borderRadius: 12 }}
>
  빵 완성 🍞
</button>
```

교체 후:
```tsx
<Button
  variant="fill"
  size="large"
  onClick={handleEnd}
  style={{ marginTop: 32, background: colors.gray800 }}
>
  빵 완성 🍞
</Button>
```

- [ ] **Step 3: "빵 굽기 시작 🔥" 버튼 교체**

현재 (약 51-57번째 줄):
```tsx
<button
  onClick={() => startSession(hour, minute)}
  style={{ marginTop: 32, padding: '16px 32px', fontSize: 18, background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 12 }}
>
  빵 굽기 시작 🔥
</button>
```

교체 후:
```tsx
<Button
  variant="fill"
  size="large"
  onClick={() => startSession(hour, minute)}
  style={{ marginTop: 32 }}
>
  빵 굽기 시작 🔥
</Button>
```

- [ ] **Step 4: 색상 토큰 교체 (`#666`)**

현재 (약 43번째 줄):
```tsx
<p style={{ marginTop: 8, color: '#666' }}>오늘 목표 종료 시간</p>
```

교체 후:
```tsx
<p style={{ marginTop: 8, color: colors.gray600 }}>오늘 목표 종료 시간</p>
```

- [ ] **Step 5: 빌드 확인**

```bash
npm run build 2>&1
```

Expected: 오류 없음

- [ ] **Step 6: 커밋**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat: HomePage 버튼 및 색상 TDS 적용"
```

---

## Task 3: ResultPage 마이그레이션

현재 코드: `src/pages/ResultPage.tsx`
- 버튼 2개: "🗂️ 오븐 보기" (`#eee`), "🏠 홈으로" (`#ff6b35`)
- 색상: `#f5f5f5`, `#eee`, `#ff6b35`

**Files:**
- Modify: `src/pages/ResultPage.tsx`

- [ ] **Step 1: import 추가**

파일 상단에 추가:
```tsx
import { Button } from '@toss/tds-mobile'
import { colors } from '@toss/tds-colors'
```

- [ ] **Step 2: "🗂️ 오븐 보기" 버튼 교체**

현재 (약 26-28번째 줄):
```tsx
<button onClick={onOven} style={{ flex: 1, padding: 14, background: '#eee', border: 'none', borderRadius: 12, fontSize: 16 }}>
  🗂️ 오븐 보기
</button>
```

교체 후:
```tsx
<Button variant="border" size="large" onClick={onOven} style={{ flex: 1 }}>
  🗂️ 오븐 보기
</Button>
```

- [ ] **Step 3: "🏠 홈으로" 버튼 교체**

현재 (약 29-31번째 줄):
```tsx
<button onClick={onHome} style={{ flex: 1, padding: 14, background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16 }}>
  🏠 홈으로
</button>
```

교체 후:
```tsx
<Button variant="fill" size="large" onClick={onHome} style={{ flex: 1 }}>
  🏠 홈으로
</Button>
```

- [ ] **Step 4: 색상 토큰 교체 (`#f5f5f5`)**

현재 (약 20번째 줄):
```tsx
<div style={{ marginTop: 24, background: '#f5f5f5', borderRadius: 12, padding: 16 }}>
```

교체 후:
```tsx
<div style={{ marginTop: 24, background: colors.gray50, borderRadius: 12, padding: 16 }}>
```

- [ ] **Step 5: 빌드 확인**

```bash
npm run build 2>&1
```

Expected: 오류 없음

- [ ] **Step 6: 커밋**

```bash
git add src/pages/ResultPage.tsx
git commit -m "feat: ResultPage 버튼 및 색상 TDS 적용"
```

---

## Task 4: OvenPage 마이그레이션

현재 코드: `src/pages/OvenPage.tsx`
- 버튼 2개: "월간 리포트 →" (텍스트 스타일, `color: #ff6b35`), "🏠 홈으로" (`#eee`)

**Files:**
- Modify: `src/pages/OvenPage.tsx`

- [ ] **Step 1: import 추가**

파일 상단에 추가:
```tsx
import { Button, TextButton } from '@toss/tds-mobile'
import { colors } from '@toss/tds-colors'
```

- [ ] **Step 2: "월간 리포트 →" 버튼 교체**

현재 (약 19-21번째 줄):
```tsx
<button onClick={onReport} style={{ background: 'none', border: 'none', fontSize: 14, color: '#ff6b35' }}>
  월간 리포트 →
</button>
```

교체 후:
```tsx
<TextButton size="small" onClick={onReport}>
  월간 리포트 →
</TextButton>
```

- [ ] **Step 3: "🏠 홈으로" 버튼 교체**

현재 (약 26-28번째 줄):
```tsx
<button onClick={onHome} style={{ marginTop: 24, width: '100%', padding: 14, background: '#eee', border: 'none', borderRadius: 12, fontSize: 16 }}>
  🏠 홈으로
</button>
```

교체 후:
```tsx
<Button variant="border" size="large" onClick={onHome} style={{ marginTop: 24, width: '100%' }}>
  🏠 홈으로
</Button>
```

- [ ] **Step 4: 빌드 확인**

```bash
npm run build 2>&1
```

Expected: 오류 없음

- [ ] **Step 5: 커밋**

```bash
git add src/pages/OvenPage.tsx
git commit -m "feat: OvenPage 버튼 TDS 적용"
```

---

## Task 5: ReportPage + 나머지 컴포넌트 마이그레이션

**Files:**
- Modify: `src/pages/ReportPage.tsx`
- Modify: `src/components/BakerGrade.tsx`
- Modify: `src/components/OvenList.tsx`
- Modify: `src/components/BreadDisplay.tsx`
- Modify: `src/components/ShareCard.tsx`

### ReportPage

- [ ] **Step 1: ReportPage import 추가**

```tsx
import { Button } from '@toss/tds-mobile'
import { colors } from '@toss/tds-colors'
```

- [ ] **Step 2: "← 뒤로" 버튼 교체**

현재 (약 46-48번째 줄):
```tsx
<button onClick={onBack} style={{ marginTop: 24, width: '100%', padding: 14, background: '#eee', border: 'none', borderRadius: 12, fontSize: 16 }}>
  ← 뒤로
</button>
```

교체 후:
```tsx
<Button variant="border" size="large" onClick={onBack} style={{ marginTop: 24, width: '100%' }}>
  ← 뒤로
</Button>
```

- [ ] **Step 3: ReportPage 색상 교체 (`#666`)**

약 29, 33, 37번째 줄의 `color: '#666'`을 모두 `color: colors.gray600`으로 교체.

### BakerGrade.tsx

- [ ] **Step 4: BakerGrade.tsx import 추가 + 색상 교체**

파일 상단에 추가:
```tsx
import { colors } from '@toss/tds-colors'
```

교체:
- `background: '#f5f5f5'` → `background: colors.gray50`
- `color: '#999'` → `color: colors.gray400`
- `color: '#666'` → `color: colors.gray600`
- `background: '#fff8f0'` → 유지 (TDS 토큰 없음)

### OvenList.tsx

- [ ] **Step 5: OvenList.tsx import 추가 + 색상 교체**

파일 상단에 추가:
```tsx
import { colors } from '@toss/tds-colors'
```

교체:
- `color: '#999'` → `color: colors.gray400`
- `borderBottom: '1px solid #eee'` → `borderBottom: \`1px solid ${colors.gray100}\``
- `color: '#666'` → `color: colors.gray600`

### BreadDisplay.tsx

- [ ] **Step 6: BreadDisplay.tsx import 추가 + 색상 교체**

파일 상단에 추가:
```tsx
import { colors } from '@toss/tds-colors'
```

교체:
- `color: '#666'` → `color: colors.gray600`

### ShareCard.tsx

- [ ] **Step 7: ShareCard.tsx — 저장 버튼만 교체 (cardRef 내부 유지)**

파일 상단에 추가:
```tsx
import { Button } from '@toss/tds-mobile'
```

현재 저장 버튼 (약 63-68번째 줄, `cardRef` 외부):
```tsx
<button
  onClick={handleShare}
  style={{ marginTop: 16, width: '100%', padding: 14, background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16 }}
>
  📤 공유 카드 저장
</button>
```

교체 후:
```tsx
<Button variant="fill" size="large" onClick={handleShare} style={{ marginTop: 16, width: '100%' }}>
  📤 공유 카드 저장
</Button>
```

> ⚠️ `cardRef`가 감싸는 div 내부(`linear-gradient`, `rgba(255,255,255,0.2)` 등)는 절대 변경하지 말 것 — html2canvas 호환

- [ ] **Step 8: 전체 빌드 확인**

```bash
npm run build 2>&1
```

Expected: 오류 없음

- [ ] **Step 9: 잔여 hex 확인 — 교체 대상 색상이 남지 않았는지 검증**

```bash
grep -rn "#ff6b35\|#333\|#eee\|#f5f5f5\|#666\|#999\|#fff" \
  src/pages/HomePage.tsx \
  src/pages/ResultPage.tsx \
  src/pages/OvenPage.tsx \
  src/pages/ReportPage.tsx \
  src/components/BakerGrade.tsx \
  src/components/OvenList.tsx \
  src/components/BreadDisplay.tsx \
  src/components/ShareCard.tsx
```

Expected: 출력 없음 (ShareCard의 `cardRef` 내부 `#fff` 관련 줄만 허용)

- [ ] **Step 10: 커밋**

```bash
git add src/pages/ReportPage.tsx src/components/BakerGrade.tsx src/components/OvenList.tsx src/components/BreadDisplay.tsx src/components/ShareCard.tsx
git commit -m "feat: ReportPage 및 공통 컴포넌트 TDS 색상/버튼 적용"
```
