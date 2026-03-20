// src/components/OvenList.tsx

import { BREAD_LABEL } from '../utils/breadCalculator'
import type { OvertimeSession } from '../types'

interface Props {
  sessions: OvertimeSession[]
}

export function OvenList({ sessions }: Props) {
  if (sessions.length === 0) {
    return <p style={{ color: '#999', textAlign: 'center', padding: 32 }}>아직 기록이 없어요 🍞</p>
  }

  const sorted = [...sessions].sort((a, b) => b.startTime - a.startTime)

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {sorted.map((s) => {
        const { emoji, label } = BREAD_LABEL[s.breadStatus]
        return (
          <li key={s.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontSize: 32, marginRight: 12 }}>{emoji}</span>
            <div>
              <p style={{ fontWeight: 'bold' }}>{s.date}</p>
              <p style={{ color: '#666', fontSize: 14 }}>{label} · 초과율 {s.overratePercent}%</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
