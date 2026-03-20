# 야근빵 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 야근 시간을 기록하고 목표 대비 초과율을 빵 굽기 메타포로 시각화하는 웹 미니앱을 만든다.

**Architecture:** React + TypeScript 기반 SPA. 데이터는 localStorage에 저장(앱인토스 배포 시 Toss Storage API로 교체). 화면은 홈 → 결과 → 오븐 → 월간리포트 4개 페이지로 구성.

**Tech Stack:** React 18, TypeScript, Vite, localStorage (→ Toss Storage API), html2canvas (공유 카드)

---

## 파일 구조

```
yakunbbang/
  src/
    types/index.ts              # Session, BreadStatus, BakerGrade 타입 정의
    utils/
      breadCalculator.ts        # 초과율 계산 + 7단계 빵 판정 로직
      bakerGrade.ts             # 제빵사 등급 계산 로직
    hooks/
      useStorage.ts             # localStorage 래퍼 훅
      useOvertimeSession.ts     # 야근 세션 시작/종료 관리 훅
    components/
      TimeInput.tsx             # 목표 종료 시간 선택 UI
      BreadDisplay.tsx          # 빵 상태 이모지 + 설명 표시
      OvenList.tsx              # 세션 목록 (날짜순)
      ShareCard.tsx             # SNS 공유용 카드 UI
    pages/
      HomePage.tsx              # 메인: 야근 시작 / 진행 중 화면
      ResultPage.tsx            # 빵 판정 결과 화면
      OvenPage.tsx              # 오븐 (기록 보관함) 화면
      ReportPage.tsx            # 월간 리포트 + 제빵사 등급 화면
    App.tsx                     # 라우팅
    main.tsx                    # 엔트리포인트
  index.html
  package.json
  tsconfig.json
  vite.config.ts
```

---

## Task 1: 프로젝트 초기 세팅

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`

- [ ] **Step 1: 프로젝트 폴더에서 Vite 프로젝트 생성**

```bash
cd /Users/winning/projects/yakunbbang
npm create vite@latest . -- --template react-ts
```

- [ ] **Step 2: 의존성 설치**

```bash
npm install
npm install html2canvas
```

- [ ] **Step 3: 불필요한 기본 파일 제거**

삭제: `src/assets/react.svg`, `public/vite.svg`, `src/App.css`
`src/App.tsx`를 아래 내용으로 교체:

```tsx
export default function App() {
  return <div>야근빵</div>
}
```

`src/index.css` 내용을 모두 지우고 기본 리셋만 남기기:

```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, sans-serif; background: #fff; }
```

- [ ] **Step 4: 앱이 뜨는지 확인**

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` → "야근빵" 텍스트 보이면 성공.

- [ ] **Step 5: 커밋**

```bash
git init
git add .
git commit -m "chore: init vite react-ts project"
```

---

## Task 2: 타입 정의

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: 타입 파일 작성**

```typescript
// src/types/index.ts

export type BreadStatus =
  | 'perfect'      // 0%: 완성된 빵 🍞
  | 'golden'       // 1~20%: 노릇노릇한 빵 🟡
  | 'slight-burn'  // 21~40%: 살짝 탄 빵 🟠
  | 'burnt'        // 41~60%: 많이 탄 빵 🟤
  | 'very-burnt'   // 61~80%: 심하게 탄 빵 ⬛
  | 'charcoal'     // 81~100%: 새까맣게 탄 빵 💀
  | 'ash'          // 100% 초과: 재가 된 빵 ☠️

export type BakerGrade =
  | 'master'       // 90% 이상: 👨‍🍳 마스터 제빵사
  | 'skilled'      // 70~89%: 🧑‍🍳 실력파 제빵사
  | 'diligent'     // 50~69%: 🍞 성실한 제빵사
  | 'smoky'        // 30~49%: 🟠 탄내나는 제빵사
  | 'charcoal-pro' // 29% 이하: ☠️ 숯 전문가

export interface OvertimeSession {
  id: string
  date: string          // 'YYYY-MM-DD'
  startTime: number     // Unix timestamp (ms)
  goalEndTime: number   // Unix timestamp (ms)
  actualEndTime: number // Unix timestamp (ms)
  overratePercent: number
  breadStatus: BreadStatus
}
```

