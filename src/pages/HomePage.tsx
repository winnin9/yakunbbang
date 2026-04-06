// src/pages/HomePage.tsx

import { useState, useEffect } from 'react'
import { useOvertimeSession } from '../hooks/useOvertimeSession'
import type { OvertimeSession } from '../types'
import { BREAD_SKIN_IMAGE } from '../types'

const BREAD_SKINS = [
  { id: 'shokupan',   name: '식빵이' },
  { id: 'korone',     name: '초코소라빵' },
  { id: 'cream',      name: '슈크림' },
  { id: 'bun',        name: '버터번' },
  { id: 'baguette',   name: '바게트' },
  { id: 'bagel',      name: '베이글' },
  { id: 'sogeumbang', name: '소금빵' },
]

interface Props {
  onResult: (session: OvertimeSession) => void
  onOven: () => void
}

const pillStyle = (active: boolean): React.CSSProperties => ({
  border: `1.5px solid ${active ? 'var(--brown)' : '#D8D8D8'}`,
  borderRadius: 14,
  padding: '14px 0',
  fontFamily: 'inherit',
  fontSize: 20,
  fontWeight: 600,
  textAlign: 'center',
  background: active ? 'var(--brown-light)' : '#fff',
  color: active ? 'var(--brown)' : 'var(--text-primary)',
  cursor: 'pointer',
  flex: 1,
  outline: 'none',
  appearance: 'none' as const,
  transition: 'border-color 0.15s, background 0.15s, color 0.15s',
})

