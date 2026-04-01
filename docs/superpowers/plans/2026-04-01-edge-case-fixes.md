# 야근빵 엣지케이스 수정 구현 플랜

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 실사용 엣지케이스 19개를 우선순위 순서로 수정하여 야근빵 앱을 오픈 가능한 품질로 만든다.

**Architecture:** 기존 React + TypeScript + Vite 구조 유지. 새 파일 생성 없이 기존 파일만 수정. 데드 코드 2개 삭제.

**Tech Stack:** React 18, TypeScript, Vite, localStorage

---

## 수정 대상 파일 요약

| 파일 | 변경 내용 |
|------|----------|
| `src/hooks/useStorage.ts` | saveSession try/catch, active session 저장/불러오기 추가 |
| `src/hooks/useOvertimeSession.ts` | active localStorage persist, 앱 복원, 중복 guard, UUID fallback |
| `src/pages/HomePage.tsx` | 자정 자동 보정, 타이머 60s, 분 5분 단위 |
| `src/utils/breadCalculator.ts` | planned<=0 시 0 반환으로 단순화 |
| `src/pages/ResultPage.tsx` | 음수 초과율 긍정 피드백 |
| `src/pages/ReportPage.tsx` | isCurrent를 렌더마다 fresh 계산 |
| `src/App.tsx` | lastSession null 시 home 폴백 |
| `src/components/OvenList.tsx` | 날짜 파싱 로컬타임 보정 |
| `src/components/ShareCard.tsx` | 삭제 (미사용 데드 코드) |
| `src/components/TimeInput.tsx` | 삭제 (미사용 데드 코드) |

---

## Task 1: 세션 유실 방지 + 저장 실패 처리 + 중복 세션 방지 + UUID 폴백

**Files:**
- Modify: `src/hooks/useStorage.ts`
- Modify: `src/hooks/useOvertimeSession.ts`

**해결 이슈:** 높음-1 (세션 유실), 높음-4 (중복 세션), 높음-5 (저장 실패 무음), 낮음-2 (crypto.randomUUID HTTP 환경)

- [ ] **Step 1: useStorage.ts 전체 교체**

`src/hooks/useStorage.ts` 내용을 아래로 교체한다:

```typescript
// src/hooks/useStorage.ts
// ⚠️ 앱인토스 배포 시 localStorage → Toss Storage API로 교체 필요

import type { OvertimeSession } from '../types'

const STORAGE_KEY = 'yakunbbang_sessions'
const ACTIVE_KEY = 'yakunbbang_active'

export interface ActiveSession {
  startTime: number
  goalEndTime: number
}

export function useSessions() {
  function getSessions(): OvertimeSession[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  function saveSession(session: OvertimeSession): boolean {
    try {
      let sessions = getSessions()
      // 100개 초과 시 1년 이상 된 데이터 자동 정리
      if (sessions.length > 100) {
        const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000
        sessions = sessions.filter((s) => s.startTime > oneYearAgo)
      }
      sessions.push(session)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
      return true
    } catch {
      return false
    }
  }

  function getSessionsByMonth(year: number, month: number): OvertimeSession[] {
    return getSessions().filter((s) => {
      const d = new Date(s.startTime)
      return d.getFullYear() === year && d.getMonth() + 1 === month
    })
  }

  function getActiveSession(): ActiveSession | null {
    try {
      const raw = localStorage.getItem(ACTIVE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  function saveActiveSession(active: ActiveSession | null): void {
    try {
      if (active === null) {
        localStorage.removeItem(ACTIVE_KEY)
      } else {
        localStorage.setItem(ACTIVE_KEY, JSON.stringify(active))
      }
    } catch {
      // 저장 실패 시 무시
    }
  }

  return { getSessions, saveSession, getSessionsByMonth, getActiveSession, saveActiveSession }
}
```

- [ ] **Step 2: useOvertimeSession.ts 전체 교체**

`src/hooks/useOvertimeSession.ts` 내용을 아래로 교체한다:

