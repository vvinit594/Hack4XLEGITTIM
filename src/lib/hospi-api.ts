/**
 * When `VITE_API_URL` is set in `.env` (including empty), the app uses the Prisma REST API
 * for bed board + inventory. Empty string → same-origin `/api` (Vite dev proxy).
 */
export function getHospiApiBase(): string | undefined {
  const v = import.meta.env.VITE_API_URL
  if (v === undefined) return undefined
  const t = typeof v === "string" ? v.trim() : ""
  if (t === "") return ""
  return t.replace(/\/$/, "")
}

export function isHospiApiEnabled(): boolean {
  return getHospiApiBase() !== undefined
}

export function hospiApiUrl(path: string): string {
  const base = getHospiApiBase()
  if (base === undefined) {
    throw new Error("Hospi API is not configured (set VITE_API_URL)")
  }
  const p = path.startsWith("/") ? path : `/${path}`
  return base === "" ? p : `${base}${p}`
}
