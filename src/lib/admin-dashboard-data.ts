import type { WardSummary } from "@/components/admin/WardCard"

/** Demo wards for Admin View grid + analytics (aligned with overview stats). */
export const ADMIN_MOCK_WARDS: WardSummary[] = [
  {
    id: "1",
    name: "Ward A — General",
    occupancy: 82,
    totalBeds: 40,
    availableBeds: 7,
    alerts: 3,
    isCritical: false,
  },
  {
    id: "2",
    name: "Ward B — Post-op",
    occupancy: 94,
    totalBeds: 25,
    availableBeds: 1,
    alerts: 5,
    isCritical: true,
  },
  {
    id: "3",
    name: "Ward C — Emergency",
    occupancy: 68,
    totalBeds: 30,
    availableBeds: 10,
    alerts: 0,
    isCritical: false,
  },
  {
    id: "4",
    name: "Ward D — ICU",
    occupancy: 88,
    totalBeds: 12,
    availableBeds: 1,
    alerts: 2,
    isCritical: false,
  },
  {
    id: "5",
    name: "Ward E — Pediatric",
    occupancy: 42,
    totalBeds: 20,
    availableBeds: 12,
    alerts: 0,
    isCritical: false,
  },
  {
    id: "6",
    name: "Ward F — Maternity",
    occupancy: 78,
    totalBeds: 15,
    availableBeds: 3,
    alerts: 1,
    isCritical: false,
  },
]

/** Campus-level numbers shown in stat bar + utilization chart. */
export const ADMIN_CAMPUS_BEDS = {
  total: 245,
  occupied: 184,
  available: 61,
} as const

export function occupancyStatusColor(occupancyPct: number): string {
  if (occupancyPct >= 90) return "#ef4444"
  if (occupancyPct >= 80) return "#f59e0b"
  return "#22c55e"
}

export function shortWardLabel(name: string): string {
  const m = name.match(/^Ward\s+([A-Z])/i)
  return m ? `Ward ${m[1].toUpperCase()}` : name.split("—")[0]?.trim() ?? name
}
