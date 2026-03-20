// src/pages/ReportPage.tsx

import { useSessions } from '../hooks/useStorage'
import { calcBakerGrade } from '../utils/bakerGrade'
import { BakerGradeDisplay } from '../components/BakerGrade'
import { ShareCard } from '../components/ShareCard'

interface Props {
  onBack: () => void
}

export function ReportPage({ onBack }: Props) {
  const { getSessionsByMonth } = useSessions()
  // 이전 달 데이터를 표시 (PRD 7-5: 매월 1일 기준 이전 달 자동 집계)
  // now.getMonth()는 0-indexed라 1을 빼면 이전 달이 됨
  const now = new Date()
  const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
  const month = now.getMonth() === 0 ? 12 : now.getMonth() // getMonth()=0→12월, 나머지는 현재-1

  const sessions = getSessionsByMonth(year, month)
  const grade = calcBakerGrade(sessions)

  const goodCount = sessions.filter((s) => s.overratePercent <= 20).length
  const burntCount = sessions.length - goodCount

  return (
    <div style={{ padding: 24 }}>
      <h1>📊 {year}년 {month}월 리포트</h1>
      <p style={{ color: '#666', marginTop: 4 }}>총 {sessions.length}회 야근</p>
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <div style={{ flex: 1, padding: 16, background: '#f0fff4', borderRadius: 12, textAlign: 'center' }}>
          <p style={{ fontSize: 28, fontWeight: 'bold' }}>{goodCount}</p>
          <p style={{ fontSize: 13, color: '#666' }}>예쁜 빵 🍞🟡</p>
        </div>
        <div style={{ flex: 1, padding: 16, background: '#fff0f0', borderRadius: 12, textAlign: 'center' }}>
          <p style={{ fontSize: 28, fontWeight: 'bold' }}>{burntCount}</p>
          <p style={{ fontSize: 13, color: '#666' }}>탄 빵 🟠🟤⬛</p>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <BakerGradeDisplay grade={grade} />
      </div>
      <div style={{ marginTop: 16 }}>
        <ShareCard year={year} month={month} grade={grade} goodCount={goodCount} burntCount={burntCount} />
      </div>
      <button onClick={onBack} style={{ marginTop: 24, width: '100%', padding: 14, background: '#eee', border: 'none', borderRadius: 12, fontSize: 16 }}>
        ← 뒤로
      </button>
    </div>
  )
}