export function HomePage({ onResult, onOven }: Props) {
  const [dateOffset, setDateOffset] = useState(0)
  const [hour, setHour] = useState(22)
  const [minute, setMinute] = useState(0)
  const [activeField, setActiveField] = useState<'date' | 'hour' | 'minute'>('minute')
  const [elapsed, setElapsed] = useState(0)
  const [overMinutes, setOverMinutes] = useState(0)
  const [selectedSkin, setSelectedSkin] = useState('shokupan')
  const { active, startSession, endSession, cancelSession } = useOvertimeSession()

  function handleStart() {
    const now = new Date()
    const tentative = new Date(now)
    tentative.setDate(tentative.getDate() + dateOffset)
    tentative.setHours(hour, minute, 0, 0)
    // 목표 시간이 현재보다 이전이면 자동으로 +1일 보정
    const finalOffset = tentative.getTime() <= now.getTime() ? dateOffset + 1 : dateOffset
    startSession(hour, minute, finalOffset, selectedSkin)
  }

  useEffect(() => {
    if (!active) return
    const update = () => {
      setElapsed(Math.floor((Date.now() - active.startTime) / 60000))
      setOverMinutes(Math.floor((Date.now() - active.goalEndTime) / 60000))
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [active])

  function handleEnd() {
    const session = endSession()
    if (session) onResult(session)
  }

  if (active) {
    const goal = new Date(active.goalEndTime)
    const goalHH = String(goal.getHours()).padStart(2, '0')
    const goalMM = String(goal.getMinutes()).padStart(2, '0')
    const isOver = overMinutes > 0

    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px 24px 20px',
        }}>
          {/* 베이킹 중 — oven glow */}
          <div className="bread-card baking" style={{ marginBottom: 24 }}>
            <img
              src={BREAD_SKIN_IMAGE[active.breadSkin ?? 'shokupan']}
              alt="빵"
              style={{ width: '78%', height: '78%', objectFit: 'contain' }}
            />
          </div>

          <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 40, letterSpacing: '-0.1px' }}>
            {elapsed}분째 열심히 굽는중...
          </p>

          <div style={{
            width: '100%',
            background: isOver ? '#FFF1F1' : '#F0FDF4',
            borderRadius: 20,
            padding: '22px 24px',
            textAlign: 'center',
          }}>
            {isOver ? (
              <>
                <p style={{ fontSize: 28, fontWeight: 900, color: '#EF4444', letterSpacing: '-0.6px', marginBottom: 8 }}>
                  목표 시간 {overMinutes}분 초과 🔥
                </p>
                <p style={{ fontSize: 14, color: '#EF4444', fontWeight: 500, opacity: 0.7 }}>
                  목표 종료 {goalHH}:{goalMM} · 지금 당장 종료하세요!
                </p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 24, fontWeight: 800, color: '#16A34A', letterSpacing: '-0.5px', marginBottom: 8 }}>
                  아직 목표 시간 전이에요 ✅
                </p>
                <p style={{ fontSize: 14, color: '#16A34A', fontWeight: 500, opacity: 0.75 }}>
                  목표 종료 {goalHH}:{goalMM}
                </p>
              </>
            )}
          </div>
        </div>

        <div style={{ padding: '16px 24px 48px', display: 'flex', gap: 12 }}>
          <button className="btn btn-cancel" style={{ flex: 1 }} onClick={cancelSession}>취소</button>
          <button className="btn btn-brown" style={{ flex: 1 }} onClick={handleEnd}>빵 완성 🍞</button>
        </div>
      </div>
    )
  }

  // 현재 설정 기준으로 목표가 과거이면 실질적으로 내일로 표시
  const nowForLabel = new Date()
  const tentativeGoal = new Date(nowForLabel)
  tentativeGoal.setDate(tentativeGoal.getDate() + dateOffset)
  tentativeGoal.setHours(hour, minute, 0, 0)
  const effectiveDateOffset = tentativeGoal.getTime() <= nowForLabel.getTime() ? dateOffset + 1 : dateOffset
  const dateLabel = effectiveDateOffset === 0 ? '오늘' : '내일'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ flex: 1, padding: '56px 24px 20px' }}>

        {/* 오른쪽 상단 오븐 아이콘 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <button
            onClick={onOven}
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: '#EFEFEF', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
          </button>
        </div>

        {/* 빵 선택 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
          <div className="bread-card" style={{ marginBottom: 12 }}>
            <img
              src={BREAD_SKIN_IMAGE[selectedSkin]}
              alt={BREAD_SKINS.find(s => s.id === selectedSkin)?.name}
              style={{ width: '78%', height: '78%', objectFit: 'contain' }}
            />
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px', marginBottom: 16 }}>
            {BREAD_SKINS.find(s => s.id === selectedSkin)?.name}
          </p>
          {/* 스킨 피커 */}
          <div style={{
            display: 'flex', gap: 10, overflowX: 'auto', width: '100%',
            paddingBottom: 4,
            scrollbarWidth: 'none',
          }}>
            {BREAD_SKINS.map(skin => (
              <button
                key={skin.id}
                onClick={() => setSelectedSkin(skin.id)}
                style={{
                  flexShrink: 0,
                  width: 64, height: 64,
                  borderRadius: 16,
                  border: selectedSkin === skin.id ? '2.5px solid var(--brown)' : '2px solid #E8E8E8',
                  background: selectedSkin === skin.id ? 'var(--brown-light)' : '#F7F7F7',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <img
                  src={BREAD_SKIN_IMAGE[skin.id]}
                  alt={skin.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* 시간 설정 */}
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12, letterSpacing: '-0.1px', textTransform: 'uppercase' }}>
            목표 종료 시간
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { setDateOffset(d => d === 0 ? 1 : 0); setActiveField('date') }}
              style={{ ...pillStyle(activeField === 'date'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {dateLabel}
            </button>
            <select
              value={hour}
              onChange={e => setHour(Number(e.target.value))}
              onFocus={() => setActiveField('hour')}
              style={pillStyle(activeField === 'hour')}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2, '0')}</option>
              ))}
            </select>
            <select
              value={minute}
              onChange={e => setMinute(Number(e.target.value))}
              onFocus={() => setActiveField('minute')}
              style={pillStyle(activeField === 'minute')}
            >
              {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 24px 48px' }}>
        <button
          className="btn btn-brown"
          style={{ width: '100%' }}
          onClick={handleStart}
        >
          빵 굽기 시작 🍞
        </button>
      </div>
    </div>
  )
}