```typescript
// src/hooks/useOvertimeSession.ts

import { useState } from 'react'
import { calcOverrate, getBreadStatus } from '../utils/breadCalculator'
import { useSessions } from './useStorage'
import type { OvertimeSession } from '../types'

interface ActiveSession {
  startTime: number
  goalEndTime: number
}

function safeRandomUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // HTTP 환경 등 crypto.randomUUID 미지원 시 fallback
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function useOvertimeSession() {
  const { saveSession, getActiveSession, saveActiveSession } = useSessions()

  // 앱 시작 시 localStorage에서 진행 중 세션 복원
  const [active, setActive] = useState<ActiveSession | null>(() => getActiveSession())

  function startSession(goalHour: number, goalMinute: number, dateOffset: number = 0): void {
    if (active) return // 중복 세션 방지
    const now = Date.now()
    const goal = new Date(now)
    goal.setDate(goal.getDate() + dateOffset)
    goal.setHours(goalHour, goalMinute, 0, 0)
    const newActive: ActiveSession = { startTime: now, goalEndTime: goal.getTime() }
    saveActiveSession(newActive)
    setActive(newActive)
  }

  function endSession(): OvertimeSession | null {
    if (!active) return null
    const actualEndTime = Date.now()
    const overratePercent = calcOverrate(active.startTime, active.goalEndTime, actualEndTime)
    const session: OvertimeSession = {
      id: safeRandomUUID(),
      date: new Date(active.startTime).toISOString().slice(0, 10),
      startTime: active.startTime,
      goalEndTime: active.goalEndTime,
      actualEndTime,
      overratePercent,
      breadStatus: getBreadStatus(overratePercent),
    }
    const saved = saveSession(session)
    if (!saved) {
      alert('저장에 실패했습니다. 기기 저장 공간을 확인해주세요.')
    }
    saveActiveSession(null)
    setActive(null)
    return session
  }

  function cancelSession(): void {
    saveActiveSession(null)
    setActive(null)
  }

  return { active, startSession, endSession, cancelSession }
}
```

- [ ] **Step 3: 새로고침 복원 동작 확인**

```bash
cd /Users/winning/projects/yakunbbang && npm run dev
```

1. 브라우저에서 목표 시간 설정 후 "빵 굽기 시작" 클릭
2. 브라우저 새로고침 (Cmd+R)
3. 베이킹 중 화면이 그대로 보이면 성공
4. DevTools > Application > Local Storage > `yakunbbang_active` 키 확인
5. "빵 완성" 클릭 → 결과 화면 정상 동작 확인
6. `yakunbbang_active` 키가 삭제되었는지 확인

- [ ] **Step 4: 커밋**

```bash
cd /Users/winning/projects/yakunbbang
git add src/hooks/useStorage.ts src/hooks/useOvertimeSession.ts
git commit -m "fix: persist active session to localStorage, guard duplicate start, safe UUID fallback"
```

---

