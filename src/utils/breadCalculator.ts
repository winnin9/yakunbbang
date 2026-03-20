// src/utils/breadCalculator.ts

import type { BreadStatus } from '../types'

export function calcOverrate(
  startTime: number,
  goalEndTime: number,
  actualEndTime: number
): number {
  const planned = goalEndTime - startTime
  const overtime = actualEndTime - goalEndTime
  if (planned <= 0) return 0
  return Math.round((overtime / planned) * 100)
}

export function getBreadStatus(overratePercent: number): BreadStatus {
  if (overratePercent <= 0)  return 'perfect'
  if (overratePercent <= 20) return 'golden'
  if (overratePercent <= 40) return 'slight-burn'
  if (overratePercent <= 60) return 'burnt'
  if (overratePercent <= 80) return 'very-burnt'
  if (overratePercent <= 100) return 'charcoal'
  return 'ash'
}

export const BREAD_LABEL: Record<BreadStatus, { emoji: string; label: string; comment: string }> = {
  perfect:     { emoji: '🍞', label: '완성된 빵',        comment: '목표 달성! 오늘도 칼퇴!' },
  golden:      { emoji: '🟡', label: '노릇노릇한 빵',    comment: '살짝 늦었지만 괜찮아요.' },
  'slight-burn': { emoji: '🟠', label: '살짝 탄 빵',    comment: '조금 타고 있어요.' },
  burnt:       { emoji: '🟤', label: '많이 탄 빵',       comment: '많이 탔네요.' },
  'very-burnt': { emoji: '⬛', label: '심하게 탄 빵',    comment: '거의 숯이에요.' },
  charcoal:    { emoji: '💀', label: '새까맣게 탄 빵',   comment: '완전히 탔어요.' },
  ash:         { emoji: '☠️', label: '재가 된 빵',       comment: '목표의 2배 이상 야근이에요.' },
}
