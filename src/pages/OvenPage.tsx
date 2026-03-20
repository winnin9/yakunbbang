// src/pages/OvenPage.tsx

import { Button, TextButton } from '@toss/tds-mobile'
import { useSessions } from '../hooks/useStorage'
import { OvenList } from '../components/OvenList'

interface Props {
  onHome: () => void
  onReport: () => void
}

export function OvenPage({ onHome, onReport }: Props) {
  const { getSessions } = useSessions()
  const sessions = getSessions()

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🗂️ 오븐</h1>
        <TextButton size="small" onClick={onReport}>
          월간 리포트 →
        </TextButton>
      </div>
      <div style={{ marginTop: 16 }}>
        <OvenList sessions={sessions} />
      </div>
      <Button variant="weak" size="large" onClick={onHome} style={{ marginTop: 24, width: '100%' }}>
        🏠 홈으로
      </Button>
    </div>
  )
}
