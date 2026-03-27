// src/components/OvenList.tsx

import type { OvertimeSession } from '../types'
import { BREAD_LABEL } from '../utils/breadCalculator'

interface Props {
  sessions: OvertimeSession[]
}

function formatDate(dateStr: string): string {
  // 'YYYY-MM-DD' → 'MM/DD (요일)'
  const d = new Date(dateStr)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const day = days[d.getDay()]
  return `${mm}/${dd} (${day})`
}

export function OvenList({ sessions }: Props) {
  if (sessions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <p style={{ fontSize: 40, marginBottom: 12 }}>🍞</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, fontWeight: 500 }}>
          아직 기록이 없어요
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 6, fontWeight: 400 }}>
          첫 번째 빵을 구워볼까요?
        </p>
      </div>
    )
  }

  const sorted = [...sessions].sort((a, b) => b.startTime - a.startTime)

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {sorted.map((s) => {
        const { emoji, label } = BREAD_LABEL[s.breadStatus]
        const isGood = s.overratePercent <= 0
        return (
          <li key={s.id} style={{
            display: 'flex', alignItems: 'center',
            padding: '14px 0',
            borderBottom: '1px solid var(--divider)',
          }}>
            {/* 빵 상태 이모지 */}
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginRight: 14, flexShrink: 0,
              fontSize: 26,
              boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
            }}>
              {emoji}
            </div>

            {/* 날짜 + 라벨 */}
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                {formatDate(s.date)}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2, fontWeight: 500 }}>
                {label}
              </p>
            </div>

            {/* 초과율 뱃지 */}
            <div style={{
              background: isGood ? '#ECFDF5' : 'var(--brown-light)',
              color: isGood ? '#16A34A' : 'var(--brown)',
              borderRadius: 100,
              padding: '4px 10px',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '-0.2px',
            }}>
              {s.overratePercent <= 0 ? '칼퇴 🎉' : `+${s.overratePercent}%`}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