- [ ] **Step 2: 타입 오류 없는지 확인**

```bash
npm run build
```

오류 없으면 성공.

- [ ] **Step 3: 커밋**

```bash
git add src/types/index.ts
git commit -m "feat: add core type definitions"
```

---

## Task 3: 초과율 계산 + 빵 판정 로직

**Files:**
- Create: `src/utils/breadCalculator.ts`

- [ ] **Step 1: 유틸 파일 작성**

```typescript
// src/utils/breadCalculator.ts

import type { BreadStatus } from '../types'

export function calcOverrate(
  startTime: number,
  goalEndTime: number,
  actualEndTime: number
): number {
  const planned = goalEndTime - startTime
  const overtime = actualEndTime - goalEndTime
  if (planned <= 0) return 0
  return Math.round((overtime / planned) * 100)
}

export function getBreadStatus(overratePercent: number): BreadStatus {
  if (overratePercent <= 0)  return 'perfect'
  if (overratePercent <= 20) return 'golden'
  if (overratePercent <= 40) return 'slight-burn'
  if (overratePercent <= 60) return 'burnt'
  if (overratePercent <= 80) return 'very-burnt'
  if (overratePercent <= 100) return 'charcoal'
  return 'ash'
}

export const BREAD_LABEL: Record<BreadStatus, { emoji: string; label: string; comment: string }> = {
  perfect:     { emoji: '🍞', label: '완성된 빵',        comment: '목표 달성! 오늘도 칼퇴!' },
  golden:      { emoji: '🟡', label: '노릇노릇한 빵',    comment: '살짝 늦었지만 괜찮아요.' },
  'slight-burn': { emoji: '🟠', label: '살짝 탄 빵',    comment: '조금 타고 있어요.' },
  burnt:       { emoji: '🟤', label: '많이 탄 빵',       comment: '많이 탔네요.' },
  'very-burnt': { emoji: '⬛', label: '심하게 탄 빵',    comment: '거의 숯이에요.' },
  charcoal:    { emoji: '💀', label: '새까맣게 탄 빵',   comment: '완전히 탔어요.' },
  ash:         { emoji: '☠️', label: '재가 된 빵',       comment: '목표의 2배 이상 야근이에요.' },
}
```

- [ ] **Step 2: 로직이 맞는지 콘솔로 빠르게 검증**

`src/main.tsx` 상단에 임시 추가:

```typescript
import { calcOverrate, getBreadStatus } from './utils/breadCalculator'
// 20:00 시작, 22:00 목표, 23:00 실제 → 초과율 50%
const start = new Date('2026-01-01T20:00').getTime()
const goal  = new Date('2026-01-01T22:00').getTime()
const actual= new Date('2026-01-01T23:00').getTime()
console.log(calcOverrate(start, goal, actual)) // 50
console.log(getBreadStatus(50))                 // 'burnt'
```

```bash
npm run dev
```

브라우저 콘솔에서 `50`, `burnt` 확인 후 임시 코드 삭제.

- [ ] **Step 3: 커밋**

```bash
git add src/utils/breadCalculator.ts
git commit -m "feat: add bread status calculator"
```

---

## Task 4: 제빵사 등급 로직

**Files:**
- Create: `src/utils/bakerGrade.ts`

- [ ] **Step 1: 파일 작성**

```typescript
// src/utils/bakerGrade.ts

import type { BakerGrade, OvertimeSession } from '../types'

export function calcBakerGrade(sessions: OvertimeSession[]): BakerGrade | null {
  if (sessions.length < 3) return null

  const goodCount = sessions.filter(
    (s) => s.overratePercent <= 20
  ).length
  const ratio = (goodCount / sessions.length) * 100

  if (ratio >= 90) return 'master'
  if (ratio >= 70) return 'skilled'
  if (ratio >= 50) return 'diligent'
  if (ratio >= 30) return 'smoky'
  return 'charcoal-pro'
}

export const BAKER_GRADE_LABEL: Record<BakerGrade, { emoji: string; title: string; comment: string }> = {
  master:       { emoji: '👨‍🍳', title: '마스터 제빵사',    comment: '야근도 내 손 안에' },
  skilled:      { emoji: '🧑‍🍳', title: '실력파 제빵사',    comment: '꽤 잘 구웠어요' },
  diligent:     { emoji: '🍞',   title: '성실한 제빵사',    comment: '분전하고 있어요' },
  smoky:        { emoji: '🟠',   title: '탄내나는 제빵사',  comment: '오븐 온도 점검 필요' },
  'charcoal-pro': { emoji: '☠️', title: '숯 전문가',        comment: '이달 오븐이 너무 뜨거웠어요' },
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/utils/bakerGrade.ts
git commit -m "feat: add baker grade calculator"
```

