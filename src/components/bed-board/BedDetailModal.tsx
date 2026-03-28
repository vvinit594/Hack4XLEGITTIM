import { motion, useReducedMotion } from "framer-motion"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { BedWithPatient } from "@/types/bed"

import { STATUS_LABEL, TILE_STATUS_STYLES } from "./status-styles"

type BedDetailModalProps = {
  bed: BedWithPatient | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditStatus: (bed: BedWithPatient) => void
}

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

export function BedDetailModal({
  bed,
  open,
  onOpenChange,
  onEditStatus,
}: BedDetailModalProps) {
  const reduceMotion = useReducedMotion()

  if (!bed) return null

  const styles = TILE_STATUS_STYLES[bed.status]
  const statusLabel = STATUS_LABEL[bed.status]
  const hasPatient = Boolean(bed.patient)

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={() => onOpenChange(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm",
          !open && "pointer-events-none"
        )}
        aria-hidden
      />

      {/* Modal */}
      <motion.div
        initial={
          reduceMotion
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.95, y: 20 }
        }
        animate={open ? { opacity: 1, scale: 1, y: 0 } : {}}
        exit={
          reduceMotion
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.95, y: 20 }
        }
        transition={{
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={cn(
          "fixed inset-x-4 top-1/2 z-50 w-auto max-h-[85vh] max-w-md -translate-y-1/2 transform rounded-2xl border border-slate-200/80 bg-white shadow-2xl sm:left-1/2 sm:right-auto sm:w-full sm:-translate-x-1/2",
          !open && "pointer-events-none"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className={cn("relative p-6 border-b boundary-slate-200/60")}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  {bed.code}
                </h2>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-slate-50 px-3 py-1.5">
                  <span
                    className={cn("size-2.5 shrink-0 rounded-full", styles.dot)}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "text-xs font-semibold tracking-wide uppercase",
                      styles.accent
                    )}
                  >
                    {statusLabel}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onOpenChange(false)}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Bed Status Section */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Bed Information
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Status</span>
                <span className={"text-sm font-medium " + styles.accent}>
                  {statusLabel}
                </span>
              </div>
              {bed.status_note && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Note: {bed.status_note}
                </p>
              )}
            </div>

            {/* Divider */}
            {hasPatient && <div className="h-px bg-slate-200/60" />}

            {/* Patient Section */}
            {hasPatient && bed.patient ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Patient Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Name
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {bed.patient.full_name}
                    </p>
                  </div>

                  {bed.patient.patient_code && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Patient ID
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {bed.patient.patient_code}
                      </p>
                    </div>
                  )}

                  {bed.patient.gender && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Gender
                      </p>
                      <p className="mt-1 text-sm text-foreground capitalize">
                        {bed.patient.gender}
                      </p>
                    </div>
                  )}

                  {bed.patient.admission_date && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Admission Date
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {formatDate(bed.patient.admission_date)}
                      </p>
                    </div>
                  )}

                  {bed.patient.condition_category && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Condition
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {bed.patient.condition_category}
                      </p>
                    </div>
                  )}

                  {bed.patient.doctor_name && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Assigned Doctor
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {bed.patient.doctor_name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No patient assigned</p>
              </div>
            )}
          </div>

          {/* Footer with Action Button */}
          <div className="border-t border-slate-200/60 p-4 sm:p-6 bg-slate-50/50">
            <Button
              onClick={() => {
                onEditStatus(bed)
                onOpenChange(false)
              }}
              className="w-full"
            >
              Update Bed Status
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
