export interface PerformanceRecord {
  id: string
  year: number
  quarter: number // 1~4
  division: string // 사업부문
  metric: string // 지표명
  target: number // 목표
  actual: number // 실적
  unit: string // 단위 (억원, %, 건)
  created_at: string
  updated_at: string
}

export type Quarter = 1 | 2 | 3 | 4

export interface KPISummary {
  label: string
  value: number
  target: number
  unit: string
  trend: number // percent change from previous period
}

export interface HeatmapCell {
  division: string
  metric: string
  achievement: number // actual/target * 100
}
