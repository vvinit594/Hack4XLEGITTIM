import { motion } from "framer-motion"
import { AlertCircle, BedDouble } from "lucide-react"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

export type WardSummary = {
  id: string
  name: string
  occupancy: number // 0-100
  totalBeds: number
  availableBeds: number
  alerts: number
  isCritical: boolean
}

type WardCardProps = {
  ward: WardSummary
  index: number
}

export function WardCard({ ward, index }: WardCardProps) {
  const isCritical = ward.occupancy >= 90 || ward.isCritical
  const isWarning = ward.occupancy >= 80 && ward.occupancy < 90

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ 
        y: -6, 
        scale: 1.01,
        boxShadow: isCritical 
          ? "0 20px 40px -12px rgba(239, 68, 68, 0.2)"
          : "0 20px 40px -12px rgba(0, 0, 0, 0.08)"
      }}
    >
      <Link 
        to={`/app/admin/ward/${ward.id}`}
        className={cn(
          "group block relative p-6 rounded-2xl bg-white border transition-all duration-300",
          isCritical 
            ? "border-red-200 ring-4 ring-red-50" 
            : "border-slate-200 hover:border-blue-200 shadow-sm"
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
              {ward.name}
            </h3>
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <BedDouble className="size-3" /> {ward.totalBeds} Total Beds
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {isCritical && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-[10px] font-bold text-white uppercase animate-pulse">
                <AlertCircle className="size-3" /> Critical
              </span>
            )}
            {ward.alerts > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-[10px] font-bold text-amber-700 uppercase">
                {ward.alerts} Alerts
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <span className="text-3xl font-bold tabular-nums text-slate-900 tracking-tighter">
              {ward.occupancy}<span className="text-sm font-semibold opacity-50 ml-0.5">%</span>
            </span>
            <span className="text-sm font-bold text-slate-500">
              {ward.availableBeds} Available
            </span>
          </div>

          <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${ward.occupancy}%` }}
              transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
              className={cn(
                "h-full rounded-full transition-colors duration-500",
                isCritical ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
              )}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
