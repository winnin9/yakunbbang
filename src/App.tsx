// src/App.tsx
import { useState, useEffect } from 'react'
import { HomePage } from './pages/HomePage'
import { ResultPage } from './pages/ResultPage'
import { OvenPage } from './pages/OvenPage'
import { ReportPage } from './pages/ReportPage'
import { initStorage } from './hooks/useStorage'
import type { OvertimeSession } from './types'

type Page = 'home' | 'result' | 'oven' | 'report'

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [lastSession, setLastSession] = useState<OvertimeSession | null>(null)

  // 앱 시작 시 Toss Storage → localStorage 복구
  useEffect(() => {
    initStorage()
  }, [])

  function handleResult(session: OvertimeSession) {
    setLastSession(session)
    setPage('result')
  }

  // result 페이지인데 lastSession이 없으면 home으로 복귀
  useEffect(() => {
    if (page === 'result' && !lastSession) {
      setPage('home')
    }
  }, [page, lastSession])

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
