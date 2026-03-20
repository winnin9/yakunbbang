// src/components/BreadDisplay.tsx

import { BREAD_LABEL } from '../utils/breadCalculator'
import type { BreadStatus } from '../types'

interface Props {
  status: BreadStatus
  overratePercent: number
}

export function BreadDisplay({ status, overratePercent }: Props) {
  const { emoji, label, comment } = BREAD_LABEL[status]
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 80 }}>{emoji}</div>
      <h2 style={{ marginTop: 8 }}>{label}</h2>
      <p style={{ color: '#666' }}>{comment}</p>
      <p style={{ marginTop: 12, fontSize: 28, fontWeight: 'bold' }}>
        초과율 {overratePercent}%
      </p>
    </div>
  )
}
