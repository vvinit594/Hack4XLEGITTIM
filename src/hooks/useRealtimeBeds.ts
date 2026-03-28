/** Realtime bed board state + Supabase channel (see also `beds-api` for PATCH). */
import type { RealtimeChannel } from "@supabase/supabase-js"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { patchBedStatus, type PatchBedStatusPayload } from "@/lib/beds-api"
import {
  getSupabase,
  normalizeBedRow,
  type BedRowDb,
} from "@/lib/supabase"
import type { BedWithPatient, BedsRealtimeStatus } from "@/types/bed"

const MOCK_BEDS: BedWithPatient[] = [
  {
    id: "00000000-0000-4000-a000-000000000001",
    code: "A-01",
    status: "occupied",
    patient: {
      id: "p0000001-0000-4000-a000-000000000001",
      bed_id: "00000000-0000-4000-a000-000000000001",
      patient_code: "P1001",
      gender: "male",
      full_name: "Ramesh Kumar",
      admission_date: "2026-03-22",
      condition_category: "Cardiac care",
      doctor_name: "Dr. A. Patel",
    },
  },
  {
    id: "00000000-0000-4000-a000-000000000002",
    code: "A-02",
    status: "occupied",
    patient: {
      id: "p0000001-0000-4000-a000-000000000002",
      bed_id: "00000000-0000-4000-a000-000000000002",
      patient_code: "P1002",
      gender: "female",
      full_name: "Priya Nair",
      admission_date: "2026-03-23",
      condition_category: "Pneumonia",
      doctor_name: "Dr. M. Chen",
    },
  },
  {
    id: "00000000-0000-4000-a000-000000000003",
    code: "A-03",
    status: "occupied",
    patient: {
      id: "p0000001-0000-4000-a000-000000000003",
      bed_id: "00000000-0000-4000-a000-000000000003",
      patient_code: "P1003",
      gender: "male",
      full_name: "Sanjay Verma",
      admission_date: "2026-03-24",
      condition_category: "Post-operative",
      doctor_name: "Dr. L. Okonkwo",
    },
  },
  {
    id: "00000000-0000-4000-a000-000000000004",
    code: "A-04",
    status: "reserved",
    patient: {
      id: "unassigned-0001",
      bed_id: "00000000-0000-4000-a000-000000000004",
      patient_code: "P1010",
      gender: "female",
      full_name: "Anita Desai",
      admission_date: null,
      condition_category: "Triage pending",
      doctor_name: "Dr. R. Mehta",
    },
  },
  {
    id: "00000000-0000-4000-a000-000000000005",
    code: "A-05",
    status: "cleaning",
    patient: {
      id: "unassigned-0002",
      bed_id: "00000000-0000-4000-a000-000000000005",
      patient_code: "P1011",
      gender: "male",
      full_name: "Vikram Joshi",
      admission_date: null,
      condition_category: "Awaiting admission",
      doctor_name: null,
    },
  },
  {
    id: "00000000-0000-4000-a000-000000000006",
    code: "A-06",
    status: "available",
    patient: null,
  },
  {
    id: "00000000-0000-4000-a000-000000000007",
    code: "A-07",
    status: "available",
    patient: null,
  },
  {
    id: "00000000-0000-4000-a000-000000000008",
    code: "B-01",
    status: "available",
    patient: null,
  },
  {
    id: "00000000-0000-4000-a000-000000000009",
    code: "B-02",
    status: "cleaning",
    patient: null,
  },
  {
    id: "00000000-0000-4000-a000-000000000010",
    code: "B-03",
    status: "occupied",
    patient: {
      id: "p0000001-0000-4000-a000-000000000004",
      bed_id: "00000000-0000-4000-a000-000000000010",
      patient_code: "P1004",
      gender: "female",
      full_name: "Riley Morgan",
      admission_date: "2026-03-24",
      condition_category: "Pulmonology",
      doctor_name: "Dr. K. Singh",
    },
  },
  {
    id: "00000000-0000-4000-a000-000000000011",
    code: "B-04",
    status: "reserved",
    patient: null,
  },
  {
    id: "00000000-0000-4000-a000-000000000012",
    code: "B-05",
    status: "available",
    patient: null,
  },
]

export function useRealtimeBeds() {
  const client = useMemo(() => getSupabase(), [])
  const isMock = client === null

  const [beds, setBeds] = useState<BedWithPatient[]>(() =>
    client ? [] : MOCK_BEDS
  )
  const [loading, setLoading] = useState(() => client !== null)
  const [error, setError] = useState<string | null>(null)
  const [connectionState, setConnectionState] =
    useState<BedsRealtimeStatus>(() => (client ? "connecting" : "mock"))

  const channelRef = useRef<RealtimeChannel | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const attemptRef = useRef(0)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const connectRef = useRef<() => void>(() => {})

  const fetchBeds = useCallback(async () => {
    if (!client) return
    const { data, error: fetchError } = await client
      .from("beds")
      .select("id, code, status, status_note, patients (*)")
      .order("code")
    setLoading(false)
    if (fetchError) {
      setError(fetchError.message)
      return
    }
    const rows = (data ?? []) as BedRowDb[]
    setBeds(rows.map(normalizeBedRow))
    setError(null)
  }, [client])

  const scheduleRefetch = useCallback(() => {
    if (!client) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
      void fetchBeds()
    }, 120)
  }, [client, fetchBeds])

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
      .channel(`public:beds:${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "beds" },
        () => {
          scheduleRefetch()
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patients" },
        () => {
          scheduleRefetch()
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          attemptRef.current = 0
          setConnectionState("connected")
          void fetchBeds()
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
  }, [client, fetchBeds, scheduleRefetch, teardownChannel])

  useEffect(() => {
    connectRef.current = connect
  }, [connect])

  useEffect(() => {
    if (!client) return

    connect()

    return () => {
      teardownChannel()
    }
  }, [client, connect, teardownChannel])

  const updateBedStatus = useCallback(
    async (bedId: string, payload: PatchBedStatusPayload) => {
      if (!client) {
        setBeds((prev) =>
          prev.map((b) => {
            if (b.id !== bedId) return b
            if (payload.status === "available") {
              return {
                ...b,
                status: payload.status,
                patient: null,
                status_note: payload.note ?? null,
              }
            }
            return {
              ...b,
              status: payload.status,
              status_note: payload.note ?? null,
            }
          })
        )
        return
      }
      await patchBedStatus(client, bedId, payload)
      await fetchBeds()
    },
    [client, fetchBeds]
  )

  return {
    beds,
    loading,
    error,
    isMock,
    connectionState,
    refetch: fetchBeds,
    updateBedStatus,
  }
}
