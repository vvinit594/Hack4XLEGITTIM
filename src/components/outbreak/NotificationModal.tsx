import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import type { AuthorityContact, OutbreakAlertState } from "@/types/outbreak"

type NotificationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  authority: AuthorityContact | null
  alert: OutbreakAlertState
  defaultMessage: string
  onSend: (payload: {
    authorityId: string
    message: string
    disease: string
    caseCount: number
    timeWindow: string
  }) => void
}

export function NotificationModal({
  open,
  onOpenChange,
  authority,
  alert,
  defaultMessage,
  onSend,
}: NotificationModalProps) {
  const reduceMotion = useReducedMotion()
  const [message, setMessage] = useState(defaultMessage)
  const [disease, setDisease] = useState(alert.disease)
  const [caseCount, setCaseCount] = useState(String(alert.casesInWindow))
  const [timeWindow, setTimeWindow] = useState(alert.windowLabel)

  useEffect(() => {
    if (open) {
      setMessage(defaultMessage)
      setDisease(alert.disease)
      setCaseCount(String(alert.casesInWindow))
      setTimeWindow(alert.windowLabel)
    }
  }, [open, defaultMessage, alert])

  const handleSend = () => {
    if (!authority) return
    const n = Number.parseInt(caseCount, 10)
    onSend({
      authorityId: authority.id,
      message,
      disease,
      caseCount: Number.isNaN(n) ? alert.casesInWindow : n,
      timeWindow,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open && authority !== null} onOpenChange={onOpenChange}>
      {authority ? (
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Official notification — {authority.shortName}
            </DialogTitle>
            <DialogDescription>
              Review and edit the auto-generated outbreak notice before
              transmission. {authority.channel}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="border-input bg-background focus-visible:ring-ring w-full resize-y rounded-xl border px-3 py-2.5 text-sm outline-none focus-visible:ring-2"
                aria-label="Notification message"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Disease
                </label>
                <input
                  value={disease}
                  onChange={(e) => setDisease(e.target.value)}
                  className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2"
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                  Case count
                </label>
                <input
                  type="number"
                  min={0}
                  value={caseCount}
                  onChange={(e) => setCaseCount(e.target.value)}
                  className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2"
                />
              </div>
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-semibold uppercase">
                Time window
              </label>
              <input
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
                className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-2"
              />
            </div>
          </div>

          <Separator />

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <motion.div whileTap={reduceMotion ? undefined : { scale: 0.97 }}>
              <Button
                type="button"
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 font-semibold shadow-md shadow-indigo-500/25"
                onClick={handleSend}
              >
                <Send className="mr-1.5 size-4" />
                Send
              </Button>
            </motion.div>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  )
}
