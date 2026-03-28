import { motion, useReducedMotion } from "framer-motion"
import { Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { BedWithPatient } from "@/types/bed"

import { STATUS_LABEL, TILE_STATUS_STYLES } from "./status-styles"

function formatDate(value: string | null) {
  if (!value) return "—"
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value))
  } catch {
    return value
  }
}

type BedTileProps = {
  bed: BedWithPatient
  index: number
  isSelected: boolean
  onSelect: (bed: BedWithPatient) => void
  onEditStatus: (bed: BedWithPatient) => void
}

export function BedTile({
  bed,
  index,
  isSelected,
  onSelect,
  onEditStatus,
}: BedTileProps) {
  const reduceMotion = useReducedMotion()
  const styles = TILE_STATUS_STYLES[bed.status]
  const hasPatient = Boolean(bed.patient)

  return (
    <motion.div
      layout
      initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 14 }}
      animate={{
        opacity: 1,
        scale: isSelected ? 1.02 : 1,
        y: 0,
        ...(isSelected && !reduceMotion
          ? {
              filter: [
                "drop-shadow(0 0 0px rgba(37, 99, 235, 0))",
                "drop-shadow(0 0 14px rgba(37, 99, 235, 0.45))",
                "drop-shadow(0 0 0px rgba(37, 99, 235, 0))",
              ],
            }
          : { filter: "drop-shadow(0 0 0px rgba(0,0,0,0))" }),
      }}
      transition={{
        delay: reduceMotion ? 0 : 0.045 * index,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] as const,
        ...(isSelected && !reduceMotion
          ? {
              filter: {
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut" as const,
              },
            }
          : {}),
      }}
      className="h-full min-h-[200px] min-w-0"
    >
      <div key={bed.status} className="relative h-full">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground hover:text-foreground absolute top-3 right-3 z-10 size-9 rounded-xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm transition-shadow duration-300 hover:shadow-md"
          aria-label={`Update status for bed ${bed.code}`}
          onClick={(e) => {
            e.stopPropagation()
            onEditStatus(bed)
          }}
        >
          <Pencil className="size-4" />
        </Button>
        <motion.button
          type="button"
          whileTap={reduceMotion ? undefined : { scale: 0.99 }}
          transition={{ type: "spring", stiffness: 520, damping: 28 }}
          onClick={() => onSelect(bed)}
          className={cn(
            "border-border/70 flex h-full min-h-[200px] w-full min-w-0 flex-col rounded-2xl border bg-gradient-to-br text-left shadow-sm ring-1",
            "pt-14 pr-14 pb-6 pl-6 transition-all duration-300 ease-in-out",
            "hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/8",
            "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none",
            styles.ring,
            styles.bg,
            isSelected &&
              "ring-offset-background shadow-xl shadow-blue-500/15 ring-2 ring-blue-500 ring-offset-2"
          )}
        >
          <div className="flex min-h-0 flex-1 flex-col space-y-3">
            <header className="space-y-2">
              <p className="text-foreground text-xl font-semibold tracking-tight">
                {bed.code}
              </p>
              <div
                className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200/60 bg-white/60 px-2.5 py-1"
                aria-label={`Status: ${STATUS_LABEL[bed.status]}`}
              >
                <span
                  className={cn("size-2 shrink-0 rounded-full", styles.dot)}
                  aria-hidden
                />
                <span
                  className={cn(
                    "text-[11px] font-semibold tracking-wide uppercase",
                    styles.accent
                  )}
                >
                  {STATUS_LABEL[bed.status]}
                </span>
              </div>
            </header>

            {hasPatient && bed.patient ? (
              <>
                <div
                  className="bg-border/50 h-px w-full shrink-0"
                  aria-hidden
                />
                <div className="min-w-0 flex-1 space-y-3">
                  <div>
                    <p className="text-foreground text-sm font-medium leading-snug">
                      {bed.patient.full_name}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {bed.status === "occupied"
                        ? "Patient on this bed"
                        : "Assigned to this bed"}
                    </p>
                  </div>
                  <dl className="space-y-2.5">
                    <div>
                      <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                        Admitted
                      </dt>
                      <dd className="text-foreground mt-0.5 text-sm">
                        {formatDate(bed.patient.admission_date)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                        Condition
                      </dt>
                      <dd className="text-foreground mt-0.5 text-sm leading-snug">
                        {bed.patient.condition_category ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                        Doctor
                      </dt>
                      <dd className="text-foreground mt-0.5 text-sm leading-snug">
                        {bed.patient.doctor_name ?? "—"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </>
            ) : (
              <div className="mt-auto flex min-h-[4.5rem] flex-col justify-end space-y-3">
                <div className="bg-border/50 h-px w-full" aria-hidden />
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Select to sync with a participant. Use the pencil to update
                  bed status.
                </p>
              </div>
            )}
          </div>
        </motion.button>
      </div>
    </motion.div>
  )
}
