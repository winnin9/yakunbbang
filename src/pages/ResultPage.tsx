// src/pages/ResultPage.tsx


import { colors } from '@toss/tds-colors'
import { BREAD_LABEL } from '../utils/breadCalculator'
import type { OvertimeSession } from '../types'

interface Props {
  session: OvertimeSession
  onOven: () => void
  onHome: () => void
}

export function ResultPage({ session, onOven, onHome }: Props) {
  const end = new Date(session.actualEndTime)
  const { emoji, label, comment } = BREAD_LABEL[session.breadStatus]

  const endHour = String(end.getHours()).padStart(2, '0')
  const endMinute = String(end.getMinutes()).padStart(2, '0')

  const pillStyle: React.CSSProperties = {
    background: colors.grey50,
    borderRadius: 100,
    padding: '10px 24px',
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.grey800,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: colors.white }}>
      <div style={{ flex: 1, padding: '32px 24px 16px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 'bold', color: colors.grey800, marginBottom: 24 }}>
          빵 완성! 🎉
        </h1>
        <div style={{
          width: '100%',
          aspectRatio: '1',
          background: colors.grey50,
          borderRadius: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}>
          <div style={{ fontSize: 80 }}>{emoji}</div>
          <p style={{ fontSize: 18, fontWeight: 'bold', color: colors.grey800 }}>{label}</p>
          <p style={{ fontSize: 14, color: colors.grey500 }}>{comment}</p>
        </div>
        <div style={{ marginTop: 24 }}>
          <p style={{ fontSize: 14, color: colors.grey500, marginBottom: 12 }}>실제 종료 시간</p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={pillStyle}>{endHour}</div>
            <span style={{ fontSize: 24, fontWeight: 'bold', color: colors.grey400 }}>:</span>
            <div style={pillStyle}>{endMinute}</div>
          </div>
          <p style={{ marginTop: 20, fontSize: 28, fontWeight: 'bold', color: colors.grey800 }}>
            초과율 {session.overratePercent}%
          </p>
        </div>
      </div>
      <div style={{ padding: '16px 24px 32px', display: 'flex', gap: 10 }}>
        <button
          onClick={onOven}
          style={{ flex: 1, background: colors.orange100, color: colors.orange500, border: 'none', borderRadius: 16, height: 56, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}
        >
          🗂️ 오븐 보기
        </button>
        <button
          onClick={onHome}
          style={{ flex: 1, background: colors.orange500, color: '#fff', border: 'none', borderRadius: 16, height: 56, fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}
        >
          🏠 홈으로
        </button>
      </div>
    </div>
  )
}
