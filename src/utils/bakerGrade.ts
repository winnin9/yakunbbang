// src/utils/bakerGrade.ts

import type { BakerGrade, OvertimeSession } from '../types'

export function calcBakerGrade(sessions: OvertimeSession[]): BakerGrade | null {
  if (sessions.length < 3) return null

  const goodCount = sessions.filter(
    (s) => s.overratePercent <= 20
  ).length
  const ratio = (goodCount / sessions.length) * 100

  if (ratio >= 90) return 'master'
  if (ratio >= 70) return 'skilled'
  if (ratio >= 50) return 'diligent'
  if (ratio >= 30) return 'smoky'
  return 'charcoal-pro'
}

export const BAKER_GRADE_LABEL: Record<BakerGrade, { emoji: string; title: string; comment: string }> = {
  master:       { emoji: '👨‍🍳', title: '전설의 제빵사',    comment: '야근계의 신화' },
  skilled:      { emoji: '🧑‍🍳', title: '믿음직한 제빵사',  comment: '안정적으로 잘 굽고 있어요' },
  diligent:     { emoji: '🍞',   title: '노력파 제빵사',    comment: '반은 잘 구웠어요' },
  smoky:        { emoji: '🟠',   title: '까맣게 타는 중',   comment: '목표 시간 재설정이 필요해요' },
  'charcoal-pro': { emoji: '☠️',   title: '야근 마왕',        comment: '퇴근이 뭔가요?' },
}
