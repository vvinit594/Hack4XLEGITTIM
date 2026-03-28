import { Link, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, ShieldAlert, AlertCircle, LayoutGrid, BedDouble } from "lucide-react"

import { useRealtimeBeds } from "@/hooks/useRealtimeBeds"
import { ReadOnlyBedGrid } from "@/components/admin/ReadOnlyBedGrid"
import { Button } from "@/components/ui/button"

export function AdminWardDetailPage() {
  const { id } = useParams()
  const { beds, loading, error, isMock } = useRealtimeBeds()

  // Simplified: show all beds for any ward for the demo.
  // In a real app, you would filter by ward id or fetch from a specific API.
  const wardName = `Ward ${id?.toUpperCase() || "A"} — Overview`
  const isOccupancyHigh = beds.filter(b => b.status === "occupied").length / (beds.length || 1) >= 0.9

  return (
    <div className="min-h-svh bg-[#FAFBFC] relative flex flex-col">
      <header className="relative z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon-sm" asChild className="rounded-xl border border-slate-200">
              <Link to="/app/admin" aria-label="Back to dashboard">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div className="space-y-0.5">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 group flex items-center gap-2">
                {wardName}
                {isOccupancyHigh && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 to-red-600 border border-red-200 text-[10px] font-extrabold text-red-600 uppercase">
                    <AlertCircle className="size-3" /> Critical High
                  </span>
                )}
              </h1>
              <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-widest">
                <ShieldAlert className="size-3 text-indigo-500" /> Administrative Monitoring Only
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
             <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                <BedDouble className="size-3" /> Real-time feed: {isMock ? "Mocked" : "Active"}
             </div>
             {/* ReadOnly indicator */}
             <div className="px-3 py-1.5 rounded-lg bg-slate-900 text-[10px] font-extrabold text-white uppercase tracking-wider shadow-lg shadow-slate-900/10">
                READ-ONLY
             </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 p-6 sm:p-10">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 font-bold border border-red-200 shadow-sm flex items-center gap-3">
               <AlertCircle className="size-5" /> {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="size-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Securely Fetching Feed...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/60">
                <h2 className="text-sm font-extrabold tracking-tight text-slate-400 flex items-center gap-2 uppercase">
                  <LayoutGrid className="size-4" />
                  Live Ward Topology
                </h2>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Total: {beds.length}
                </div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm shadow-slate-100/50"
              >
                <ReadOnlyBedGrid beds={beds} />
              </motion.div>
            </>
          )}
        </div>
      </main>

      <footer className="relative z-10 p-10 opacity-30 mt-auto flex justify-center">
         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldAlert className="size-3" /> Secure End-to-End Encryption Enabled
         </p>
      </footer>
    </div>
  )
}
