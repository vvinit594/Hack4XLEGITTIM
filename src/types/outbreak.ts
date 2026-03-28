export type OutbreakRiskLevel = "safe" | "warning" | "critical"

export type AuthorityNotifyStatus = "ready" | "sent"

export type OutbreakAlertState = {
  active: boolean
  disease: string
  casesInWindow: number
  threshold: number
  windowLabel: string
  primaryWard: string
}

export type DiseaseCluster = {
  id: string
  disease: string
  cases: number
  timeWindow: string
  ward: string
  risk: OutbreakRiskLevel
}

export type AuthorityContact = {
  id: string
  shortName: string
  fullName: string
  role: string
  channel: string
  status: AuthorityNotifyStatus
}

export type ChartSeries = {
  id: string
  label: string
  color: string
  /** Normalized hourly counts (same length as labels) */
  values: number[]
}

export type OutbreakChartData = {
  hourLabels: string[]
  series: ChartSeries[]
}
