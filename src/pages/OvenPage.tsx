// src/pages/OvenPage.tsx


import { colors } from '@toss/tds-colors'
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: colors.white }}>
      <div style={{ flex: 1, padding: '32px 24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <button
            onClick={onHome}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 20, color: colors.grey800 }}
          >
            ←
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 'bold', color: colors.grey800 }}>내 오븐</h1>
        </div>
        <OvenList sessions={sessions} />
      </div>
      <div style={{ padding: '16px 24px 32px' }}>
        <button
          onClick={onReport}
          style={{ width: '100%', background: colors.orange500, color: '#fff', border: 'none', borderRadius: 16, height: 56, fontSize: 17, fontWeight: 'bold', cursor: 'pointer' }}
        >
          이번 달 리포트 보기
        </button>
      </div>
    </div>
  )
}
