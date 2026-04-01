// src/pages/ReportPage.tsx

import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { useSessions } from '../hooks/useStorage'
import { calcBakerGrade, BAKER_GRADE_LABEL } from '../utils/bakerGrade'

const BackIcon = () => (
  <img src="/back.png" width="24" height="24" alt="back" style={{ display: 'block' }} />
)

interface Props {
  onBack: () => void
}

export function ReportPage({ onBack }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const { getSessionsByMonth } = useSessions()

  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1)

  function prevMonth() {
    if (selectedMonth === 1) { setSelectedYear(y => y - 1); setSelectedMonth(12) }
    else setSelectedMonth(m => m - 1)
  }

  function nextMonth() {
    const n = new Date()
    const isCur = selectedYear === n.getFullYear() && selectedMonth === n.getMonth() + 1
    if (isCur) return
    if (selectedMonth === 12) { setSelectedYear(y => y + 1); setSelectedMonth(1) }
    else setSelectedMonth(m => m + 1)
  }

  async function handleSave() {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: null })
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `야근빵-${selectedYear}-${String(selectedMonth).padStart(2, '0')}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const sessions = getSessionsByMonth(selectedYear, selectedMonth)
  const grade = calcBakerGrade(sessions)
  const gradeInfo = grade ? BAKER_GRADE_LABEL[grade] : null
  const goodCount = sessions.filter(s => s.overratePercent <= 20).length
  const burntCount = sessions.length - goodCount
  const isCurrent = (() => { const n = new Date(); return selectedYear === n.getFullYear() && selectedMonth === n.getMonth() + 1 })()
  const yy = String(selectedYear).slice(2)

  // 평균 초과율
  const avgOverrate = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + Math.max(0, s.overratePercent), 0) / sessions.length)
    : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ flex: 1, padding: '52px 24px 16px' }}>

        {/* 헤더 */}
        <div style={{ marginBottom: 28 }}>
          {/* 뒤로가기 */}
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <BackIcon />
          </button>
          {/* 월 내비게이션 */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: 'var(--text-secondary)', padding: '0 8px 0 0', lineHeight: 1 }}>‹</button>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', flex: 1, textAlign: 'center', letterSpacing: '-0.4px' }}>
              {selectedYear}년 {selectedMonth}월
            </h1>
            <button
              onClick={nextMonth}
              style={{ background: 'none', border: 'none', cursor: isCurrent ? 'default' : 'pointer', fontSize: 24, color: isCurrent ? '#D0D0D0' : 'var(--text-secondary)', padding: '0 0 0 8px', lineHeight: 1 }}
            >›</button>
          </div>
        </div>

        {/* 캡처 대상 카드 */}
        <div ref={cardRef} style={{ background: '#FDF3EE', borderRadius: 24, padding: 24 }}>
          {/* 배지 */}
          <div style={{ display: 'inline-block', background: 'var(--brown-dark)', borderRadius: 100, padding: '6px 14px', marginBottom: 18 }}>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '-0.1px' }}>
              {yy}년 {selectedMonth}월 야근 리포트
            </span>
          </div>

          {/* 등급 타이틀 */}
          <div style={{ marginBottom: 22 }}>
            {gradeInfo ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 48 }}>{gradeInfo.emoji}</span>
                <div>
                  <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.6px', lineHeight: 1.2 }}>
                    {gradeInfo.title}
                  </h2>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 500 }}>
                    {gradeInfo.comment}
                  </p>
                </div>
              </div>
            ) : (
              <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.4, letterSpacing: '-0.5px' }}>
                {sessions.length === 0
                  ? '이달 기록이 없어요 🍞'
                  : `기록 ${sessions.length}개 — 3개 이상이면 등급이 생겨요`}
              </h2>
            )}
          </div>

          {/* 잘 만든 빵 / 탄 빵 */}
          <div style={{ display: 'flex', gap: 10, marginBottom: sessions.length > 0 ? 10 : 0 }}>
            <div style={{ flex: 1, background: 'var(--brown)', borderRadius: 16, padding: '16px 14px' }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 8, fontWeight: 600 }}>잘 만든 빵</p>
              <p style={{ fontSize: 18, marginBottom: 8 }}>🍞🟡</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{goodCount}</p>
            </div>
            <div style={{ flex: 1, background: 'var(--brown-dark)', borderRadius: 16, padding: '16px 14px' }}>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 8, fontWeight: 600 }}>탄 빵</p>
              <p style={{ fontSize: 18, marginBottom: 8 }}>🟠🟤⬛</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>{burntCount}</p>
            </div>
          </div>

          {/* 평균 초과율 */}
          {sessions.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>평균 초과율</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: avgOverrate === 0 ? '#22C55E' : 'var(--brown)', letterSpacing: '-0.4px' }}>
                {avgOverrate === 0 ? '0% 🎉' : `+${avgOverrate}%`}
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '16px 24px 44px' }}>
        <button className="btn btn-brown" style={{ width: '100%' }} onClick={handleSave}>
          리포트 이미지 저장
        </button>
      </div>
    </div>
  )
}
