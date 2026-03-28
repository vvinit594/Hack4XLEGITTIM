export type HospitalRole = "doctor" | "nurse" | "staff"

export const HOSPITAL_ROLES: HospitalRole[] = ["doctor", "nurse", "staff"]

export function isHospitalRole(v: string): v is HospitalRole {
  return v === "doctor" || v === "nurse" || v === "staff"
}
