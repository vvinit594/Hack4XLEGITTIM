import { motion } from "framer-motion"
import { ShieldAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import type { BedWithPatient } from "@/types/bed"
import { STATUS_LABEL, TILE_STATUS_STYLES } from "../bed-board/status-styles"

type BedTileProps = {
  bed: BedWithPatient
  index: number
}

function ReadOnlyBedTile({ bed, index }: BedTileProps) {
  const styles = TILE_STATUS_STYLES[bed.status]
  const hasPatient = Boolean(bed.patient)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02 }}
      className="group relative cursor-not-allowed select-none h-full min-w-0"
    >
      <div
        className={cn(
          "relative w-full h-full rounded-xl border p-3 flex flex-col gap-2 text-left bg-slate-50/50 grayscale-[0.3] opacity-80 transition-all duration-300",
          "border-slate-200/60 shadow-sm shadow-slate-100/40",
          styles.bg
        )}
      >
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold tracking-tight text-slate-700 flex-1 truncate">
            {bed.code}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <div className={cn("size-1.5 shrink-0 rounded-full", styles.dot)} />
          <span className={cn("text-[9px] font-bold tracking-wide uppercase", styles.accent)}>
            {STATUS_LABEL[bed.status]}
          </span>
        </div>

        {hasPatient && bed.patient && (
          <p className="text-[11px] text-slate-900 font-bold truncate mt-1">
            {bed.patient.full_name}
          </p>
        )}
      </div>

      {/* Admin View Label */}
      <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-white/40 backdrop-blur-[1px] rounded-xl">
        <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 shadow-xl text-[10px] font-extrabold text-white uppercase tracking-tighter">
          <ShieldAlert className="size-3 text-indigo-400" /> Admin View Only
        </span>
      </div>
    </motion.div>
  )
}

type ReadOnlyBedGridProps = {
  beds: BedWithPatient[]
}

export function ReadOnlyBedGrid({ beds }: ReadOnlyBedGridProps) {
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {beds.map((bed, i) => (
        <div key={bed.id} className="h-[100px]">
          <ReadOnlyBedTile bed={bed} index={i} />
        </div>
      ))}
    </div>
  )
}
