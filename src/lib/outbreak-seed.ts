import type {
  AuthorityContact,
  DiseaseCluster,
  OutbreakAlertState,
  OutbreakChartData,
} from "@/types/outbreak"

export const OUTBREAK_ALERT: OutbreakAlertState = {
  active: true,
  disease: "Typhoid",
  casesInWindow: 12,
  threshold: 8,
  windowLabel: "last 6 hours",
  primaryWard: "Ward A",
}

export const OUTBREAK_METRICS = {
  totalActiveCases: 47,
  topDisease: "Typhoid",
  newCasesLast6h: 12,
  riskLevel: "critical" as const,
}

export const OUTBREAK_CHART: OutbreakChartData = {
  hourLabels: ["-6h", "-5h", "-4h", "-3h", "-2h", "-1h", "Now"],
  series: [
    {
      id: "typhoid",
      label: "Typhoid",
      color: "#dc2626",
      values: [2, 3, 4, 5, 7, 9, 12],
    },
    {
      id: "dengue",
      label: "Dengue",
      color: "#2563eb",
      values: [5, 5, 6, 5, 6, 6, 5],
    },
    {
      id: "influenza",
      label: "Influenza",
      color: "#7c3aed",
      values: [3, 3, 4, 4, 4, 5, 4],
    },
  ],
}

export const OUTBREAK_CLUSTERS: DiseaseCluster[] = [
  {
    id: "c1",
    disease: "Typhoid",
    cases: 12,
    timeWindow: "Last 6h",
    ward: "Ward A",
    risk: "critical",
  },
  {
    id: "c2",
    disease: "Typhoid",
    cases: 4,
    timeWindow: "Last 12h",
    ward: "Ward B",
    risk: "warning",
  },
  {
    id: "c3",
    disease: "Dengue",
    cases: 6,
    timeWindow: "Last 6h",
    ward: "Emergency",
    risk: "warning",
  },
  {
    id: "c4",
    disease: "Influenza",
    cases: 8,
    timeWindow: "Last 24h",
    ward: "Ward A",
    risk: "safe",
  },
]

export const AUTHORITY_SEED: AuthorityContact[] = [
  {
    id: "bmc",
    shortName: "BMC",
    fullName: "Brihanmumbai Municipal Corporation",
    role: "Municipal health authority & epidemic response",
    channel: "Secure API · Email · SMS fallback",
    status: "ready",
  },
  {
    id: "fssai",
    shortName: "FSSAI",
    fullName: "Food Safety and Standards Authority of India",
    role: "Food-borne illness surveillance linkage",
    channel: "Regulatory reporting API",
    status: "ready",
  },
  {
    id: "local",
    shortName: "District PHO",
    fullName: "Local Health Department",
    role: "District public health officer network",
    channel: "Encrypted email · Direct line",
    status: "ready",
  },
  {
    id: "who",
    shortName: "WHO",
    fullName: "World Health Organization",
    role: "International health regulations (optional escalation)",
    channel: "IHR secure channel",
    status: "ready",
  },
]

export function buildDefaultOutreachMessage(
  alert: OutbreakAlertState
): string {
  if (!alert.active) {
    return "No active outbreak signal. Routine surveillance summary attached."
  }
  return `Alert: ${alert.casesInWindow} cases of ${alert.disease} detected within ${alert.windowLabel} in ${alert.primaryWard}. Threshold (${alert.threshold} cases) exceeded — possible outbreak. Immediate coordination requested.`
}
