import { ShieldCheck, LayoutGrid, AlertTriangle, Layers, Activity } from "lucide-react"

import { StatBar } from "@/components/admin/StatCards"
import { WardCard, type WardSummary } from "@/components/admin/WardCard"

const MOCK_WARDS: WardSummary[] = [
  { id: "1", name: "Ward A — General", occupancy: 82, totalBeds: 40, availableBeds: 7, alerts: 3, isCritical: false },
  { id: "2", name: "Ward B — Post-op", occupancy: 94, totalBeds: 25, availableBeds: 1, alerts: 5, isCritical: true },
  { id: "3", name: "Ward C — Emergency", occupancy: 68, totalBeds: 30, availableBeds: 10, alerts: 0, isCritical: false },
  { id: "4", name: "Ward D — ICU", occupancy: 88, totalBeds: 12, availableBeds: 1, alerts: 2, isCritical: false },
  { id: "5", name: "Ward E — Pediatric", occupancy: 42, totalBeds: 20, availableBeds: 12, alerts: 0, isCritical: false },
  { id: "6", name: "Ward F — Maternity", occupancy: 78, totalBeds: 15, availableBeds: 3, alerts: 1, isCritical: false },
]

export function AdminDashboardPage() {
  const stats = [
    { 
      title: "Total Wards", 
      value: 12, 
      icon: <Layers className="size-5" />, 
      gradient: "bg-indigo-600 shadow-indigo-200" 
    },
    { 
      title: "Total Beds", 
      value: 245, 
      icon: <LayoutGrid className="size-5" />, 
      gradient: "bg-blue-600 shadow-blue-200" 
    },
    { 
      title: "Occupied Beds", 
      value: 184, 
      icon: <Activity className="size-5" />, 
      trend: "+12%", 
      trendPositive: false,
      gradient: "bg-emerald-600 shadow-emerald-200" 
    },
    { 
      title: "Critical Wards", 
      value: 2, 
      icon: <AlertTriangle className="size-5" />, 
      gradient: "bg-red-600 shadow-red-200",
      trend: "High Rush",
      trendPositive: false,
    },
  ]

  return (
    <div className="min-h-svh bg-[#FAFBFC] relative flex flex-col">
      <header className="relative z-10 p-6 sm:p-10 pb-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200/60">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center size-10 rounded-2xl bg-slate-900 shadow-lg shadow-slate-900/10">
                <ShieldCheck className="size-5 text-indigo-400" />
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Hospital Overview</h1>
            </div>
            <p className="text-lg font-medium text-slate-500 max-w-lg leading-relaxed">
              Real-time monitoring of all wards and patient density levels across the campus.
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 p-6 sm:p-10 pt-10">
        <div className="max-w-7xl mx-auto">
          <StatBar stats={stats} />

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <LayoutGrid className="size-5 text-blue-600" />
              Active Ward Grid
            </h2>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><div className="size-1.5 rounded-full bg-emerald-500" /> Safe</span>
                <span className="flex items-center gap-1.5"><div className="size-1.5 rounded-full bg-amber-500" /> Warning</span>
                <span className="flex items-center gap-1.5"><div className="size-1.5 rounded-full bg-red-500" /> Critical</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {MOCK_WARDS.map((ward, i) => (
              <WardCard key={ward.id} ward={ward} index={i} />
            ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 p-10 mt-auto opacity-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-medium text-slate-500 italic">© 2026 Hospi-Track AI • Admin Control Level 4</p>
      </footer>
    </div>
  )
}
