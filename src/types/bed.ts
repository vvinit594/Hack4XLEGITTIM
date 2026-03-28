export type BedStatus = "available" | "occupied" | "cleaning" | "reserved"

export type PatientGender = "male" | "female" | "other" | null

export type PatientRow = {
  id: string
  bed_id: string
  full_name: string
  patient_code?: string | null
  gender?: PatientGender
  admission_date: string | null
  condition_category: string | null
  doctor_name: string | null
}

/** Flattened row for the participant sidebar (assigned + unassigned). */
export type ParticipantListItem = {
  id: string
  patient_code: string
  full_name: string
  gender: PatientGender
  condition_category: string | null
  doctor_name: string | null
  bed_id: string | null
  bed_code: string | null
}

export type BedWithPatient = {
  id: string
  code: string
  status: BedStatus
  status_note?: string | null
  patient: PatientRow | null
}

export type BedsRealtimeStatus =
  | "mock"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error"