## Task 2: 자정 넘기기 자동 보정 + breadCalculator 방어 처리

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/utils/breadCalculator.ts`

**해결 이슈:** 높음-2 (자정 넘기기), 높음-3 (목표 시간 역전 시 비정상 초과율)

- [ ] **Step 1: breadCalculator.ts의 planned<=0 케이스 단순화**

`src/utils/breadCalculator.ts`에서 `calcOverrate` 함수를 아래로 교체한다:

```typescript
export function calcOverrate(
  startTime: number,
  goalEndTime: number,
  actualEndTime: number
): number {
  const planned = goalEndTime - startTime
  const overtime = actualEndTime - goalEndTime
  // planned <= 0은 잘못된 입력(목표가 시작보다 이전). Task 2에서 입력 단계에서 방지하므로 0% 처리.
  if (planned <= 0) return 0
  return Math.round((overtime / planned) * 100)
}
```

- [ ] **Step 2: HomePage.tsx에 handleStart 함수 추가 + dateLabel 계산 추가**

`src/pages/HomePage.tsx`에서 idle 화면 return 직전에 `handleStart` 함수와 `dateLabel` 계산을 추가한다.

`cancelSession` 아래의 빈 줄 이후, `if (active) {` 블록 위에 아래를 삽입한다:

현재 코드에서 `if (active) {` 바로 위:
```tsx
  const { active, startSession, endSession, cancelSession } = useOvertimeSession()
```

이 줄 바로 아래에 아래 두 함수를 추가한다:

```tsx
  function handleStart() {
    const now = new Date()
    const tentative = new Date(now)
    tentative.setDate(tentative.getDate() + dateOffset)
    tentative.setHours(hour, minute, 0, 0)
    // 목표 시간이 현재보다 이전이면 자동으로 +1일 보정
    const finalOffset = tentative.getTime() <= now.getTime() ? dateOffset + 1 : dateOffset
    startSession(hour, minute, finalOffset)
  }
```

- [ ] **Step 3: idle 화면에서 dateLabel 계산 + 버튼/표시 업데이트**

idle 화면 `return (` 바로 위에 아래 계산을 추가한다:

```tsx
  // 현재 설정 기준으로 목표가 과거이면 실질적으로 내일
  const nowForLabel = new Date()
  const tentativeGoal = new Date(nowForLabel)
  tentativeGoal.setDate(tentativeGoal.getDate() + dateOffset)
  tentativeGoal.setHours(hour, minute, 0, 0)
  const effectiveDateOffset = tentativeGoal.getTime() <= nowForLabel.getTime() ? dateOffset + 1 : dateOffset
  const dateLabel = effectiveDateOffset === 0 ? '오늘' : '내일'
```

날짜 버튼의 레이블을 변경한다:

기존:
```tsx
{dateOffset === 0 ? '오늘' : '내일'}
```

변경:
```tsx
{dateLabel}
```

빵 굽기 시작 버튼의 onClick을 변경한다:

기존:
```tsx
onClick={() => startSession(hour, minute, dateOffset)}
```

변경:
```tsx
onClick={handleStart}
```

- [ ] **Step 4: 자정 보정 동작 확인**

```bash
npm run dev
```

1. 시간 선택에서 현재 시각보다 **이전 시간** (예: 현재 15:00이면 12:00)을 선택
2. 날짜 레이블이 자동으로 "내일"로 바뀌는지 확인
3. "빵 굽기 시작" 클릭 후 DevTools > localStorage `yakunbbang_active` 에서 `goalEndTime`이 내일 날짜인지 확인 (`new Date(goalEndTime)`으로 콘솔 확인)
4. 현재보다 **이후 시간** 선택 시 "오늘"로 표시되는지 확인

- [ ] **Step 5: 커밋**

```bash
cd /Users/winning/projects/yakunbbang
git add src/pages/HomePage.tsx src/utils/breadCalculator.ts
git commit -m "fix: auto-advance goal to next day when past, simplify invalid planned<=0 to 0%"
```

---

## Task 3: 음수 초과율 — 일찍 퇴근 시 긍정 피드백

**Files:**
- Modify: `src/pages/ResultPage.tsx`

**해결 이슈:** 중간-4 (음수 초과율 0%로 뭉뚱그려 표시)

- [ ] **Step 1: ResultPage.tsx에서 isEarly 계산 추가 + 표시 변경**

`diffMs`, `diffMin` 계산 부분을 아래로 교체한다:

기존:
```tsx
  const diffMs = actualEndTime - goalEndTime
  const diffMin = Math.max(0, Math.round(diffMs / 60000))
```

변경:
```tsx
  const diffMs = actualEndTime - goalEndTime
  const isEarly = diffMs < 0
  const diffMin = Math.round(Math.abs(diffMs) / 60000)
```

초과율 표시 span을 변경한다:

기존:
```tsx
              {overratePercent <= 0 ? '0%' : `+${overratePercent}%`}
```

변경:
```tsx
              {isEarly
                ? `-${Math.abs(overratePercent)}%`
                : overratePercent === 0
                ? '0%'
                : `+${overratePercent}%`}
```

초과 시간 행을 변경한다:

기존:
```tsx
          {diffMin > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.55)' : 'var(--text-secondary)' }}>초과 시간</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#FF6B6B' : 'var(--brown)' }}>+{diffMin}분</span>
            </div>
          )}
```

변경:
```tsx
          {diffMin > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.55)' : 'var(--text-secondary)' }}>
                {isEarly ? '일찍 완료' : '초과 시간'}
              </span>
              <span style={{ fontSize: 15, fontWeight: 700, color: isEarly ? '#22C55E' : isDark ? '#FF6B6B' : 'var(--brown)' }}>
                {isEarly ? `-${diffMin}분` : `+${diffMin}분`}
              </span>
            </div>
          )}