---

## Task 5: 스토리지 훅

**Files:**
- Create: `src/hooks/useStorage.ts`

- [ ] **Step 1: 파일 작성**

```typescript
// src/hooks/useStorage.ts
// ⚠️ 앱인토스 배포 시 localStorage → Toss Storage API로 교체 필요

import type { OvertimeSession } from '../types'

const STORAGE_KEY = 'yakunbbang_sessions'

export function useSessions() {
  function getSessions(): OvertimeSession[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  function saveSession(session: OvertimeSession): void {
    const sessions = getSessions()
    sessions.push(session)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  }

  function getSessionsByMonth(year: number, month: number): OvertimeSession[] {
    return getSessions().filter((s) => {
      const d = new Date(s.startTime)
      return d.getFullYear() === year && d.getMonth() + 1 === month
    })
  }

  return { getSessions, saveSession, getSessionsByMonth }
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/hooks/useStorage.ts
git commit -m "feat: add localStorage storage hook"
```

---

## Task 6: 야근 세션 훅

**Files:**
- Create: `src/hooks/useOvertimeSession.ts`

- [ ] **Step 1: 파일 작성**

```typescript
// src/hooks/useOvertimeSession.ts

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid' // 또는 crypto.randomUUID() 사용
import { calcOverrate, getBreadStatus } from '../utils/breadCalculator'
import { useSessions } from './useStorage'
import type { OvertimeSession } from '../types'

interface ActiveSession {
  startTime: number
  goalEndTime: number
}

export function useOvertimeSession() {
  const [active, setActive] = useState<ActiveSession | null>(null)
  const { saveSession } = useSessions()

  function startSession(goalHour: number, goalMinute: number): void {
    const now = Date.now()
    const today = new Date(now)
    const goal = new Date(today)
    goal.setHours(goalHour, goalMinute, 0, 0)
    setActive({ startTime: now, goalEndTime: goal.getTime() })
  }

  function endSession(): OvertimeSession | null {
    if (!active) return null
    const actualEndTime = Date.now()
    const overratePercent = calcOverrate(active.startTime, active.goalEndTime, actualEndTime)
    const session: OvertimeSession = {
      id: crypto.randomUUID(), // uuid 패키지 불필요 — 브라우저 내장 crypto.randomUUID() 사용
      date: new Date(active.startTime).toISOString().slice(0, 10),
      startTime: active.startTime,
      goalEndTime: active.goalEndTime,
      actualEndTime,
      overratePercent,
      breadStatus: getBreadStatus(overratePercent),
    }
    saveSession(session)
    setActive(null)
    return session
  }

  return { active, startSession, endSession }
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/hooks/useOvertimeSession.ts
git commit -m "feat: add overtime session management hook"
```

---

## Task 7: 홈 화면 (야근 시작 / 진행 중)

**Files:**
- Create: `src/pages/HomePage.tsx`, `src/components/TimeInput.tsx`

- [ ] **Step 1: TimeInput 컴포넌트 작성**

```tsx
// src/components/TimeInput.tsx

interface Props {
  hour: number
  minute: number
  onChange: (hour: number, minute: number) => void
}

export function TimeInput({ hour, minute, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 24 }}>
      <select value={hour} onChange={(e) => onChange(Number(e.target.value), minute)}>
        {Array.from({ length: 24 }, (_, i) => (
          <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
        ))}
      </select>
      <span>:</span>
      <select value={minute} onChange={(e) => onChange(hour, Number(e.target.value))}>
        {[0, 10, 20, 30, 40, 50].map((m) => (
          <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
        ))}
      </select>
    </div>
  )
}
```

- [ ] **Step 2: HomePage 작성**

