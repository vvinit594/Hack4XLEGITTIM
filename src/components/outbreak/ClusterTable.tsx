import { motion, useReducedMotion } from "framer-motion"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DiseaseCluster, OutbreakRiskLevel } from "@/types/outbreak"

const RISK_BADGE: Record<
  OutbreakRiskLevel,
  { label: string; className: string }
> = {
  critical: {
    label: "Critical",
    className: "border-red-200 bg-red-50 text-red-800",
  },
  warning: {
    label: "Warning",
    className: "border-amber-200 bg-amber-50 text-amber-900",
  },
  safe: {
    label: "Safe",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
}

type ClusterTableProps = {
  clusters: DiseaseCluster[]
  className?: string
}

export function ClusterTable({ clusters, className }: ClusterTableProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div
      className={cn(
        "border-border/80 overflow-hidden rounded-2xl border bg-white shadow-sm",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="border-border/80 bg-slate-50/95 sticky top-0 border-b">
            <tr>
              <th className="text-muted-foreground px-4 py-3 text-xs font-bold tracking-wider uppercase">
                Disease
              </th>
              <th className="text-muted-foreground px-4 py-3 text-xs font-bold tracking-wider uppercase">
                Cases
              </th>
              <th className="text-muted-foreground px-4 py-3 text-xs font-bold tracking-wider uppercase">
                Time window
              </th>
              <th className="text-muted-foreground px-4 py-3 text-xs font-bold tracking-wider uppercase">
                Ward
              </th>
              <th className="text-muted-foreground px-4 py-3 text-xs font-bold tracking-wider uppercase">
                Risk
              </th>
            </tr>
          </thead>
          <tbody>
            {clusters.map((row, i) => {
              const rb = RISK_BADGE[row.risk]
              return (
                <motion.tr
                  key={row.id}
                  initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduceMotion ? 0 : 0.04 * i, duration: 0.25 }}
                  className="border-border/60 hover:bg-slate-50/80 border-b transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {row.disease}
                  </td>
                  <td className="px-4 py-3 tabular-nums font-medium">
                    {row.cases}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {row.timeWindow}
                  </td>
                  <td className="text-muted-foreground px-4 py-3">{row.ward}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full text-[11px] font-bold tracking-wide uppercase",
                        rb.className
                      )}
                    >
                      {rb.label}
                    </Badge>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