```

- [ ] **Step 2: 일찍 완료 케이스 확인**

```bash
npm run dev
```

DevTools 콘솔에서 localStorage를 조작해서 테스트:
```javascript
// 콘솔에서 실행: goalEndTime을 30분 후로 설정한 active 세션 만들기
localStorage.setItem('yakunbbang_active', JSON.stringify({
  startTime: Date.now() - 60 * 60 * 1000,  // 1시간 전 시작
  goalEndTime: Date.now() + 30 * 60 * 1000  // 30분 후 목표
}))
```
페이지 새로고침 후 "빵 완성" 클릭 → 결과 화면에서 초과율이 음수, "일찍 완료 -N분" 표시되면 성공.

- [ ] **Step 3: 커밋**

```bash
cd /Users/winning/projects/yakunbbang
git add src/pages/ResultPage.tsx
git commit -m "feat: show early finish feedback with negative overrate and early completion time"
```

---

## Task 4: 타이머 간격 + App null 폴백 + ReportPage now 고정 수정

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/pages/ReportPage.tsx`

**해결 이슈:** 중간-3 (타이머 10초 어중간), 중간-8 (result 페이지 빈 화면), 중간-5 (ReportPage now 고정)

- [ ] **Step 1: HomePage.tsx 타이머 간격 60초로 변경**

`src/pages/HomePage.tsx`에서:

기존:
```tsx
    const interval = setInterval(update, 10000)
```

변경:
```tsx
    const interval = setInterval(update, 60000)
```

- [ ] **Step 2: App.tsx에 useEffect import 추가 + null 폴백 처리**

`src/App.tsx`에서 import를 변경한다:

기존:
```tsx
import { useState } from 'react'
```

변경:
```tsx
import { useState, useEffect } from 'react'
```

`App` 컴포넌트 내부에서 `handleResult` 함수 아래에 아래 useEffect를 추가한다:

```tsx
  // result 페이지인데 lastSession이 없으면 home으로 복귀
  useEffect(() => {
    if (page === 'result' && !lastSession) {
      setPage('home')
    }
  }, [page, lastSession])
```

- [ ] **Step 3: ReportPage.tsx에서 now를 매 렌더마다 fresh하게 계산**

`src/pages/ReportPage.tsx`에서 아래 줄을 제거한다:

기존 (컴포넌트 최상단):
```tsx
  const now = new Date()
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
```

변경:
```tsx
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1)
```

`nextMonth` 함수를 변경한다:

기존:
```tsx
  function nextMonth() {
    const isCurrent = selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1
    if (isCurrent) return
    if (selectedMonth === 12) { setSelectedYear(y => y + 1); setSelectedMonth(1) }
    else setSelectedMonth(m => m + 1)
  }
```

변경:
```tsx
  function nextMonth() {
    const n = new Date()
    const isCur = selectedYear === n.getFullYear() && selectedMonth === n.getMonth() + 1
    if (isCur) return
    if (selectedMonth === 12) { setSelectedYear(y => y + 1); setSelectedMonth(1) }
    else setSelectedMonth(m => m + 1)
  }
```

`isCurrent` 계산을 변경한다:

기존:
```tsx
  const isCurrent = selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1
```

변경:
```tsx
  const isCurrent = (() => { const n = new Date(); return selectedYear === n.getFullYear() && selectedMonth === n.getMonth() + 1 })()
```

- [ ] **Step 4: 커밋**

```bash
cd /Users/winning/projects/yakunbbang
git add src/pages/HomePage.tsx src/App.tsx src/pages/ReportPage.tsx
git commit -m "fix: timer 60s interval, guard result page null session, fix stale now in ReportPage"
```

---

## Task 5: OvenList 날짜 파싱 타임존 보정

**Files:**
- Modify: `src/components/OvenList.tsx`

**해결 이슈:** 중간-1 (날짜 문자열 UTC 파싱으로 요일/날짜 하루 어긋남)

