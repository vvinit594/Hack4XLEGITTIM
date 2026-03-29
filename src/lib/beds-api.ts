import type { SupabaseClient } from "@supabase/supabase-js"

import { getHospiApiBase } from "@/lib/hospi-api"
import type { BedStatus } from "@/types/bed"

export type PatchBedStatusPayload = {
  status: BedStatus
  note?: string
}

export async function patchBedStatus(
  client: SupabaseClient | null,
  bedId: string,
  payload: PatchBedStatusPayload
): Promise<void> {
  const apiBase = getHospiApiBase()

  if (apiBase !== undefined) {
    const prefix = apiBase === "" ? "" : apiBase
    const res = await fetch(`${prefix}/api/beds/${bedId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: payload.status,
        note: payload.note,
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || `Request failed (${res.status})`)
    }
    return
  }

  if (!client) {
    throw new Error("Supabase is not configured")
  }

  if (payload.status === "available") {
    const { error: delErr } = await client
      .from("patients")
      .delete()
      .eq("bed_id", bedId)
    if (delErr) throw delErr
  }

  const { error } = await client
    .from("beds")
    .update({
      status: payload.status,
      status_note: payload.note ?? null,
    })
    .eq("id", bedId)

  if (error) throw error
}
