// src/components/BakerGrade.tsx

import { BAKER_GRADE_LABEL } from '../utils/bakerGrade'
import type { BakerGrade } from '../types'
import { colors } from '@toss/tds-colors'

interface Props {
  grade: BakerGrade | null
}

export function BakerGradeDisplay({ grade }: Props) {
  if (!grade) {
    return (
      <div style={{ textAlign: 'center', padding: 24, background: colors.grey50, borderRadius: 12 }}>
        <p>📊 아직 데이터가 부족해요</p>
        <p style={{ fontSize: 13, color: colors.grey400, marginTop: 4 }}>3회 이상 기록하면 등급이 나와요</p>
      </div>
    )
  }
  const { emoji, title, comment } = BAKER_GRADE_LABEL[grade]
  return (
    <div style={{ textAlign: 'center', padding: 24, background: '#fff8f0', borderRadius: 12 }}>
      <div style={{ fontSize: 64 }}>{emoji}</div>
      <h2 style={{ marginTop: 8 }}>{title}</h2>
      <p style={{ color: colors.grey600, marginTop: 4 }}>{comment}</p>
    </div>
  )
}
