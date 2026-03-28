import { motion, useReducedMotion } from "framer-motion"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { InventoryItem } from "@/types/inventory"

import { InventoryStatusBadge } from "./status-styles"

type InventoryTableProps = {
  items: InventoryItem[]
  onOpenDetail: (item: InventoryItem) => void
  onReserve: (item: InventoryItem) => void
  onMarkInUse: (item: InventoryItem) => void
  onRelease: (item: InventoryItem) => void
}

export function InventoryTable({
  items,
  onOpenDetail,
  onReserve,
  onMarkInUse,
  onRelease,
}: InventoryTableProps) {
  const reduceMotion = useReducedMotion()

  if (items.length === 0) {
    return (
      <div className="border-border/80 text-muted-foreground rounded-2xl border border-dashed bg-slate-50/50 py-16 text-center text-sm font-medium">
        No equipment matches your filters.
      </div>
    )
  }

  return (
    <div className="border-border/80 hidden overflow-hidden rounded-2xl border bg-white shadow-sm lg:block">
      <div className="max-h-[min(70vh,720px)] overflow-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="bg-slate-50/95 sticky top-0 z-10 border-b border-slate-200/90 backdrop-blur-sm">
            <tr>
              <th className="text-muted-foreground px-4 py-3 text-xs font-bold tracking-wider uppercase">
                Equipment
              </th>
              <th className="text-muted-foreground px-4 py-3 text-xs font-bold tracking-wider uppercase">
                Category
              </th>
              <th className="text-muted-foreground px-4 py-3 text-xs font-bold tracking-wider uppercase">
                Ward
              </th>
              <th className="text-muted-foreground px-4 py-3 text-right text-xs font-bold tracking-wider uppercase">
                Total
              </th>
              <th className="text-muted-foreground px-4 py-3 text-right text-xs font-bold tracking-wider uppercase">
                Avail.
              </th>
              <th className="text-muted-foreground px-4 py-3 text-right text-xs font-bold tracking-wider uppercase">
                In use
              </th>
              <th className="text-muted-foreground px-4 py-3 text-right text-xs font-bold tracking-wider uppercase">
                Rsv.
              </th>
              <th className="text-muted-foreground px-4 py-3 text-xs font-bold tracking-wider uppercase">
                Status
              </th>
              <th className="text-muted-foreground px-4 py-3 text-xs font-bold tracking-wider uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <motion.tr
                key={row.id}
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.02 * i, duration: 0.25 }}
                className="border-border/60 hover:bg-slate-50/80 border-b transition-colors"
              >
                <td className="px-4 py-3 align-middle">
                  <button
                    type="button"
                    onClick={() => onOpenDetail(row)}
                    className="text-left font-semibold text-slate-900 transition-colors hover:text-indigo-600"
                  >
                    {row.name}
                    <span className="text-muted-foreground mt-0.5 block text-xs font-normal font-mono">
                      {row.sku}
                    </span>
                  </button>
                </td>
                <td className="text-muted-foreground px-4 py-3 align-middle">
                  {row.category}
                </td>
                <td className="text-muted-foreground px-4 py-3 align-middle">
                  {row.ward}
                </td>
                <td className="px-4 py-3 text-right align-middle font-semibold tabular-nums">
                  {row.total}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right align-middle font-semibold tabular-nums",
                    row.available <= row.lowStockThreshold && "text-red-600"
                  )}
                >
                  {row.available}
                </td>
                <td className="text-foreground px-4 py-3 text-right align-middle tabular-nums">
                  {row.inUse}
                </td>
                <td className="text-foreground px-4 py-3 text-right align-middle tabular-nums">
                  {row.reserved}
                </td>
                <td className="px-4 py-3 align-middle">
                  <InventoryStatusBadge status={row.status} />
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex flex-wrap items-center gap-1">
                    <Button
                      size="xs"
                      variant="outline"
                      className="shadow-sm transition-shadow hover:shadow-md"
                      disabled={row.available < 1}
                      onClick={() => onReserve(row)}
                    >
                      Reserve
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      className="shadow-sm transition-shadow hover:shadow-md"
                      disabled={row.available < 1}
                      onClick={() => onMarkInUse(row)}
                    >
                      In use
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="text-muted-foreground"
                      disabled={row.inUse < 1 && row.reserved < 1}
                      onClick={() => onRelease(row)}
                    >
                      Release
                    </Button>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      className="text-muted-foreground"
                      aria-label={`More for ${row.name}`}
                      onClick={() => onOpenDetail(row)}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
