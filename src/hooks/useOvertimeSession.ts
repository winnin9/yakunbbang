// src/hooks/useOvertimeSession.ts

import { useState } from 'react'
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

  function startSession(goalHour: number, goalMinute: number, dateOffset: number = 0): void {
    const now = Date.now()
    const goal = new Date(now)
    goal.setDate(goal.getDate() + dateOffset)
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

  function cancelSession(): void {
    setActive(null)
  }

  return { active, startSession, endSession, cancelSession }
}
