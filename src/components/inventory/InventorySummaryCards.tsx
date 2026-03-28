import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Package,
  RefreshCw,
} from "lucide-react"

import { PremiumCard } from "@/components/inventory/PremiumCard"
import { cn } from "@/lib/utils"
import type { InventoryMetrics } from "@/types/inventory"

export type { InventoryMetrics }

type InventorySummaryCardsProps = {
  metrics: InventoryMetrics
}

const items: {
  key: keyof InventoryMetrics
  label: string
  icon: typeof Package
  iconWrap: string
  format?: (n: number) => string
}[] = [
  {
    key: "totalUnits",
    label: "Total equipment (units)",
    icon: Boxes,
    iconWrap:
      "bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-lg shadow-slate-900/20",
  },
  {
    key: "available",
    label: "Available",
    icon: CheckCircle2,
    iconWrap:
      "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25",
  },
  {
    key: "inUse",
    label: "In use",
    icon: RefreshCw,
    iconWrap:
      "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25",
  },
  {
    key: "reserved",
    label: "Reserved",
    icon: Package,
    iconWrap:
      "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25",
  },
  {
    key: "lowStockCount",
    label: "Low stock alerts",
    icon: AlertTriangle,
    iconWrap:
      "bg-gradient-to-br from-amber-500 to-red-600 text-white shadow-lg shadow-amber-500/25",
  },
]

export function InventorySummaryCards({ metrics }: InventorySummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map(({ key, label, icon: Icon, iconWrap }) => (
        <PremiumCard key={key} className="min-h-[7.5rem]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                {label}
              </p>
              <p
                className={cn(
                  "mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums",
                  key === "lowStockCount" && metrics.lowStockCount > 0 && "text-red-600"
                )}
              >
                {metrics[key]}
              </p>
            </div>
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                iconWrap
              )}
            >
              <Icon className="size-5" aria-hidden />
            </span>
          </div>
        </PremiumCard>
      ))}
    </div>
  )
}
