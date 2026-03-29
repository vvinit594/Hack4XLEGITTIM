import type { RealtimeChannel } from "@supabase/supabase-js"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { getSupabase } from "@/lib/supabase"
import {
  AUTHORITY_SEED,
  OUTBREAK_ALERT,
  OUTBREAK_CHART,
  OUTBREAK_CLUSTERS,
  OUTBREAK_METRICS,
} from "@/lib/outbreak-seed"
import type {
  AuthorityContact,
  DiseaseCluster,
  OutbreakAlertState,
  OutbreakChartData,
} from "@/types/outbreak"

type ClusterRow = {
  id: string
  disease: string
  cases: number
  time_window: string
  ward: string
  risk: "safe" | "warning" | "critical"
}

type CaseRow = {
  disease: string
  recorded_at: string
  case_count: number
}

type AuthorityRow = {
  id: string
  short_name: string
  full_name: string
  role: string
  channel: string
  status: "ready" | "sent"
}

function buildAlertFromClusters(clusters: ClusterRow[]): OutbreakAlertState {
  const critical = clusters
    .filter((c) => c.risk === "critical")
    .sort((a, b) => b.cases - a.cases)[0]
  if (!critical) {
    return { active: false, disease: "", casesInWindow: 0, threshold: 8, windowLabel: "last 6 hours", primaryWard: "" }
  }
  return {
    active: true,
    disease: critical.disease,
    casesInWindow: critical.cases,
    threshold: 8,
    windowLabel: critical.time_window.toLowerCase(),
    primaryWard: critical.ward,
  }
}

function buildChartFromCases(cases: CaseRow[]): OutbreakChartData {
  const diseases = [...new Set(cases.map((c) => c.disease))]
  const COLORS: Record<string, string> = {
    Typhoid: "#dc2626",
    Dengue: "#2563eb",
    Influenza: "#7c3aed",
  }
  // Build 7 slots: -6h to now
  const labels = ["-6h", "-5h", "-4h", "-3h", "-2h", "-1h", "Now"]
  const series = diseases.map((disease) => {
    const diseaseCases = cases.filter((c) => c.disease === disease)
    const values = labels.map((_, slotIdx) => {
      const match = diseaseCases[slotIdx]
      return match ? match.case_count : 0
    })
    return {
      id: disease.toLowerCase(),
      label: disease,
      color: COLORS[disease] ?? "#6b7280",
      values,
    }
  })
  return { hourLabels: labels, series }
}

export function useOutbreakData() {
  const client = useMemo(() => getSupabase(), [])
  const isMock = client === null

  const [clusters, setClusters] = useState<DiseaseCluster[]>(() =>
    isMock ? OUTBREAK_CLUSTERS : []
  )
  const [chart, setChart] = useState<OutbreakChartData>(() =>
    isMock ? OUTBREAK_CHART : { hourLabels: [], series: [] }
  )
  const [alert, setAlert] = useState<OutbreakAlertState>(() =>
    isMock ? OUTBREAK_ALERT : { active: false, disease: "", casesInWindow: 0, threshold: 8, windowLabel: "last 6 hours", primaryWard: "" }
  )
  const [metrics, setMetrics] = useState(() =>
    isMock ? OUTBREAK_METRICS : { totalActiveCases: 0, topDisease: "", newCasesLast6h: 0, riskLevel: "safe" as const }
  )
  const [authorities, setAuthorities] = useState<AuthorityContact[]>(() =>
    isMock ? [...AUTHORITY_SEED] : []
  )
  const [loading, setLoading] = useState(!isMock)
  const [error, setError] = useState<string | null>(null)

  const channelRef = useRef<RealtimeChannel | null>(null)

  const load = useCallback(async () => {
    if (!client) {
      setLoading(false)
      return
    }

    const [clustersRes, casesRes, authRes] = await Promise.all([
      client.from("disease_clusters").select("*").order("cases", { ascending: false }),
      client
        .from("disease_cases")
        .select("disease, recorded_at, case_count")
        .gte("recorded_at", new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString())
        .order("recorded_at", { ascending: true }),
      client.from("authority_contacts").select("*").order("id"),
    ])

    setLoading(false)
    if (clustersRes.error) { setError(clustersRes.error.message); return }
    if (casesRes.error) { setError(casesRes.error.message); return }
    if (authRes.error) { setError(authRes.error.message); return }

    const clusterRows = (clustersRes.data ?? []) as ClusterRow[]
    const caseRows = (casesRes.data ?? []) as CaseRow[]
    const authRows = (authRes.data ?? []) as AuthorityRow[]

    setClusters(
      clusterRows.map((r) => ({
        id: r.id,
        disease: r.disease,
        cases: r.cases,
        timeWindow: r.time_window,
        ward: r.ward,
        risk: r.risk,
      }))
    )

    const derivedAlert = buildAlertFromClusters(clusterRows)
    setAlert(derivedAlert)

    setMetrics({
      totalActiveCases: clusterRows.reduce((s, c) => s + c.cases, 0),
      topDisease: clusterRows[0]?.disease ?? "",
      newCasesLast6h: clusterRows.filter((c) => c.time_window.includes("6h")).reduce((s, c) => s + c.cases, 0),
      riskLevel: clusterRows.some((c) => c.risk === "critical")
        ? "critical"
        : clusterRows.some((c) => c.risk === "warning")
        ? "warning"
        : "safe",
    } as typeof metrics)

    setChart(buildChartFromCases(caseRows))

    setAuthorities(
      authRows.map((r) => ({
        id: r.id,
        shortName: r.short_name,
        fullName: r.full_name,
        role: r.role,
        channel: r.channel,
        status: r.status,
      }))
    )
    setError(null)
  }, [client])

  useEffect(() => { void load() }, [load])

  // Realtime
  useEffect(() => {
    if (!client) return
    const ch = client
      .channel(`outbreak:${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "disease_clusters" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "disease_cases" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "authority_contacts" }, () => void load())
      .subscribe()
    channelRef.current = ch
    return () => { ch.unsubscribe(); channelRef.current = null }
  }, [client, load])

  const markSent = useCallback(
    async (authorityId: string) => {
      setAuthorities((prev) =>
        prev.map((a) => (a.id === authorityId ? { ...a, status: "sent" } : a))
      )
      if (!client) return
      await client
        .from("authority_contacts")
        .update({ status: "sent" })
        .eq("id", authorityId)
    },
    [client]
  )

  return {
    clusters,
    chart,
    alert,
    metrics,
    authorities,
    loading,
    error,
    isMock,
    markSent,
    reload: load,
  }
}