- [ ] **Step 1: formatDate 함수에서 날짜 파싱 방식 변경**

`src/components/OvenList.tsx`의 `formatDate` 함수를 변경한다:

기존:
```tsx
function formatDate(dateStr: string): string {
  // 'YYYY-MM-DD' → 'MM/DD (요일)'
  const d = new Date(dateStr)
```

변경:
```tsx
function formatDate(dateStr: string): string {
  // 'YYYY-MM-DD' → 'MM/DD (요일)'
  // 'T00:00:00' 붙여서 로컬 자정으로 파싱 (UTC 기준 파싱 시 타임존 오프셋으로 하루 어긋남 방지)
  const d = new Date(dateStr + 'T00:00:00')
```

- [ ] **Step 2: 커밋**

```bash
cd /Users/winning/projects/yakunbbang
git add src/components/OvenList.tsx
git commit -m "fix: parse date string as local midnight to prevent timezone off-by-one day"
```

---

## Task 6: 데드 코드 제거

**Files:**
- Delete: `src/components/ShareCard.tsx`
- Delete: `src/components/TimeInput.tsx`

**해결 이슈:** 중간-6 (ShareCard 미사용), 낮음-5 (TimeInput 미사용)

- [ ] **Step 1: 두 파일이 실제로 import되지 않는지 확인**

```bash
cd /Users/winning/projects/yakunbbang
grep -r "ShareCard\|TimeInput" src/
```

출력이 정의 파일 자체(ShareCard.tsx, TimeInput.tsx)만 나오고 import 사용처가 없으면 삭제 진행.

- [ ] **Step 2: 파일 삭제**

```bash
rm src/components/ShareCard.tsx
rm src/components/TimeInput.tsx
```

- [ ] **Step 3: 빌드 오류 없는지 확인**

```bash
npm run build 2>&1 | tail -10
```

오류 없이 빌드 완료되면 성공.

- [ ] **Step 4: 커밋**

```bash
cd /Users/winning/projects/yakunbbang
git add -A
git commit -m "chore: remove unused ShareCard and TimeInput dead code"
```

---

## Task 7: 분 단위 5분으로 개선

**Files:**
- Modify: `src/pages/HomePage.tsx`

**해결 이슈:** 낮음-6 (분 선택 10분 단위로 정확한 목표 시간 설정 불가)

- [ ] **Step 1: 분 선택 옵션을 5분 단위로 변경**

`src/pages/HomePage.tsx`에서:

기존:
```tsx
              {[0, 10, 20, 30, 40, 50].map(m => (
```

변경:
```tsx
              {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
```

- [ ] **Step 2: minute 초기값 0이 여전히 유효한지 확인**

기존 `const [minute, setMinute] = useState(0)` — 0은 새 옵션 목록에 포함되어 있으므로 그대로 유지.

- [ ] **Step 3: 커밋**

```bash
cd /Users/winning/projects/yakunbbang
git add src/pages/HomePage.tsx
git commit -m "feat: increase goal time minute granularity from 10min to 5min"
```

---

## 최종 확인

- [ ] **전체 빌드 성공 확인**

```bash
cd /Users/winning/projects/yakunbbang
npm run build 2>&1 | tail -10
```

오류 없이 `dist/` 생성되면 성공.

- [ ] **전체 플로우 수동 테스트**

```bash
npm run dev
```

1. **정상 플로우:** 목표 시간 설정 → 빵 굽기 시작 → 새로고침 → 세션 복원 확인 → 빵 완성 → 결과 확인 → 오븐 확인 → 월간 리포트 확인
2. **자정 보정:** 현재보다 이전 시간 선택 시 날짜 레이블이 자동으로 "내일"로 변경되는지 확인
3. **오픈 이슈 (미구현 — 별도 작업 필요):**
   - 빵 이미지/아이콘 디자인 리소스 (PRD 오픈 이슈)
   - 앱인토스 SDK 연동 (PRD 오픈 이슈)
   - 브라우저 뒤로가기 (앱인토스 환경에서는 불필요할 수 있음)
   - 세션 삭제/수정 기능 (MVP 범위 외)
   - html2canvas 이모지 깨짐 (OS 의존, 대안 라이브러리 검토 필요)
