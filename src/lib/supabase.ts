import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import type { BedStatus, BedWithPatient, PatientRow } from "@/types/bed"

let supabaseSingleton: SupabaseClient | null | undefined

export function getSupabase(): SupabaseClient | null {
  if (supabaseSingleton !== undefined) return supabaseSingleton
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    supabaseSingleton = null
    return null
  }
  supabaseSingleton = createClient(url, key)
  return supabaseSingleton
}

export type BedRowDb = {
  id: string
  code: string
  status: BedStatus
  status_note?: string | null
  patients?: PatientRow | PatientRow[] | null
}

export function normalizeBedRow(row: BedRowDb): BedWithPatient {
  const raw = row.patients
  const patient = Array.isArray(raw)
    ? (raw[0] ?? null)
    : raw
      ? raw
      : null
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    status_note: row.status_note ?? null,
    patient,
  }
}
