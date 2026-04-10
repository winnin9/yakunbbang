// src/pages/ResultPage.tsx

import { share, getTossShareLink } from '@apps-in-toss/web-bridge'
import type { OvertimeSession } from '../types'
import { BREAD_LABEL } from '../utils/breadCalculator'

interface Props {
  session: OvertimeSession
  onOven: () => void
  onHome: () => void
}

const STATUS_BG: Record<string, string> = {
  perfect:      '#F0FFF4',
  golden:       '#FFFBEB',
  'slight-burn': '#FFF7ED',
  burnt:        '#FFF1E6',
  'very-burnt': '#F9FAFB',
  charcoal:     '#1F1F1F',
  ash:          '#111',
}

const STATUS_TEXT_COLOR: Record<string, string> = {
  perfect:      '#1A1A1A',
  golden:       '#1A1A1A',
  'slight-burn': '#1A1A1A',
  burnt:        '#1A1A1A',
  'very-burnt': '#1A1A1A',
  charcoal:     '#FFFFFF',
  ash:          '#FFFFFF',
}

function isInTossWebView(): boolean {
  return typeof window !== 'undefined' && !!(window as any).__GRANITE_NATIVE_EMITTER
}

export function ResultPage({ session, onOven, onHome }: Props) {
  const { breadStatus, overratePercent, goalEndTime, actualEndTime } = session
  const { emoji, label, comment } = BREAD_LABEL[breadStatus]

  const bg = STATUS_BG[breadStatus] ?? 'var(--bg)'
  const textColor = STATUS_TEXT_COLOR[breadStatus] ?? 'var(--text-primary)'
  const isDark = breadStatus === 'charcoal' || breadStatus === 'ash'

  const goal = new Date(goalEndTime)
  const goalHH = String(goal.getHours()).padStart(2, '0')
  const goalMM = String(goal.getMinutes()).padStart(2, '0')

  const actual = new Date(actualEndTime)
  const actualHH = String(actual.getHours()).padStart(2, '0')
  const actualMM = String(actual.getMinutes()).padStart(2, '0')

  const diffMs = actualEndTime - goalEndTime
  const isEarly = diffMs < 0
  const diffMin = Math.round(Math.abs(diffMs) / 60000)

  async function handleShare() {
    const rateText = isEarly
      ? `-${Math.abs(overratePercent)}%`
      : overratePercent === 0 ? '딱 맞게' : `+${overratePercent}%`
    const timeText = diffMin > 0
      ? (isEarly ? `${diffMin}분 일찍 끝냈어요` : `${diffMin}분 초과했어요`)
      : '딱 맞게 끝냈어요'
    const message = `${emoji} 오늘 야근빵 구웠어요!\n결과: ${label} (${rateText})\n목표 ${goalHH}:${goalMM} → 실제 ${actualHH}:${actualMM}, ${timeText}\n\n야근빵으로 오늘 야근 기록해보세요 👇`

    if (isInTossWebView()) {
      try {
        const link = await getTossShareLink('intoss://yakunbbang')
        await share({ message: `${message}\n${link}` })
      } catch {
        await share({ message })
      }
    } else if (navigator.share) {
      await navigator.share({ text: message })
    } else {
      await navigator.clipboard.writeText(message)
      alert('클립보드에 복사됐어요!')
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      background: bg, transition: 'background 0.4s ease',
    }}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px 16px', gap: 0,
      }}>
        {/* 빵 이모지 */}
        <div style={{
          width: 160, height: 160,
          background: isDark ? 'rgba(255,255,255,0.08)' : '#fff',
          borderRadius: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 80,
          boxShadow: isDark ? '0 4px 32px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.08)',
          marginBottom: 28,
          animation: 'float 3.5s ease-in-out infinite',
        }}>
          {emoji}
        </div>

        {/* 라벨 + 코멘트 */}
        <p style={{
          fontSize: 22, fontWeight: 800,
          color: textColor,
          marginBottom: 8,
          letterSpacing: '-0.4px',
          textAlign: 'center',
        }}>
          {label}
        </p>
        <p style={{
          fontSize: 15, color: isDark ? 'rgba(255,255,255,0.65)' : 'var(--text-secondary)',
          marginBottom: 40, fontWeight: 500, textAlign: 'center',
        }}>
          {comment}
        </p>

        {/* 수치 카드 */}
        <div style={{
          width: '100%',
          background: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
          borderRadius: 20,
          padding: '20px 24px',
          boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.55)' : 'var(--text-secondary)' }}>초과율</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: overratePercent <= 0 ? '#22C55E' : isDark ? '#FF6B6B' : 'var(--brown)', letterSpacing: '-0.5px' }}>
              {overratePercent <= 0 ? '0%' : `+${overratePercent}%`}
            </span>
          </div>
          <div style={{ height: 1, background: isDark ? 'rgba(255,255,255,0.1)' : 'var(--divider)', marginBottom: 14 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.55)' : 'var(--text-secondary)' }}>목표 종료</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: textColor }}>{goalHH}:{goalMM}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: overratePercent > 0 ? 10 : 0 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.55)' : 'var(--text-secondary)' }}>실제 종료</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: textColor }}>{actualHH}:{actualMM}</span>
          </div>
          {diffMin > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.55)' : 'var(--text-secondary)' }}>
                {isEarly ? '일찍 완료' : '초과 시간'}
              </span>
              <span style={{ fontSize: 15, fontWeight: 700, color: isEarly ? '#22C55E' : isDark ? '#FF6B6B' : 'var(--brown)' }}>
                {isEarly ? `-${diffMin}분` : `+${diffMin}분`}
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '8px 24px 44px', display: 'flex', gap: 12 }}>
        <button
          className="btn"
          style={{
            flex: 1,
            background: isDark ? 'rgba(255,255,255,0.10)' : 'var(--cancel-bg)',
            color: isDark ? 'rgba(255,255,255,0.7)' : 'var(--text-primary)',
          }}
          onClick={onHome}
        >홈으로</button>
        <button className="btn btn-brown" style={{ flex: 1 }} onClick={onOven}>오븐 보기</button>
      </div>
    </div>
  )
}
