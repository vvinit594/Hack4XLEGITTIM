import type { FlowPatient } from "@/types/patient-flow"

const TWO_H_MS = 2 * 60 * 60 * 1000

export function isDischargeEscalated(p: FlowPatient): boolean {
  if (!p.discharge_ordered_at) return false
  return Date.now() - new Date(p.discharge_ordered_at).getTime() > TWO_H_MS
}

export function formatFlowTime(iso: string | null): string {
  if (!iso) return "—"
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso))
  } catch {
    return iso
  }
}
