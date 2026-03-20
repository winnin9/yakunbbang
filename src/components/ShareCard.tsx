// src/components/ShareCard.tsx
// html2canvas로 카드 이미지 생성 후 다운로드

import { useRef } from 'react'
import html2canvas from 'html2canvas'
import { BAKER_GRADE_LABEL } from '../utils/bakerGrade'
import type { BakerGrade } from '../types'

interface Props {
  year: number
  month: number
  grade: BakerGrade | null
  goodCount: number
  burntCount: number
}

export function ShareCard({ year, month, grade, goodCount, burntCount }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  async function handleShare() {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, { scale: 2 })
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `야근빵-${year}-${month}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    // ⚠️ 앱인토스 배포 시 Toss 공유 API로 교체: toss.share({ imageUrl: url })
  }

  const gradeInfo = grade ? BAKER_GRADE_LABEL[grade] : null

  return (
    <div>
      <div
        ref={cardRef}
        style={{
          width: 320, padding: 32, background: 'linear-gradient(135deg, #ff6b35, #ffd700)',
          borderRadius: 24, textAlign: 'center', color: '#fff'
        }}
      >
        <p style={{ fontSize: 13, opacity: 0.8 }}>🍞 야근빵</p>
        <p style={{ fontSize: 18, fontWeight: 'bold', marginTop: 4 }}>{year}년 {month}월</p>
        {gradeInfo && (
          <>
            <div style={{ fontSize: 64, marginTop: 16 }}>{gradeInfo.emoji}</div>
            <h2 style={{ marginTop: 8 }}>{gradeInfo.title}</h2>
          </>
        )}
        <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 20px' }}>
            <p style={{ fontSize: 24, fontWeight: 'bold' }}>{goodCount}</p>
            <p style={{ fontSize: 12 }}>예쁜 빵</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 20px' }}>
            <p style={{ fontSize: 24, fontWeight: 'bold' }}>{burntCount}</p>
            <p style={{ fontSize: 12 }}>탄 빵</p>
          </div>
        </div>
      </div>
      <button
        onClick={handleShare}
        style={{ marginTop: 16, width: '100%', padding: 14, background: '#ff6b35', color: '#fff', border: 'none', borderRadius: 12, fontSize: 16 }}
      >
        📤 공유 카드 저장
      </button>
    </div>
  )
}
