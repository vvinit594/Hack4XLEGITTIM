import { lazy, Suspense } from "react"
import { ShieldCheck, LayoutGrid, AlertTriangle, Layers, Activity, Loader2 } from "lucide-react"

import { StatBar } from "@/components/admin/StatCards"
import { WardCard } from "@/components/admin/WardCard"
import { useAdminDashboard } from "@/hooks/useAdminDashboard"

const AdminAnalyticsCharts = lazy(() =>
  import("@/components/admin/AdminAnalyticsCharts").then((m) => ({
    default: m.AdminAnalyticsCharts,
  }))
)

function AnalyticsFallback() {
  return (
    <div
      className="mb-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3"
      aria-hidden
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-[320px] animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-sm"
        />
      ))}
    </div>
  )
}

export function AdminDashboardPage() {
  const { wards, campusStats, loading, error } = useAdminDashboard()

  const stats = [
    {
      title: "Total Wards",
      value: wards.length || 6,
      icon: <Layers className="size-5" />,
      gradient: "bg-indigo-600 shadow-indigo-200",
    },
    {
      title: "Total Beds",
      value: campusStats.total || 0,
      icon: <LayoutGrid className="size-5" />,
      gradient: "bg-blue-600 shadow-blue-200",
    },
    {
      title: "Occupied Beds",
      value: campusStats.occupied || 0,
      icon: <Activity className="size-5" />,
      trend: campusStats.total > 0
        ? `${Math.round((campusStats.occupied / campusStats.total) * 100)}%`
        : "—",
      trendPositive: false,
      gradient: "bg-emerald-600 shadow-emerald-200",
    },
    {
      title: "Critical Wards",
      value: wards.filter((w) => w.isCritical).length,
      icon: <AlertTriangle className="size-5" />,
      gradient: "bg-red-600 shadow-red-200",
      trend: wards.filter((w) => w.isCritical).length > 0 ? "High Rush" : "Normal",
      trendPositive: false,
    },
  ]

  return (
    <div className="relative flex min-h-svh flex-col bg-[#FAFBFC]">
      <header className="relative z-10 p-6 pb-0 sm:p-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 border-b border-slate-200/60 pb-8 md:flex-row md:items-end">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-slate-900 shadow-lg shadow-slate-900/10">
                <ShieldCheck className="size-5 text-indigo-400" />
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Hospital Overview
              </h1>
            </div>
            <p className="max-w-lg text-lg font-medium leading-relaxed text-slate-500">
              Real-time monitoring of all wards and patient density levels across the campus.
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 p-6 pt-10 sm:p-10">
        <div className="mx-auto max-w-7xl">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <StatBar stats={stats} />

          <Suspense fallback={<AnalyticsFallback />}>
            <AdminAnalyticsCharts />
          </Suspense>

          <div className="mb-8 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900">
              <LayoutGrid className="size-5 text-blue-600" />
              Active Ward Grid
            </h2>
            <div className="flex items-center gap-4 text-xs font-bold tracking-widest text-slate-500 uppercase">
              <span className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-emerald-500" /> Safe
              </span>
              <span className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-amber-500" /> Warning
              </span>
              <span className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-red-500" /> Critical
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
              <Loader2 className="size-8 animate-spin text-indigo-500" />
              <p className="text-sm font-medium">Loading ward data…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {wards.map((ward, i) => (
                <WardCard key={ward.id} ward={ward} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="relative z-10 mt-auto flex flex-col items-center justify-between gap-4 p-10 opacity-50 md:flex-row">
        <p className="text-xs font-medium text-slate-500 italic">
          © 2026 Hospi-Track AI • Admin Control Level 4
        </p>
      </footer>
    </div>
  )
}
