import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
  const [selected, setSelected] = useState<BedStatus | null>(null)
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (bed && open) {
      setSelected(bed.status)
      setNote(bed.status_note ?? "")
      setFormError(null)
    }
  }, [bed, open])

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton
        className="rounded-t-3xl border-t border-slate-200/90 bg-[#FAFBFC] px-0 pt-2 pb-6 sm:mx-auto sm:max-w-lg"
      >
        <SheetHeader className="px-6 pb-2">
          <SheetTitle className="text-xl font-bold tracking-tight">
            Update Bed Status
          </SheetTitle>
          <SheetDescription>
            {bed ? (
              <>
                Bed{" "}
                <span className="text-foreground font-semibold">{bed.code}</span>
              </>
            ) : (
              "Select a bed from the board."
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-5 px-6">
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
                  whileTap={
                    reduceMotion ? undefined : { scale: 0.98 }
                  }
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

        <SheetFooter className="mt-6 px-6 sm:flex-row sm:justify-end">
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
            whileHover={
              reduceMotion ? undefined : { scale: 1.02 }
            }
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
