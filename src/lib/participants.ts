import type { BedWithPatient, ParticipantListItem } from "@/types/bed"

/** Waiting / unassigned patients (no bed in mock / ED hold) — merged into the left panel. */
export const UNASSIGNED_PARTICIPANTS: ParticipantListItem[] = [
  {
    id: "unassigned-0003",
    patient_code: "P1012",
    full_name: "Kiran Bose",
    gender: "other",
    condition_category: "Observation — no bed yet",
    doctor_name: "Dr. S. Rao",
    bed_id: null,
    bed_code: null,
  },
]

function patientCode(p: {
  patient_code?: string | null
  id: string
}): string {
  if (p.patient_code?.trim()) return p.patient_code.trim()
  return `P${p.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`
}

export function participantsFromBeds(beds: BedWithPatient[]): ParticipantListItem[] {
  const assigned: ParticipantListItem[] = []
  for (const bed of beds) {
    if (!bed.patient) continue
    assigned.push({
      id: bed.patient.id,
      patient_code: patientCode(bed.patient),
      full_name: bed.patient.full_name,
      gender: bed.patient.gender ?? null,
      condition_category: bed.patient.condition_category,
      doctor_name: bed.patient.doctor_name,
      bed_id: bed.id,
      bed_code: bed.code,
    })
  }
  assigned.sort((a, b) => a.full_name.localeCompare(b.full_name))
  const unassigned = [...UNASSIGNED_PARTICIPANTS].sort((a, b) =>
    a.full_name.localeCompare(b.full_name)
  )
  return [...unassigned, ...assigned]
}

export function findBedIdForParticipant(
  participantId: string,
  beds: BedWithPatient[]
): string | null {
  for (const b of beds) {
    if (b.patient?.id === participantId) return b.id
  }
  return null
}

export function findParticipantIdForBed(
  bedId: string,
  beds: BedWithPatient[]
): string | null {
  const bed = beds.find((b) => b.id === bedId)
  return bed?.patient?.id ?? null
}
