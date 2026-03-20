// src/pages/OvenPage.tsx

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
        <button onClick={onReport} style={{ background: 'none', border: 'none', fontSize: 14, color: '#ff6b35' }}>
          월간 리포트 →
        </button>
      </div>
      <div style={{ marginTop: 16 }}>
        <OvenList sessions={sessions} />
      </div>
      <button onClick={onHome} style={{ marginTop: 24, width: '100%', padding: 14, background: '#eee', border: 'none', borderRadius: 12, fontSize: 16 }}>
        🏠 홈으로
      </button>
    </div>
  )
}
