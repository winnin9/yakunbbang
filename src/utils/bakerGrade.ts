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
  master:       { emoji: '👨‍🍳', title: '마스터 제빵사',    comment: '야근도 내 손 안에' },
  skilled:      { emoji: '🧑‍🍳', title: '실력파 제빵사',    comment: '꽤 잘 구웠어요' },
  diligent:     { emoji: '🍞',   title: '성실한 제빵사',    comment: '분전하고 있어요' },
  smoky:        { emoji: '🟠',   title: '탄내나는 제빵사',  comment: '오븐 온도 점검 필요' },
  'charcoal-pro': { emoji: '☠️', title: '숯 전문가',        comment: '이달 오븐이 너무 뜨거웠어요' },
}
