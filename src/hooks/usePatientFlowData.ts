import type { RealtimeChannel } from "@supabase/supabase-js"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  markAdmissionArrived,
  markPatientDischarged,
  NoAvailableBedsError,
} from "@/lib/patient-flow-actions"
import { getSupabase } from "@/lib/supabase"
import type {
  AdmissionQueueItem,
  FlowPatient,
  PatientFlowConnectionState,
} from "@/types/patient-flow"

function buildMockData() {
  const now = Date.now()
  const pending: FlowPatient[] = [
    {
      id: "flow-p-1",
      bed_id: "mock-bed-1",
      full_name: "Ramesh Kumar",
      condition_category: "Cardiac care",
      discharge_status: "discharge_ordered",
      expected_discharge: new Date(now + 45 * 60 * 1000).toISOString(),
      actual_discharge: null,
      discharge_ordered_at: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "flow-p-2",
      bed_id: "mock-bed-2",
      full_name: "Priya Nair",
      condition_category: "Pneumonia",
      discharge_status: "discharge_ordered",
      expected_discharge: new Date(now + 2 * 60 * 60 * 1000).toISOString(),
      actual_discharge: null,
      discharge_ordered_at: new Date(now - 40 * 60 * 1000).toISOString(),
    },
    {
      id: "flow-p-3",
      bed_id: "mock-bed-3",
      full_name: "Sanjay Verma",
      condition_category: "Post-operative",
      discharge_status: "discharge_ordered",
      expected_discharge: new Date(now + 20 * 60 * 1000).toISOString(),
      actual_discharge: null,
      discharge_ordered_at: new Date(now - 90 * 60 * 1000).toISOString(),
    },
  ]

  const awaiting: AdmissionQueueItem[] = [
    {
      id: "flow-q-1",
      patient_name: "Meera Shah",
      arrival_type: "emergency",
      status: "pending",
      source: "emergency",
      expected_arrival: new Date(now - 15 * 60 * 1000).toISOString(),
    },
    {
      id: "flow-q-2",
      patient_name: "Arjun Mehta",
      arrival_type: "normal",
      status: "pending",
      source: "walk_in",
      expected_arrival: new Date(now + 10 * 60 * 1000).toISOString(),
    },
    {
      id: "flow-q-3",
      patient_name: "Neha Kapoor",
      arrival_type: "emergency",
      status: "pending",
      source: "emergency",
      expected_arrival: new Date(now + 28 * 60 * 1000).toISOString(),
    },
  ]

  const elective: AdmissionQueueItem[] = [
    {
      id: "flow-e-1",
      patient_name: "Kavita Rao",
      arrival_type: "normal",
      status: "pending",
      source: "elective",
      expected_arrival: new Date(now + 26 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "flow-e-2",
      patient_name: "Daniel Ortiz",
      arrival_type: "normal",
      status: "pending",
      source: "elective",
      expected_arrival: new Date(now + 50 * 60 * 60 * 1000).toISOString(),
    },
  ]

  return { pending, awaiting, elective }
}

export function usePatientFlowData() {
  const client = useMemo(() => getSupabase(), [])
  const isMock = client === null

  const mockSeed = useMemo(() => buildMockData(), [])

  const [pendingDischarge, setPendingDischarge] = useState<FlowPatient[]>(() =>
    isMock ? mockSeed.pending : []
  )
  const [awaitingAdmission, setAwaitingAdmission] = useState<
    AdmissionQueueItem[]
  >(() => (isMock ? mockSeed.awaiting : []))
  const [electiveAdmissions, setElectiveAdmissions] = useState<
    AdmissionQueueItem[]
  >(() => (isMock ? mockSeed.elective : []))
  const [availableBedCount, setAvailableBedCount] = useState(() =>
    isMock ? 4 : 0
  )
  const availableBedCountRef = useRef(availableBedCount)

  const [loading, setLoading] = useState(() => client !== null)
  const [error, setError] = useState<string | null>(null)
  const [connectionState, setConnectionState] =
    useState<PatientFlowConnectionState>(() => (client ? "connecting" : "mock"))

  const channelRef = useRef<RealtimeChannel | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const attemptRef = useRef(0)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const connectRef = useRef<() => void>(() => {})

  const loadFlow = useCallback(async () => {
    if (!client) return
    const { data: pd, error: e1 } = await client
      .from("patients")
      .select("*")
      .eq("discharge_status", "discharge_ordered")
      .order("expected_discharge", { ascending: true })

    const { data: queueRows, error: e2 } = await client
      .from("admissions_queue")
      .select("*")
      .eq("status", "pending")

    const { count, error: e3 } = await client
      .from("beds")
      .select("*", { count: "exact", head: true })
      .eq("status", "available")

    setLoading(false)
    if (e1 || e2) {
      setError(e1?.message ?? e2?.message ?? "Load failed")
      return
    }
    if (e3) {
      setError(e3.message)
      return
    }

    const rows = (pd ?? []) as FlowPatient[]
    setPendingDischarge(rows)

    const allQ = (queueRows ?? []) as AdmissionQueueItem[]
    const now = Date.now()
    setAwaitingAdmission(
      allQ.filter((q) => q.source !== "elective")
    )
    setElectiveAdmissions(
      allQ
        .filter(
          (q) =>
            q.source === "elective" &&
            new Date(q.expected_arrival).getTime() > now
        )
        .sort(
          (a, b) =>
            new Date(a.expected_arrival).getTime() -
            new Date(b.expected_arrival).getTime()
        )
    )
    setAvailableBedCount(count ?? 0)
    setError(null)
  }, [client])

  const scheduleRefetch = useCallback(() => {
    if (!client) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
      void loadFlow()
    }, 140)
  }, [client, loadFlow])

  const teardownChannel = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    channelRef.current?.unsubscribe()
    channelRef.current = null
  }, [])

  const connect = useCallback(() => {
    if (!client) return
    teardownChannel()
    const ch = client
      .channel(`patient-flow:${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patients" },
        () => scheduleRefetch()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admissions_queue" },
        () => scheduleRefetch()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "beds" },
        () => scheduleRefetch()
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          attemptRef.current = 0
          setConnectionState("connected")
          void loadFlow()
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnectionState("reconnecting")
          attemptRef.current += 1
          const delay = Math.min(
            30_000,
            1000 * 2 ** Math.min(attemptRef.current, 5)
          )
          reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = null
            connectRef.current()
          }, delay)
        }
      })
    channelRef.current = ch
  }, [client, loadFlow, scheduleRefetch, teardownChannel])

  useEffect(() => {
    connectRef.current = connect
  }, [connect])

  useEffect(() => {
    availableBedCountRef.current = availableBedCount
  }, [availableBedCount])

  useEffect(() => {
    if (!client) return
    connect()
    return () => teardownChannel()
  }, [client, connect, teardownChannel])

  const markDischarged = useCallback(
    async (patient: FlowPatient) => {
      if (!client) {
        setPendingDischarge((prev) => prev.filter((p) => p.id !== patient.id))
        return
      }
      await markPatientDischarged(client, patient)
      await loadFlow()
    },
    [client, loadFlow]
  )

  const markArrived = useCallback(
    async (item: AdmissionQueueItem) => {
      if (!client) {
        const free = availableBedCountRef.current
        if (free < 1) throw new NoAvailableBedsError(free)
        setAwaitingAdmission((prev) => prev.filter((q) => q.id !== item.id))
        setAvailableBedCount((c) => Math.max(0, c - 1))
        return
      }
      await markAdmissionArrived(client, item)
      await loadFlow()
    },
    [client, loadFlow]
  )

  return {
    pendingDischarge,
    awaitingAdmission,
    electiveAdmissions,
    availableBedCount,
    loading,
    error,
    isMock,
    connectionState,
    refetch: loadFlow,
    markDischarged,
    markArrived,
  }
}
