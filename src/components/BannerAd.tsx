// src/components/BannerAd.tsx
// 앱인토스 배너 광고 컴포넌트
// 테스트 ID: ait-ad-test-banner-id
// 운영 ID: 앱인토스 콘솔 → 광고 → 광고 그룹에서 발급

import { useEffect, useRef } from 'react'
import { TossAds } from '@apps-in-toss/web-bridge'

const BANNER_AD_GROUP_ID = 'ait-ad-test-banner-id'

function isInTossWebView(): boolean {
  return typeof window !== 'undefined' && !!(window as any).__GRANITE_NATIVE_EMITTER
}

interface Props {
  style?: React.CSSProperties
}

export function BannerAd({ style }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isInTossWebView()) return
    if (!ref.current) return

    try {
      const { destroy } = TossAds.attachBanner(BANNER_AD_GROUP_ID, ref.current, {
        theme: 'auto',
      })
      return () => { destroy() }
    } catch {
      // 광고 로드 실패 시 무시
    }
  }, [])

  // 브라우저 개발환경에서는 placeholder 표시
  if (!isInTossWebView()) {
    return (
      <div style={{
        height: 60,
        background: '#F0F0F0',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}>
        <span style={{ fontSize: 12, color: '#999' }}>광고 영역 (토스앱에서만 노출)</span>
      </div>
    )
  }

  return <div ref={ref} style={{ width: '100%', ...style }} />
}
