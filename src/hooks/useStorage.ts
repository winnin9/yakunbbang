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
