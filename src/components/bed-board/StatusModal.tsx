import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { motion, useReducedMotion } from "framer-motion"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { PatchBedStatusPayload } from "@/lib/beds-api"
import { cn } from "@/lib/utils"
import type { BedStatus, BedWithPatient } from "@/types/bed"

import { MODAL_STATUS_BUTTON } from "./status-styles"

const STATUSES: BedStatus[] = [
  "available",
  "occupied",
  "cleaning",
  "reserved",
]

type StatusModalProps = {
  bed: BedWithPatient | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (
    bedId: string,
    payload: PatchBedStatusPayload
  ) => Promise<void>
}

export function StatusModal({
  bed,
  open,
  onOpenChange,
  onConfirm,
}: StatusModalProps) {
  const reduceMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [selected, setSelected] = useState<BedStatus | null>(null)
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (bed && open) {
      setSelected(bed.status)
      setNote(bed.status_note ?? "")
      setFormError(null)
    }
  }, [bed, open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  async function handleConfirm() {
    if (!bed || !selected) return
    setSubmitting(true)
    setFormError(null)
    try {
      await onConfirm(bed.id, {
        status: selected,
        note: note.trim() || undefined,
      })
      onOpenChange(false)
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Update failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
      role="presentation"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-modal-heading"
        initial={
          reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }
        }
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[min(90vh,calc(100dvh-2rem))] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200/90 bg-[#FAFBFC] shadow-xl"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-3 right-3 z-10 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          onClick={() => onOpenChange(false)}
        >
          <X className="size-5" />
          <span className="sr-only">Close</span>
        </Button>

        <div className="px-6 pt-8 pb-2 pr-14">
          <h2
            id="status-modal-heading"
            className="text-xl font-bold tracking-tight text-slate-900"
          >
            Update Bed Status
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            {bed ? (
              <>
                Bed{" "}
                <span className="text-foreground font-semibold">{bed.code}</span>
              </>
            ) : (
              "Select a bed from the board."
            )}
          </p>
        </div>

        <div className="mt-4 space-y-5 px-6 pb-2">
          <div className="grid grid-cols-2 gap-3">
            {STATUSES.map((status) => {
              const cfg = MODAL_STATUS_BUTTON[status]
              const isActive = selected === status
              return (
                <motion.div
                  key={status}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : { scale: 1.02, transition: { duration: 0.2 } }
                  }
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                >
                  <button
                    type="button"
                    onClick={() => setSelected(status)}
                    className={cn(
                      "w-full rounded-2xl border-2 px-4 py-4 text-left text-sm font-semibold shadow-sm transition-all duration-300 ease-in-out",
                      cfg.className,
                      isActive &&
                        "ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#FAFBFC]"
                    )}
                  >
                    {cfg.label}
                  </button>
                </motion.div>
              )
            })}
          </div>

          <div>
            <label
              htmlFor="bed-status-note"
              className="text-muted-foreground mb-2 block text-xs font-medium tracking-wide uppercase"
            >
              Note (optional)
            </label>
            <textarea
              id="bed-status-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Handoff, isolation flags, equipment…"
              className="border-input bg-background focus-visible:ring-ring w-full resize-none rounded-xl border px-3 py-2.5 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            />
          </div>

          {formError ? (
            <p className="text-destructive text-sm font-medium" role="alert">
              {formError}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200/80 bg-white/50 px-6 py-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          >
            <Button
              type="button"
              disabled={!selected || submitting}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 font-semibold text-white shadow-md shadow-indigo-500/25 hover:shadow-lg"
              onClick={() => void handleConfirm()}
            >
              {submitting ? "Saving…" : "Confirm"}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}
