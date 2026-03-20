// src/types/index.ts

export type BreadStatus =
  | 'perfect'      // 0%: 완성된 빵 🍞
  | 'golden'       // 1~20%: 노릇노릇한 빵 🟡
  | 'slight-burn'  // 21~40%: 살짝 탄 빵 🟠
  | 'burnt'        // 41~60%: 많이 탄 빵 🟤
  | 'very-burnt'   // 61~80%: 심하게 탄 빵 ⬛
  | 'charcoal'     // 81~100%: 새까맣게 탄 빵 💀
  | 'ash'          // 100% 초과: 재가 된 빵 ☠️

export type BakerGrade =
  | 'master'       // 90% 이상: 👨‍🍳 마스터 제빵사
  | 'skilled'      // 70~89%: 🧑‍🍳 실력파 제빵사
  | 'diligent'     // 50~69%: 🍞 성실한 제빵사
  | 'smoky'        // 30~49%: 🟠 탄내나는 제빵사
  | 'charcoal-pro' // 30% 미만: ☠️ 숯 전문가

export interface OvertimeSession {
  id: string
  date: string          // 'YYYY-MM-DD'
  startTime: number     // Unix timestamp (ms)
  goalEndTime: number   // Unix timestamp (ms)
  actualEndTime: number // Unix timestamp (ms)
  overratePercent: number
  breadStatus: BreadStatus
}
