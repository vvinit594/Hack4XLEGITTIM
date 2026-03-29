import type { RealtimeChannel } from "@supabase/supabase-js"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { getSupabase } from "@/lib/supabase"
import {
  ADMIN_CAMPUS_BEDS,
  ADMIN_MOCK_WARDS,
  occupancyStatusColor,
  shortWardLabel,
} from "@/lib/admin-dashboard-data"
import type { WardSummary } from "@/components/admin/WardCard"

type WardRow = {
  id: string
  name: string
  total_beds: number
  alerts: number
  is_critical: boolean
}

type BedCountRow = {
  ward_id: string | null
  status: string
}

type CampusStats = {
  total: number
  occupied: number
  available: number
}

export function useAdminDashboard() {
  const client = useMemo(() => getSupabase(), [])
  const isMock = client === null

  const [wards, setWards] = useState<WardSummary[]>(() => isMock ? ADMIN_MOCK_WARDS : [])
  const [campusStats, setCampusStats] = useState<CampusStats>(() =>
    isMock ? ADMIN_CAMPUS_BEDS : { total: 0, occupied: 0, available: 0 }
  )
  const [loading, setLoading] = useState(!isMock)
  const [error, setError] = useState<string | null>(null)

  const channelRef = useRef<RealtimeChannel | null>(null)

  const load = useCallback(async () => {
    if (!client) { setLoading(false); return }

    const [wardsRes, bedsRes] = await Promise.all([
      client.from("wards").select("*").order("name"),
      client.from("beds").select("ward_id, status"),
    ])

    setLoading(false)
    if (wardsRes.error) { setError(wardsRes.error.message); return }
    if (bedsRes.error) { setError(bedsRes.error.message); return }

    const wardRows = (wardsRes.data ?? []) as WardRow[]
    const bedRows = (bedsRes.data ?? []) as BedCountRow[]

    // Group beds by ward_id
    const bedsByWard: Record<string, BedCountRow[]> = {}
    for (const bed of bedRows) {
      const key = bed.ward_id ?? "__unassigned__"
      if (!bedsByWard[key]) bedsByWard[key] = []
      bedsByWard[key].push(bed)
    }

    const wardSummaries: WardSummary[] = wardRows.map((w) => {
      const wardBeds = bedsByWard[w.id] ?? []
      const occupied = wardBeds.filter((b) => b.status === "occupied").length
      const available = wardBeds.filter((b) => b.status === "available").length
      const total = w.total_beds > 0 ? w.total_beds : wardBeds.length
      const occupancy = total > 0 ? Math.round((occupied / total) * 100) : 0
      return {
        id: w.id,
        name: w.name,
        occupancy,
        totalBeds: total,
        availableBeds: available,
        alerts: w.alerts,
        isCritical: w.is_critical || occupancy >= 90,
      }
    })

    setWards(wardSummaries)

    const totalBeds = bedRows.length
    const occupiedBeds = bedRows.filter((b) => b.status === "occupied").length
    setCampusStats({
      total: totalBeds,
      occupied: occupiedBeds,
      available: bedRows.filter((b) => b.status === "available").length,
    })
    setError(null)
  }, [client])

  useEffect(() => { void load() }, [load])

  useEffect(() => {
    if (!client) return
    const ch = client
      .channel(`admin:${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "beds" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "wards" }, () => void load())
      .subscribe()
    channelRef.current = ch
    return () => { ch.unsubscribe(); channelRef.current = null }
  }, [client, load])

  return {
    wards,
    campusStats,
    loading,
    error,
    isMock,
    reload: load,
    occupancyStatusColor,
    shortWardLabel,
  }
}