```tsx
// src/pages/HomePage.tsx

import { useState } from 'react'
import { TimeInput } from '../components/TimeInput'
import { useOvertimeSession } from '../hooks/useOvertimeSession'
import type { OvertimeSession } from '../types'

interface Props {
  onResult: (session: OvertimeSession) => void
}

export function HomePage({ onResult }: Props) {
  const [hour, setHour] = useState(22)
  const [minute, setMinute] = useState(0)
  const { active, startSession, endSession } = useOvertimeSession()

  function handleEnd() {
    const session = endSession()
    if (session) onResult(session)
  }

  if (active) {
    const start = new Date(active.startTime)
    const goal = new Date(active.goalEndTime)
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <h1>🔥 빵 굽는 중...</h1>
        <p style={{ marginTop: 16 }}>시작: {start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
        <p>목표 종료: {goal.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
        <button
          onClick={handleEnd}
          style={{ marginTop: 32, padding: '16px 32px', fontSize: 18, background: '#333', color: '#fff', border: 'none', borderRadius: 12 }}
        >
          빵 완성 🍞
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <h1>🍞 야근빵</h1>
      <p style={{ marginTop: 8, color: '#666' }}>오늘 목표 종료 시간</p>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <TimeInput
          hour={hour}
          minute={minute}
          onChange={(h, m) => { setHour(h); setMinute(m) }}
        />
      </div>
      <button
        onClick={() => startSession(hour, minute)}
        style={{ marginTop: 32, padding: '16px 32px', fontSize: 18, background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 12 }}
      >
        빵 굽기 시작 🔥
      </button>
    </div>
  )
}
```

- [ ] **Step 3: App.tsx에서 HomePage 연결**

```tsx
// src/App.tsx
import { useState } from 'react'
import { HomePage } from './pages/HomePage'
import type { OvertimeSession } from './types'

export default function App() {
  const [result, setResult] = useState<OvertimeSession | null>(null)

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh' }}>
      <HomePage onResult={setResult} />
      {result && <pre style={{ padding: 16, fontSize: 12 }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}
```

- [ ] **Step 4: 브라우저에서 동작 확인**

```bash
npm run dev
```

- 시간 선택 → "빵 굽기 시작" 클릭 → 진행 중 화면 전환 확인
- "빵 완성" 클릭 → 콘솔/화면에 세션 데이터 확인

- [ ] **Step 5: 커밋**

```bash
git add src/pages/HomePage.tsx src/components/TimeInput.tsx src/App.tsx
git commit -m "feat: add home page with session start/end flow"
```

---

## Task 8: 결과 화면

**Files:**
- Create: `src/pages/ResultPage.tsx`, `src/components/BreadDisplay.tsx`

- [ ] **Step 1: BreadDisplay 컴포넌트 작성**

```tsx
// src/components/BreadDisplay.tsx

import { BREAD_LABEL } from '../utils/breadCalculator'
import type { BreadStatus } from '../types'

interface Props {
  status: BreadStatus
  overratePercent: number
}

export function BreadDisplay({ status, overratePercent }: Props) {
  const { emoji, label, comment } = BREAD_LABEL[status]
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 80 }}>{emoji}</div>
      <h2 style={{ marginTop: 8 }}>{label}</h2>
      <p style={{ marginTop: 4, color: '#666' }}>{comment}</p>
      <p style={{ marginTop: 12, fontSize: 28, fontWeight: 'bold' }}>
        초과율 {overratePercent}%
      </p>
    </div>
  )
}
```

- [ ] **Step 2: ResultPage 작성**

```tsx
// src/pages/ResultPage.tsx

import { BreadDisplay } from '../components/BreadDisplay'
import type { OvertimeSession } from '../types'

interface Props {
  session: OvertimeSession
  onOven: () => void
  onHome: () => void
}

export function ResultPage({ session, onOven, onHome }: Props) {
  const start = new Date(session.startTime)
  const end = new Date(session.actualEndTime)
  const goal = new Date(session.goalEndTime)

  return (
    <div style={{ padding: 24 }}>
      <BreadDisplay status={session.breadStatus} overratePercent={session.overratePercent} />
      <div style={{ marginTop: 24, background: '#f5f5f5', borderRadius: 12, padding: 16 }}>
        <p>🕐 시작: {start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
        <p>🎯 목표: {goal.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
        <p>🕙 종료: {end.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <button onClick={onOven} style={{ flex: 1, padding: 14, background: '#eee', border: 'none', borderRadius: 12, fontSize: 16 }}>
          🗂️ 오븐 보기
        </button>
        <button onClick={onHome} style={{ flex: 1, padding: 14, background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16 }}>
          🏠 홈으로
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: App.tsx 업데이트 — 결과 화면 라우팅 추가**

```tsx
// src/App.tsx
import { useState } from 'react'
import { HomePage } from './pages/HomePage'
import { ResultPage } from './pages/ResultPage'
import type { OvertimeSession } from './types'

