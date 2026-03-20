// src/pages/HomePage.tsx

import { useState, useEffect } from 'react'

import { colors } from '@toss/tds-colors'
import { useOvertimeSession } from '../hooks/useOvertimeSession'
import type { OvertimeSession } from '../types'

interface Props {
  onResult: (session: OvertimeSession) => void
}

const pillSelectStyle: React.CSSProperties = {
  appearance: 'none',
  border: `1.5px solid ${colors.grey200}`,
  borderRadius: 100,
  padding: '10px 20px',
  fontSize: 28,
  fontWeight: 'bold',
  textAlign: 'center',
  background: colors.white,
  color: colors.grey800,
  width: 90,
  cursor: 'pointer',
}

export function HomePage({ onResult }: Props) {
  const [hour, setHour] = useState(22)
  const [minute, setMinute] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const { active, startSession, endSession } = useOvertimeSession()

  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - active.startTime) / 60000))
    }, 10000)
    setElapsed(Math.floor((Date.now() - active.startTime) / 60000))
    return () => clearInterval(interval)
  }, [active])

  function handleEnd() {
    const session = endSession()
    if (session) onResult(session)
  }

  if (active) {
    const goal = new Date(active.goalEndTime)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: colors.white }}>
        <div style={{ flex: 1, padding: '32px 24px 16px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 'bold', color: colors.grey800, marginBottom: 24 }}>
            {elapsed}분째 빵 굽는 중...🔥
          </h1>
          <div style={{
            width: '100%',
            aspectRatio: '1',
            background: colors.grey50,
            borderRadius: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 96,
          }}>
            🍞
          </div>
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: colors.grey500, marginBottom: 8 }}>목표 종료 시간</p>
            <p style={{ fontSize: 28, fontWeight: 'bold', color: colors.grey800 }}>
              {goal.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div style={{ padding: '16px 24px 32px' }}>
          <button
            onClick={handleEnd}
            style={{ width: '100%', background: colors.orange500, color: '#fff', border: 'none', borderRadius: 16, height: 56, fontSize: 17, fontWeight: 'bold', cursor: 'pointer' }}
          >
            빵 완성 🧀
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: colors.white }}>
      <div style={{ flex: 1, padding: '32px 24px 16px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 'bold', color: colors.grey800, marginBottom: 24 }}>
          오늘의 야근빵 굽기 🍞
        </h1>
        <div style={{
          width: '100%',
          aspectRatio: '1',
          background: colors.grey50,
          borderRadius: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 96,
        }}>
          🍞
        </div>
        <div style={{ marginTop: 32 }}>
          <p style={{ fontSize: 15, fontWeight: '600', color: colors.grey700, marginBottom: 16 }}>
            오늘 목표 종료 시간?
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <select
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              style={pillSelectStyle}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
              ))}
            </select>
            <span style={{ fontSize: 24, fontWeight: 'bold', color: colors.grey400 }}>:</span>
            <select
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
              style={pillSelectStyle}
            >
              {[0, 10, 20, 30, 40, 50].map((m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div style={{ padding: '16px 24px 32px' }}>
        <button
          onClick={() => startSession(hour, minute)}
          style={{ width: '100%', background: colors.orange500, color: '#fff', border: 'none', borderRadius: 16, height: 56, fontSize: 17, fontWeight: 'bold', cursor: 'pointer' }}
        >
          빵 굽기 시작 🔥
        </button>
      </div>
    </div>
  )
}
