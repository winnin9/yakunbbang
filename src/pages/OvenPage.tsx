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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ flex: 1, padding: '56px 24px 16px' }}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button
            onClick={onHome}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#EFEFEF', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>내 오븐</h1>
          <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
            {sessions.length}개
          </span>
        </div>

        <OvenList sessions={sessions} />
      </div>

      <div style={{ padding: '16px 24px 48px' }}>
        <button className="btn btn-brown" style={{ width: '100%' }} onClick={onReport}>
          월별 리포트 보기
        </button>
      </div>
    </div>
  )
}
