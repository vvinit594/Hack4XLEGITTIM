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
      initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 8 }}
      animate={{
        opacity: 1,
        scale: isSelected ? 1.05 : 1,
        y: 0,
        ...(isSelected && !reduceMotion
          ? {
              boxShadow: [
                "0 0 0px rgba(59, 130, 246, 0)",
                "0 0 15px rgba(59, 130, 246, 0.3)",
                "0 0 0px rgba(59, 130, 246, 0)",
              ],
            }
          : { boxShadow: "none" }),
      }}
      transition={{
        delay: reduceMotion ? 0 : 0.03 * index,
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1] as const,
        ...(isSelected && !reduceMotion
          ? {
              boxShadow: {
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut" as const,
              },
            }
          : {}),
      }}
      className="h-full min-w-0"
    >
      <motion.button
        type="button"
        whileHover={reduceMotion ? undefined : { scale: 1.02 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        onClick={() => onSelect(bed)}
        className={cn(
          "relative w-full h-full rounded-xl border transition-all duration-300 ease-in-out",
          "p-3 flex flex-col gap-2 text-left cursor-pointer shadow-sm",
          "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
          // Status-specific mapping
          styles.bg,
          isSelected ? "border-blue-500 ring-2 ring-blue-300 shadow-md" : [styles.border, styles.hoverBorder, "hover:shadow-md"]
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
