// src/pages/ResultPage.tsx

import { Button } from '@toss/tds-mobile'
import { colors } from '@toss/tds-colors'
import { BreadDisplay } from '../components/BreadDisplay'
import type { OvertimeSession } from '../types'

interface Props {
  session: OvertimeSession
  onOven: () => void
  onHome: () => void
}

export function ResultPage({ session, onOven, onHome }: Props) {
  const start = new Date(session.startTime)
  const end = new Date(session.actualEndTime)
  const goal = new Date(session.goalEndTime)

  return (
    <div style={{ padding: 24 }}>
      <BreadDisplay status={session.breadStatus} overratePercent={session.overratePercent} />
      <div style={{ marginTop: 24, background: colors.grey50, borderRadius: 12, padding: 16 }}>
        <p>🕐 시작: {start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
        <p>🎯 목표: {goal.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
        <p>🕙 종료: {end.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <Button variant="weak" size="large" onClick={onOven} style={{ flex: 1 }}>
          🗂️ 오븐 보기
        </Button>
        <Button variant="fill" size="large" onClick={onHome} style={{ flex: 1 }}>
          🏠 홈으로
        </Button>
      </div>
    </div>
  )
}
