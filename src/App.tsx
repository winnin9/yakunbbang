// src/App.tsx
import { useState } from 'react'
import { HomePage } from './pages/HomePage'
import { ResultPage } from './pages/ResultPage'
import { OvenPage } from './pages/OvenPage'
import { ReportPage } from './pages/ReportPage'
import type { OvertimeSession } from './types'

type Page = 'home' | 'result' | 'oven' | 'report'

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [lastSession, setLastSession] = useState<OvertimeSession | null>(null)

  function handleResult(session: OvertimeSession) {
    setLastSession(session)
    setPage('result')
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh' }}>
      {page === 'home' && <HomePage onResult={handleResult} onOven={() => setPage('oven')} />}
      {page === 'result' && lastSession && (
        <ResultPage
          session={lastSession}
          onOven={() => setPage('oven')}
          onHome={() => setPage('home')}
        />
      )}
      {page === 'oven' && (
        <OvenPage onHome={() => setPage('home')} onReport={() => setPage('report')} />
      )}
      {page === 'report' && <ReportPage onBack={() => setPage('oven')} />}
    </div>
  )
}
