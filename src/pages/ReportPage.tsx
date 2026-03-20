// src/pages/ReportPage.tsx

import { useRef } from 'react'

import { colors } from '@toss/tds-colors'
import { useSessions } from '../hooks/useStorage'
import { calcBakerGrade } from '../utils/bakerGrade'
import { BakerGradeDisplay } from '../components/BakerGrade'
import { ShareCard } from '../components/ShareCard'
import type { ShareCardHandle } from '../components/ShareCard'

interface Props {
  onBack: () => void
}

export function ReportPage({ onBack }: Props) {
  const shareRef = useRef<ShareCardHandle>(null)
  const { getSessionsByMonth } = useSessions()

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // getMonth()는 0-indexed, +1로 현재 달

  const sessions = getSessionsByMonth(year, month)
  const grade = calcBakerGrade(sessions)

  const goodCount = sessions.filter((s) => s.overratePercent <= 20).length
  const burntCount = sessions.length - goodCount

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: colors.white }}>
      <div style={{ flex: 1, padding: '32px 24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 20, color: colors.grey800 }}
          >
            ←
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 'bold', color: colors.grey800 }}>
            {year}.{String(month).padStart(2, '0')} 리포트
          </h1>
        </div>

        <p style={{ color: colors.grey500, fontSize: 14, marginBottom: 16 }}>총 {sessions.length}회 야근</p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <div style={{ flex: 1, padding: 16, background: '#f0fff4', borderRadius: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontWeight: 'bold', color: colors.grey800 }}>{goodCount}</p>
            <p style={{ fontSize: 13, color: colors.grey500, marginTop: 4 }}>예쁜 빵 🍞🟡</p>
          </div>
          <div style={{ flex: 1, padding: 16, background: '#fff0f0', borderRadius: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 28, fontWeight: 'bold', color: colors.grey800 }}>{burntCount}</p>
            <p style={{ fontSize: 13, color: colors.grey500, marginTop: 4 }}>탄 빵 🟠🟤⬛</p>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <BakerGradeDisplay grade={grade} />
        </div>

        <ShareCard
          ref={shareRef}
          year={year}
          month={month}
          grade={grade}
          goodCount={goodCount}
          burntCount={burntCount}
        />
      </div>

      <div style={{ padding: '16px 24px 32px' }}>
        <button
          onClick={() => shareRef.current?.save()}
          style={{ width: '100%', background: colors.orange500, color: '#fff', border: 'none', borderRadius: 16, height: 56, fontSize: 17, fontWeight: 'bold', cursor: 'pointer' }}
        >
          📤 리포트 저장
        </button>
      </div>
    </div>
  )
}