type Page = 'home' | 'result' | 'oven' | 'report'

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [lastSession, setLastSession] = useState<OvertimeSession | null>(null)

  function handleResult(session: OvertimeSession) {
    setLastSession(session)
    setPage('result')
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh' }}>
      {page === 'home' && <HomePage onResult={handleResult} />}
      {page === 'result' && lastSession && (
        <ResultPage
          session={lastSession}
          onOven={() => setPage('oven')}
          onHome={() => setPage('home')}
        />
      )}
      {(page === 'oven' || page === 'report') && <div>준비 중</div>}
    </div>
  )
}
```

- [ ] **Step 4: 전체 플로우 확인**

시작 → 종료 → 결과 화면(빵 이모지 + 초과율) 확인

- [ ] **Step 5: 커밋**

```bash
git add src/pages/ResultPage.tsx src/components/BreadDisplay.tsx src/App.tsx
git commit -m "feat: add result page with bread status display"
```

---

## Task 9: 오븐 화면 (기록 보관함)

**Files:**
- Create: `src/pages/OvenPage.tsx`, `src/components/OvenList.tsx`

- [ ] **Step 1: OvenList 컴포넌트 작성**

```tsx
// src/components/OvenList.tsx

import { BREAD_LABEL } from '../utils/breadCalculator'
import type { OvertimeSession } from '../types'

interface Props {
  sessions: OvertimeSession[]
}

