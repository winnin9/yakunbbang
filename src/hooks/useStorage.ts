// src/hooks/useStorage.ts
// Toss WebView 환경에서는 Toss Storage API를 localStorage와 함께 미러링해요.
// 브라우저 개발 환경에서는 localStorage만 사용해요.

import { Storage as TossStorage } from '@apps-in-toss/web-bridge'
import type { OvertimeSession } from '../types'

const STORAGE_KEY = 'yakunbbang_sessions'
const ACTIVE_KEY = 'yakunbbang_active'

/** Toss WebView 환경인지 감지 */
function isInTossWebView(): boolean {
  return typeof window !== 'undefined' && !!(window as any).__GRANITE_NATIVE_EMITTER
}

/** Toss Storage에 비동기 미러링 (fire-and-forget) */
function tossSet(key: string, value: string): void {
  if (!isInTossWebView()) return
  TossStorage.setItem(key, value).catch(() => {})
}

function tossRemove(key: string): void {
  if (!isInTossWebView()) return
  TossStorage.removeItem(key).catch(() => {})
}

export interface ActiveSession {
  startTime: number
  goalEndTime: number
  breadSkin?: string
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
      const serialized = JSON.stringify(sessions)
      localStorage.setItem(STORAGE_KEY, serialized)
      tossSet(STORAGE_KEY, serialized)
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
        tossRemove(ACTIVE_KEY)
      } else {
        const serialized = JSON.stringify(active)
        localStorage.setItem(ACTIVE_KEY, serialized)
        tossSet(ACTIVE_KEY, serialized)
      }
    } catch {
      // 저장 실패 시 무시
    }
  }

  return { getSessions, saveSession, getSessionsByMonth, getActiveSession, saveActiveSession }
}
