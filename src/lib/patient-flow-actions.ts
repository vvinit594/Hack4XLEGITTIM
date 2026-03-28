import type { SupabaseClient } from "@supabase/supabase-js"

import type { AdmissionQueueItem, FlowPatient } from "@/types/patient-flow"

export class NoAvailableBedsError extends Error {
  readonly freeCount: number

  constructor(freeCount: number) {
    super("NO_BEDS")
    this.name = "NoAvailableBedsError"
    this.freeCount = freeCount
  }
}

export async function markPatientDischarged(
  client: SupabaseClient,
  patient: FlowPatient
): Promise<void> {
  const now = new Date().toISOString()
  const { error: pErr } = await client
    .from("patients")
    .update({
      discharge_status: "discharged",
      actual_discharge: now,
    })
    .eq("id", patient.id)
  if (pErr) throw pErr

  const { error: bErr } = await client
    .from("beds")
    .update({ status: "cleaning" })
    .eq("id", patient.bed_id)
  if (bErr) throw bErr
}

export async function markAdmissionArrived(
  client: SupabaseClient,
  item: AdmissionQueueItem
): Promise<{ bedId: string; bedCode: string }> {
  const { data: bed, error: bedErr } = await client
    .from("beds")
    .select("id, code")
    .eq("status", "available")
    .limit(1)
    .maybeSingle()

  if (bedErr) throw bedErr
  if (!bed) {
    const { count } = await client
      .from("beds")
      .select("*", { count: "exact", head: true })
      .eq("status", "available")
    throw new NoAvailableBedsError(count ?? 0)
  }

  const { error: qErr } = await client
    .from("admissions_queue")
    .update({
      status: "arrived",
      assigned_bed_id: bed.id,
    })
    .eq("id", item.id)
  if (qErr) throw qErr

  const { error: bUp } = await client
    .from("beds")
    .update({ status: "occupied" })
    .eq("id", bed.id)
  if (bUp) throw bUp

  const { error: insErr } = await client.from("patients").insert({
    bed_id: bed.id,
    full_name: item.patient_name,
    discharge_status: "none",
    condition_category: "New admission",
    doctor_name: null,
    admission_date: new Date().toISOString().slice(0, 10),
  })
  if (insErr) throw insErr

  return { bedId: bed.id, bedCode: bed.code as string }
}
