import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { motion, useReducedMotion } from "framer-motion"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { BedWithPatient, PatientRow } from "@/types/bed"

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

function patientDetailRows(patient: PatientRow) {
  const rows: { label: string; value: ReactNode }[] = [
    { label: "Name", value: patient.full_name },
  ]
  if (patient.patient_code) {
    rows.push({ label: "Patient ID", value: patient.patient_code })
  }
  if (patient.gender) {
    rows.push({
      label: "Gender",
      value: <span className="capitalize">{patient.gender}</span>,
    })
  }
  if (patient.admission_date) {
    rows.push({
      label: "Admission date",
      value: formatDate(patient.admission_date),
    })
  }
  if (patient.condition_category) {
    rows.push({ label: "Condition", value: patient.condition_category })
  }
  if (patient.doctor_name) {
    rows.push({ label: "Assigned doctor", value: patient.doctor_name })
  }
  return rows
}

type BedDetailModalProps = {
  bed: BedWithPatient | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEditStatus: (bed: BedWithPatient) => void
}

function DetailRow({
  label,
  value,
  isLast,
}: {
  label: string
  value: ReactNode
  isLast?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-6 py-2.5",
        !isLast && "border-b border-slate-100"
      )}
    >
      <span className="text-sm text-slate-500 shrink-0 pt-0.5">{label}</span>
      <span className="text-base font-medium text-slate-900 text-right min-w-0 leading-snug">
        {value}
      </span>
    </div>
  )
}

export function BedDetailModal({
  bed,
  open,
  onOpenChange,
  onEditStatus,
}: BedDetailModalProps) {
  const reduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!bed || !mounted || !open) return null

  const styles = TILE_STATUS_STYLES[bed.status]
  const statusLabel = STATUS_LABEL[bed.status]
  const hasPatient = Boolean(bed.patient)

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
      role="presentation"
    >
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[min(90vh,calc(100dvh-2rem))] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_25px_50px_-12px_rgba(15,23,42,0.18)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bed-detail-title"
      >
        <div className="flex min-h-0 max-h-[min(90vh,calc(100dvh-2rem))] flex-col overflow-hidden">
          {/* Header */}
          <div className="shrink-0 border-b border-slate-100 px-8 pt-8 pb-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <h2
                  id="bed-detail-title"
                  className="text-2xl font-bold tracking-tight text-slate-900"
                >
                  {bed.code}
                </h2>
                <div
                  className={cn(
                    "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1",
                    styles.badgeSurface
                  )}
                >
                  <span
                    className={cn("size-2 shrink-0 rounded-full", styles.dot)}
                    aria-hidden
                  />
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {statusLabel}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onOpenChange(false)}
                className="size-9 shrink-0 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="size-5" />
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Bed information
              </h3>
              <div>
                <DetailRow
                  label="Status"
                  value={statusLabel}
                  isLast={!bed.status_note}
                />
                {bed.status_note ? (
                  <DetailRow label="Note" value={bed.status_note} isLast />
                ) : null}
              </div>
            </div>

            {hasPatient && bed.patient ? (
              <div className="mt-8">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Patient information
                </h3>
                <div>
                  {patientDetailRows(bed.patient).map((r, i, arr) => (
                    <DetailRow
                      key={r.label}
                      label={r.label}
                      value={r.value}
                      isLast={i === arr.length - 1}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center">
                <p className="text-sm text-slate-500">No patient assigned</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-slate-100 bg-slate-50/50 px-8 pt-6 pb-8">
            <Button
              onClick={() => {
                onEditStatus(bed)
                onOpenChange(false)
              }}
              className="h-11 w-full rounded-xl text-base font-semibold shadow-sm"
            >
              Update bed status
            </Button>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}
