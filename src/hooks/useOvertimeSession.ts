// src/hooks/useOvertimeSession.ts

import { useState } from 'react'
import { calcOverrate, getBreadStatus } from '../utils/breadCalculator'
import { useSessions } from './useStorage'
import type { OvertimeSession } from '../types'

interface ActiveSession {
  startTime: number
  goalEndTime: number
  breadSkin?: string
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
      breadSkin: active.breadSkin ?? 'shokupan',
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
