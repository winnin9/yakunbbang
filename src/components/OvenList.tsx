// src/components/OvenList.tsx

import type { OvertimeSession } from '../types'
import { BREAD_SKIN_IMAGE } from '../types'
import { BREAD_LABEL } from '../utils/breadCalculator'

interface Props {
  sessions: OvertimeSession[]
  onDelete?: (id: string) => void
}

function formatDate(dateStr: string): string {
  // 'YYYY-MM-DD' → 'MM/DD (요일)'
  const d = new Date(dateStr + 'T00:00:00')
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const day = days[d.getDay()]
  return `${mm}/${dd} (${day})`
}

export function OvenList({ sessions, onDelete }: Props) {
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
            {/* 빵 이미지 썸네일 + 상태 뱃지 */}
            <div style={{ position: 'relative', width: 48, height: 48, marginRight: 14, flexShrink: 0 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: '#FDF3EE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
              }}>
                <img
                  src={BREAD_SKIN_IMAGE[s.breadSkin ?? 'shokupan'] ?? '/bread.png'}
                  alt="빵"
                  style={{ width: 34, height: 34, objectFit: 'contain' }}
                />
              </div>
              {/* 상태 이모지 뱃지 */}
              <div style={{
                position: 'absolute', bottom: -4, right: -4,
                width: 20, height: 20, borderRadius: 6,
                background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11,
              }}>
                {emoji}
              </div>
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

            {/* 삭제 버튼 */}
            {onDelete && (
              <button
                onClick={() => onDelete(s.id)}
                style={{
                  marginLeft: 8,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#CCC',
                  flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
