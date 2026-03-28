import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"
import type { BedWithPatient } from "@/types/bed"

import { STATUS_LABEL, TILE_STATUS_STYLES } from "./status-styles"

type BedTileProps = {
  bed: BedWithPatient
  index: number
  isSelected: boolean
  onSelect: (bed: BedWithPatient) => void
}

export function BedTile({
  bed,
  index,
  isSelected,
  onSelect,
}: BedTileProps) {
  const reduceMotion = useReducedMotion()
  const styles = TILE_STATUS_STYLES[bed.status]
  const hasPatient = Boolean(bed.patient)

  return (
    <motion.div
      layout
      initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: 8 }}
      animate={{
        opacity: 1,
        scale: isSelected ? 1.05 : 1,
        y: 0,
      }}
      transition={{
        delay: reduceMotion ? 0 : 0.03 * index,
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
      className="h-full min-w-0"
    >
      <motion.button
        type="button"
        whileHover={reduceMotion ? undefined : { scale: 1.03 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onClick={() => onSelect(bed)}
        className={cn(
          "relative w-full h-full rounded-xl border transition-all duration-200",
          "p-3 flex flex-col gap-2 text-left cursor-pointer",
          "hover:shadow-lg focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none",
          // Base styling with status colors
          "border-slate-200/60 shadow-sm",
          styles.bg,
          // Selected state
          isSelected &&
            "ring-2 ring-indigo-500 ring-offset-2 ring-offset-background shadow-lg shadow-indigo-500/20"
        )}
      >
        {/* Bed ID */}
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold tracking-tight text-foreground flex-1 truncate">
            {bed.code}
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-1.5">
          <span
            className={cn("size-2 shrink-0 rounded-full", styles.dot)}
            aria-hidden
          />
          <span
            className={cn(
              "text-[10px] font-semibold tracking-wide uppercase",
              styles.accent
            )}
          >
            {STATUS_LABEL[bed.status]}
          </span>
        </div>

        {/* Patient Name (if occupied) */}
        {hasPatient && bed.patient ? (
          <p className="text-xs text-foreground font-medium truncate mt-1">
            {bed.patient.full_name}
          </p>
        ) : null}
      </motion.button>
    </motion.div>
  )
}
