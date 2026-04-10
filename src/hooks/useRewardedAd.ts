// src/hooks/useRewardedAd.ts
// 보상형(Rewarded) 전면 광고 훅
// 테스트 ID: ait-ad-test-rewarded-id
// 운영 ID: 앱인토스 콘솔 → 광고 → 광고 그룹에서 발급

import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-bridge'

const AD_GROUP_ID = 'ait-ad-test-rewarded-id'

function isInTossWebView(): boolean {
  return typeof window !== 'undefined' && !!(window as any).__GRANITE_NATIVE_EMITTER
}

export function useRewardedAd() {
  /**
   * 보상형 광고를 로드하고 표시해요.
   * - Toss WebView: 실제 광고 시청 후 onRewarded 콜백 호출
   * - 브라우저 개발환경: 광고 없이 즉시 onRewarded 호출 (개발 편의)
   */
  function showRewardedAd({
    onRewarded,
    onCancel,
    onError,
  }: {
    onRewarded: () => void
    onCancel?: () => void
    onError?: () => void
  }): void {
    if (!isInTossWebView()) {
      // 브라우저 개발환경: 광고 없이 바로 보상
      onRewarded()
      return
    }

    const unsubscribeLoad = loadFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: () => {
        // 광고 로드 완료 → 즉시 표시
        unsubscribeLoad()
        showFullScreenAd({
          options: { adGroupId: AD_GROUP_ID },
          onEvent: (e) => {
            if (e.type === 'userEarnedReward') {
              onRewarded()
            } else if (e.type === 'dismissed') {
              onCancel?.()
            }
          },
          onError: () => onError?.(),
        })
      },
      onError: () => onError?.(),
    })
  }

  return { showRewardedAd }
}
