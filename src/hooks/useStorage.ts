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
