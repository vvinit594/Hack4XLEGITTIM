import type { HospitalRole } from "@/types/auth"

export const ROLE_STORAGE_KEY = "hospi_track_role"
export const ID_STORAGE_KEY = "hospi_track_demo_id"

const DEMO_IDS: Record<HospitalRole, string> = {
  doctor: "Doctor123",
  nurse: "Nurse123",
  staff: "Staff123",
}

export function validateDemoId(role: HospitalRole, raw: string): boolean {
  return raw.trim() === DEMO_IDS[role]
}

export function readStoredSession(): {
  role: HospitalRole
  demoId: string
} | null {
  try {
    const role = localStorage.getItem(ROLE_STORAGE_KEY) as HospitalRole | null
    const demoId = localStorage.getItem(ID_STORAGE_KEY)
    if (!role || !demoId) return null
    if (role !== "doctor" && role !== "nurse" && role !== "staff") return null
    if (!validateDemoId(role, demoId)) return null
    return { role, demoId }
  } catch {
    return null
  }
}

export function writeSession(role: HospitalRole, demoId: string) {
  localStorage.setItem(ROLE_STORAGE_KEY, role)
  localStorage.setItem(ID_STORAGE_KEY, demoId.trim())
}

export function clearSession() {
  localStorage.removeItem(ROLE_STORAGE_KEY)
  localStorage.removeItem(ID_STORAGE_KEY)
}

export function demoIdPlaceholder(role: HospitalRole): string {
  switch (role) {
    case "doctor":
      return "Enter Doctor ID (e.g., Doctor123)"
    case "nurse":
      return "Enter Nurse ID (e.g., Nurse123)"
    case "staff":
      return "Enter Staff ID (e.g., Staff123)"
  }
}

/** App paths (pathname prefixes after normalization) allowed per role */
export function canAccessAppPath(
  role: HospitalRole,
  pathname: string
): boolean {
  const p = pathname.replace(/\/$/, "") || "/app"
  const segments = p.split("/").filter(Boolean)
  const module = segments[1] ?? "dashboard"

  if (role === "doctor") {
    return [
      "dashboard",
      "bed-board",
      "admissions",
      "forecast",
      "outbreak",
      "admin",
      "alerts",
      "settings",
    ].includes(module)
  }
  if (role === "nurse") {
    return ["dashboard", "bed-board", "admissions", "alerts", "settings"].includes(
      module
    )
  }
  return ["dashboard", "inventory", "alerts", "settings"].includes(module)
}
