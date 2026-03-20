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
