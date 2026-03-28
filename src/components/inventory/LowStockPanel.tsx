import { motion, useReducedMotion } from "framer-motion"
import { AlertTriangle, ChevronRight } from "lucide-react"

import { AnimatedBorderCard } from "@/components/ui/AnimatedBorderCard"
import { Button } from "@/components/ui/button"
import type { InventoryItem } from "@/types/inventory"

type LowStockPanelProps = {
  items: InventoryItem[]
  onSelect: (item: InventoryItem) => void
}

export function LowStockPanel({ items, onSelect }: LowStockPanelProps) {
  const reduceMotion = useReducedMotion()
  const critical = items.filter((i) => i.available <= i.lowStockThreshold)

  if (critical.length === 0) {
    return (
      <div className="border-border/80 text-muted-foreground rounded-2xl border border-dashed bg-emerald-50/30 px-4 py-8 text-center text-sm font-medium">
        No active low-stock alerts. All monitored SKUs above threshold.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-5 text-red-600" aria-hidden />
        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          Low stock &amp; shortage watch
        </h2>
        <span className="bg-red-100 text-red-800 ml-auto rounded-full px-2.5 py-0.5 text-xs font-bold">
          {critical.length} active
        </span>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {critical.map((item) => (
          <li key={item.id}>
            <AnimatedBorderCard
              className="shadow-red-500/10 hover:shadow-red-500/15 shadow-md"
              innerClassName="border border-red-100/80 bg-gradient-to-br from-red-50/90 to-white p-0"
            >
              <motion.button
                type="button"
                initial={false}
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        boxShadow: [
                          "0 0 0 0px rgba(239, 68, 68, 0)",
                          "0 0 0 6px rgba(239, 68, 68, 0.12)",
                          "0 0 0 0px rgba(239, 68, 68, 0)",
                        ],
                      }
                }
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                onClick={() => onSelect(item)}
                className="flex w-full items-start gap-3 rounded-[0.9375rem] p-4 text-left transition-colors hover:bg-red-50/50"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white shadow-md shadow-red-500/30">
                  <AlertTriangle className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{item.name}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {item.ward} · threshold {item.lowStockThreshold}
                  </p>
                  <p className="mt-2 text-sm font-bold text-red-700">
                    {item.available} available · {item.total} total
                  </p>
                </div>
                <ChevronRight className="text-muted-foreground mt-1 size-4 shrink-0" />
              </motion.button>
            </AnimatedBorderCard>
          </li>
        ))}
      </ul>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-red-700"
          onClick={() => onSelect(critical[0])}
        >
          Open first alert
        </Button>
      </div>
    </div>
  )
}
