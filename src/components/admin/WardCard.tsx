import { motion } from "framer-motion"
import { AlertCircle, BedDouble } from "lucide-react"
import { Link } from "react-router-dom"

import { AnimatedBorderCard } from "@/components/ui/AnimatedBorderCard"
import { cn } from "@/lib/utils"

export type WardSummary = {
  id: string
  name: string
  occupancy: number
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
      className="h-full"
    >
      <AnimatedBorderCard
        className={cn(
          "h-full",
          isCritical && "ring-2 ring-red-200/70 ring-offset-2 ring-offset-[#FAFBFC]"
        )}
        innerClassName="p-0"
      >
        <Link
          to={`/app/admin/ward/${ward.id}`}
          className={cn(
            "group block h-full p-6 transition-colors duration-300",
            isCritical
              ? "bg-red-50/20"
              : "hover:bg-slate-50/50"
          )}
        >
          <div className="mb-4 flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-blue-600">
                {ward.name}
              </h3>
              <p className="flex items-center gap-1.5 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                <BedDouble className="size-3" /> {ward.totalBeds} Total Beds
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {isCritical && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase animate-pulse">
                  <AlertCircle className="size-3" /> Critical
                </span>
              )}
              {ward.alerts > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase">
                  {ward.alerts} Alerts
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold tracking-tighter text-slate-900 tabular-nums">
                {ward.occupancy}
                <span className="ml-0.5 text-sm font-semibold opacity-50">%</span>
              </span>
              <span className="text-sm font-bold text-slate-500">
                {ward.availableBeds} Available
              </span>
            </div>

            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${ward.occupancy}%` }}
                transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                className={cn(
                  "h-full rounded-full transition-colors duration-500",
                  isCritical
                    ? "bg-red-500"
                    : isWarning
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                )}
              />
            </div>
          </div>
        </Link>
      </AnimatedBorderCard>
    </motion.div>
  )
}
