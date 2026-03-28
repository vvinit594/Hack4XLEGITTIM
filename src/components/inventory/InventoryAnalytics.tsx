import { BarChart3, TrendingUp } from "lucide-react"

import { PremiumCard } from "@/components/inventory/PremiumCard"
import { cn } from "@/lib/utils"
import type { InventoryItem } from "@/types/inventory"

type InventoryAnalyticsProps = {
  items: InventoryItem[]
}

export function InventoryAnalytics({ items }: InventoryAnalyticsProps) {
  const ranked = [...items]
    .sort((a, b) => b.dailyUseAvg - a.dailyUseAvg)
    .slice(0, 5)
  const maxUse = Math.max(...ranked.map((i) => i.dailyUseAvg), 1)

  const totalDaily = items.reduce((s, i) => s + i.dailyUseAvg, 0)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <PremiumCard className="lg:col-span-2">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
            <BarChart3 className="size-4" aria-hidden />
          </span>
          <div>
            <h3 className="text-foreground font-bold text-slate-900">
              Usage intensity
            </h3>
            <p className="text-muted-foreground text-xs">
              Estimated daily consumption (rolling average)
            </p>
          </div>
        </div>
        <ul className="space-y-3">
          {ranked.map((row) => {
            const pct = Math.round((row.dailyUseAvg / maxUse) * 100)
            return (
              <li key={row.id}>
                <div className="mb-1 flex justify-between gap-2 text-sm">
                  <span className="truncate font-medium text-slate-800">
                    {row.name}
                  </span>
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    {row.dailyUseAvg}/day
                  </span>
                </div>
                <div className="bg-muted h-2 overflow-hidden rounded-full">
                  <div
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </PremiumCard>

      <PremiumCard>
        <div className="mb-3 flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <TrendingUp className="size-4" aria-hidden />
          </span>
          <h3 className="text-foreground font-bold text-slate-900">
            Network demand
          </h3>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Combined modeled daily movement across all tracked SKUs.
        </p>
        <p className="mt-4 text-4xl font-bold tracking-tight text-slate-900 tabular-nums">
          {totalDaily.toFixed(1)}
        </p>
        <p className="text-muted-foreground text-xs font-medium uppercase">
          units / day (est.)
        </p>
        <div className="border-border/60 mt-4 border-t pt-4 text-xs text-slate-600">
          <p>
            Peak category:{" "}
            <span className="font-semibold text-slate-900">
              {
                [...items].sort(
                  (a, b) => b.dailyUseAvg - a.dailyUseAvg
                )[0]?.category
              }
            </span>
          </p>
        </div>
      </PremiumCard>
    </div>
  )
}