export function OvenList({ sessions }: Props) {
  if (sessions.length === 0) {
    return <p style={{ color: '#999', textAlign: 'center', padding: 32 }}>아직 기록이 없어요 🍞</p>
  }

  const sorted = [...sessions].sort((a, b) => b.startTime - a.startTime)

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {sorted.map((s) => {
        const { emoji, label } = BREAD_LABEL[s.breadStatus]
        return (
          <li key={s.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontSize: 32, marginRight: 12 }}>{emoji}</span>
            <div>
              <p style={{ fontWeight: 'bold' }}>{s.date}</p>
              <p style={{ color: '#666', fontSize: 14 }}>{label} · 초과율 {s.overratePercent}%</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
```

- [ ] **Step 2: OvenPage 작성**

```tsx
// src/pages/OvenPage.tsx

import { useSessions } from '../hooks/useStorage'
import { OvenList } from '../components/OvenList'

interface Props {
  onHome: () => void
  onReport: () => void
}

export function OvenPage({ onHome, onReport }: Props) {
  const { getSessions } = useSessions()
  const sessions = getSessions()

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🗂️ 오븐</h1>
        <button onClick={onReport} style={{ background: 'none', border: 'none', fontSize: 14, color: '#ff6b35' }}>
          월간 리포트 →
        </button>
      </div>
      <div style={{ marginTop: 16 }}>
        <OvenList sessions={sessions} />
      </div>
      <button onClick={onHome} style={{ marginTop: 24, width: '100%', padding: 14, background: '#eee', border: 'none', borderRadius: 12, fontSize: 16 }}>
        🏠 홈으로
      </button>
    </div>
  )
}
```

- [ ] **Step 3: App.tsx에 오븐 화면 연결**

`App.tsx`의 `{(page === 'oven' || page === 'report') && <div>준비 중</div>}` 부분 교체:

```tsx
{page === 'oven' && (
  <OvenPage onHome={() => setPage('home')} onReport={() => setPage('report')} />
)}
{page === 'report' && <div>월간 리포트 준비 중</div>}
```

상단에 import 추가:
```tsx
import { OvenPage } from './pages/OvenPage'
```

- [ ] **Step 4: 커밋**

```bash
git add src/pages/OvenPage.tsx src/components/OvenList.tsx src/App.tsx
git commit -m "feat: add oven page with session history"
```

---

## Task 10: 월간 리포트 + 제빵사 등급 화면

**Files:**
- Create: `src/pages/ReportPage.tsx`, `src/components/BakerGrade.tsx`

- [ ] **Step 1: BakerGrade 컴포넌트 작성**

```tsx
// src/components/BakerGrade.tsx

import { BAKER_GRADE_LABEL } from '../utils/bakerGrade'
import type { BakerGrade } from '../types'

interface Props {
  grade: BakerGrade | null
}

export function BakerGradeDisplay({ grade }: Props) {
  if (!grade) {
    return (
      <div style={{ textAlign: 'center', padding: 24, background: '#f5f5f5', borderRadius: 12 }}>
        <p>📊 아직 데이터가 부족해요</p>
        <p style={{ fontSize: 13, color: '#999', marginTop: 4 }}>3회 이상 기록하면 등급이 나와요</p>
      </div>
    )
  }
  const { emoji, title, comment } = BAKER_GRADE_LABEL[grade]
  return (
    <div style={{ textAlign: 'center', padding: 24, background: '#fff8f0', borderRadius: 12 }}>
      <div style={{ fontSize: 64 }}>{emoji}</div>
      <h2 style={{ marginTop: 8 }}>{title}</h2>
      <p style={{ color: '#666', marginTop: 4 }}>{comment}</p>
    </div>
  )
}
```

- [ ] **Step 2: ReportPage 작성**

```tsx
// src/pages/ReportPage.tsx

import { useSessions } from '../hooks/useStorage'
import { calcBakerGrade } from '../utils/bakerGrade'
import { BakerGradeDisplay } from '../components/BakerGrade'
import { BREAD_LABEL } from '../utils/breadCalculator'

interface Props {
  onBack: () => void
}

export function ReportPage({ onBack }: Props) {
  const { getSessionsByMonth } = useSessions()
  // 이전 달 데이터를 표시 (PRD 7-5: 매월 1일 기준 이전 달 자동 집계)
  // now.getMonth()는 0-indexed라 1을 빼면 이전 달이 됨
  const now = new Date()
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
  const month = now.getMonth() === 0 ? 12 : now.getMonth() // getMonth()=0→12월, 나머지는 현재-1
  const sessions = getSessionsByMonth(year, month)
  const grade = calcBakerGrade(sessions)

  const goodCount = sessions.filter((s) => s.overratePercent <= 20).length
  const burntCount = sessions.length - goodCount

  return (
    <div style={{ padding: 24 }}>
      <h1>📊 {year}년 {month}월 리포트</h1>
      <p style={{ color: '#666', marginTop: 4 }}>총 {sessions.length}회 야근</p>
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <div style={{ flex: 1, padding: 16, background: '#f0fff4', borderRadius: 12, textAlign: 'center' }}>
          <p style={{ fontSize: 28, fontWeight: 'bold' }}>{goodCount}</p>
          <p style={{ fontSize: 13, color: '#666' }}>예쁜 빵 🍞🟡</p>
        </div>
        <div style={{ flex: 1, padding: 16, background: '#fff0f0', borderRadius: 12, textAlign: 'center' }}>
          <p style={{ fontSize: 28, fontWeight: 'bold' }}>{burntCount}</p>
          <p style={{ fontSize: 13, color: '#666' }}>탄 빵 🟠🟤⬛</p>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <BakerGradeDisplay grade={grade} />
      </div>
      <button onClick={onBack} style={{ marginTop: 24, width: '100%', padding: 14, background: '#eee', border: 'none', borderRadius: 12, fontSize: 16 }}>
        ← 뒤로
      </button>
    </div>
  )
}
```

- [ ] **Step 3: App.tsx에 리포트 화면 연결**

```tsx
import { ReportPage } from './pages/ReportPage'
// ...
{page === 'report' && <ReportPage onBack={() => setPage('oven')} />}
```

- [ ] **Step 4: 커밋**

```bash
git add src/pages/ReportPage.tsx src/components/BakerGrade.tsx src/App.tsx
git commit -m "feat: add monthly report page with baker grade"
```

---

## Task 11: SNS 공유 카드

**Files:**
- Create: `src/components/ShareCard.tsx`

- [ ] **Step 1: ShareCard 컴포넌트 작성**

```tsx
// src/components/ShareCard.tsx
// html2canvas로 카드 이미지 생성 후 다운로드

import { useRef } from 'react'
import html2canvas from 'html2canvas'
import { BAKER_GRADE_LABEL } from '../utils/bakerGrade'
import type { BakerGrade } from '../types'

interface Props {
  year: number
  month: number
  grade: BakerGrade | null
  goodCount: number
  burntCount: number
}

export function ShareCard({ year, month, grade, goodCount, burntCount }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  async function handleShare() {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, { scale: 2 })
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `야근빵-${year}-${month}.png`
    a.click()
    // ⚠️ 앱인토스 배포 시 Toss 공유 API로 교체: toss.share({ imageUrl: url })
  }

  const gradeInfo = grade ? BAKER_GRADE_LABEL[grade] : null

  return (
    <div>
      <div
        ref={cardRef}
        style={{
          width: 320, padding: 32, background: 'linear-gradient(135deg, #ff6b35, #ffd700)',
          borderRadius: 24, textAlign: 'center', color: '#fff'
        }}
      >
        <p style={{ fontSize: 13, opacity: 0.8 }}>🍞 야근빵</p>
        <p style={{ fontSize: 18, fontWeight: 'bold', marginTop: 4 }}>{year}년 {month}월</p>
        {gradeInfo && (
          <>
            <div style={{ fontSize: 64, marginTop: 16 }}>{gradeInfo.emoji}</div>
            <h2 style={{ marginTop: 8 }}>{gradeInfo.title}</h2>
          </>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 20px' }}>
            <p style={{ fontSize: 24, fontWeight: 'bold' }}>{goodCount}</p>
            <p style={{ fontSize: 12 }}>예쁜 빵</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 20px' }}>
            <p style={{ fontSize: 24, fontWeight: 'bold' }}>{burntCount}</p>
            <p style={{ fontSize: 12 }}>탄 빵</p>
          </div>
        </div>
      </div>
      <button
        onClick={handleShare}
        style={{ marginTop: 16, width: '100%', padding: 14, background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16 }}
      >
        📤 공유 카드 저장
      </button>
    </div>
  )
}
```

- [ ] **Step 2: ReportPage에 ShareCard 추가**

`src/pages/ReportPage.tsx`에 import 추가:
```tsx
import { ShareCard } from '../components/ShareCard'
```

`BakerGradeDisplay` 아래에 추가:
```tsx
<div style={{ marginTop: 16 }}>
  <ShareCard year={year} month={month} grade={grade} goodCount={goodCount} burntCount={burntCount} />
</div>
```

- [ ] **Step 3: 공유 카드 이미지 저장 동작 확인**

```bash
npm run dev
```

월간 리포트 → "공유 카드 저장" 버튼 → PNG 다운로드 확인

- [ ] **Step 4: 커밋**

```bash
git add src/components/ShareCard.tsx src/pages/ReportPage.tsx
git commit -m "feat: add SNS share card with html2canvas"
```

---

## Task 12: 최종 점검 + 빌드

- [ ] **Step 1: 전체 플로우 확인**

```bash
npm run dev
```

체크리스트:
- [ ] 홈에서 목표 시간 설정 후 시작
- [ ] 진행 중 화면 표시
- [ ] 종료 후 결과 화면 (빵 이모지 + 초과율)
- [ ] 오븐에서 기록 목록 확인
- [ ] 월간 리포트 (예쁜 빵 / 탄 빵 수 + 제빵사 등급)
- [ ] 공유 카드 이미지 저장

- [ ] **Step 2: 프로덕션 빌드 확인**

```bash
npm run build
npm run preview
```

빌드 오류 없으면 성공.

- [ ] **Step 3: 최종 커밋**

```bash
git add .
git commit -m "feat: complete yakunbbang MVP"
```

---

## 다음 단계 (MVP 이후)

- 앱인토스 SDK 연동 (Toss Storage API, Toss Share API, Toss Login)
- 빵 이미지 리소스 제작 (7단계 × 빵 종류)
- 빵 스킨 + 광고 리워드
- 친구 비교 기능
- 오븐 화면 월별 탭 (PRD 7-4 명시 기능, MVP에서는 전체 목록만 표시)
