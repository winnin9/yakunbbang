// src/App.tsx
import { useState } from 'react'
import { HomePage } from './pages/HomePage'
import type { OvertimeSession } from './types'

export default function App() {
  const [result, setResult] = useState<OvertimeSession | null>(null)

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh' }}>
      <HomePage onResult={setResult} />
      {result && <pre style={{ padding: 16, fontSize: 12 }}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}
