export type DischargeStatus = "none" | "discharge_ordered" | "discharged"

export type AdmissionQueueStatus = "pending" | "arrived" | "cancelled"

export type ArrivalType = "emergency" | "normal"

export type AdmissionSource = "elective" | "emergency" | "walk_in"

export type FlowPatient = {
  id: string
  bed_id: string
  full_name: string
  condition_category: string | null
  discharge_status: DischargeStatus
  expected_discharge: string | null
  actual_discharge: string | null
  discharge_ordered_at: string | null
}

export type AdmissionQueueItem = {
  id: string
  patient_name: string
  arrival_type: ArrivalType
  status: AdmissionQueueStatus
  source: AdmissionSource
  expected_arrival: string
  assigned_bed_id?: string | null
}

export type PatientFlowConnectionState =
  | "mock"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error"
