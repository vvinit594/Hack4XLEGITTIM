import { motion, useReducedMotion } from "framer-motion"
import { CheckCircle2, Landmark, Send } from "lucide-react"

import { PremiumCard } from "@/components/inventory/PremiumCard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AuthorityContact } from "@/types/outbreak"

type AuthorityCardProps = {
  authority: AuthorityContact
  index: number
  onNotify: (a: AuthorityContact) => void
  onSendReport: (a: AuthorityContact) => void
}

export function AuthorityCard({
  authority,
  index,
  onNotify,
  onSendReport,
}: AuthorityCardProps) {
  const reduceMotion = useReducedMotion()
  const sent = authority.status === "sent"

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : 0.06 * index, duration: 0.35 }}
      whileHover={
        reduceMotion ? undefined : { y: -3, transition: { duration: 0.2 } }
      }
    >
      <PremiumCard
        className={cn(
          "h-full transition-shadow",
          sent && "opacity-90"
        )}
        innerClassName="p-0"
      >
        <div className="flex h-full flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-lg shadow-slate-900/30">
                <Landmark className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {authority.shortName}
                </p>
                <h3 className="text-foreground mt-0.5 text-base font-bold leading-snug text-slate-900">
                  {authority.fullName}
                </h3>
                <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                  {authority.role}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 rounded-full text-[10px] font-bold tracking-wide uppercase",
                sent
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-700"
              )}
            >
              {sent ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="size-3" />
                  Sent
                </span>
              ) : (
                "Ready"
              )}
            </Badge>
          </div>

          <p className="text-muted-foreground mt-3 border-t border-slate-100 pt-3 text-xs font-medium">
            <span className="text-foreground font-semibold">Channel:</span>{" "}
            {authority.channel}
          </p>

          <div className="mt-4 flex flex-1 flex-wrap gap-2">
            <motion.div
              className="flex flex-1 min-w-[8rem]"
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              <Button
                type="button"
                disabled={sent}
                onClick={() => onNotify(authority)}
                className="h-9 w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 font-semibold text-white shadow-md shadow-red-500/25 transition-shadow hover:shadow-lg hover:shadow-red-500/35 disabled:opacity-50"
              >
                <Send className="mr-1.5 size-4" />
                Notify now
              </Button>
            </motion.div>
            <Button
              type="button"
              variant="outline"
              disabled={sent}
              className="h-9 flex-1 min-w-[8rem] rounded-xl border-slate-200 shadow-sm transition-shadow hover:shadow-md"
              onClick={() => onSendReport(authority)}
            >
              Send report
            </Button>
          </div>
        </div>
      </PremiumCard>
    </motion.div>
  )
}
