import { motion, useReducedMotion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { InventoryItem } from "@/types/inventory"

import { InventoryStatusBadge } from "./status-styles"

type InventoryCardProps = {
  item: InventoryItem
  index: number
  onOpenDetail: (item: InventoryItem) => void
  onReserve: (item: InventoryItem) => void
  onMarkInUse: (item: InventoryItem) => void
  onRelease: (item: InventoryItem) => void
}

export function InventoryCard({
  item,
  index,
  onOpenDetail,
  onReserve,
  onMarkInUse,
  onRelease,
}: InventoryCardProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.article
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : 0.04 * index, duration: 0.3 }}
      whileHover={
        reduceMotion ? undefined : { y: -2, transition: { duration: 0.2 } }
      }
      className="border-border/80 bg-card rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-lg hover:shadow-indigo-500/10"
    >
      <button
        type="button"
        onClick={() => onOpenDetail(item)}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-foreground font-semibold text-slate-900">
              {item.name}
            </h3>
            <p className="text-muted-foreground mt-0.5 font-mono text-xs">
              {item.sku}
            </p>
          </div>
          <InventoryStatusBadge status={item.status} />
        </div>
        <p className="text-muted-foreground mt-2 text-xs font-medium">
          {item.category} · {item.ward}
        </p>
      </button>

      <Separator className="my-3" />

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-muted-foreground text-xs font-medium uppercase">
            Total
          </dt>
          <dd className="font-semibold tabular-nums">{item.total}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs font-medium uppercase">
            Available
          </dt>
          <dd
            className={cn(
              "font-semibold tabular-nums",
              item.available <= item.lowStockThreshold && "text-red-600"
            )}
          >
            {item.available}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs font-medium uppercase">
            In use
          </dt>
          <dd className="font-semibold tabular-nums">{item.inUse}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-xs font-medium uppercase">
            Reserved
          </dt>
          <dd className="font-semibold tabular-nums">{item.reserved}</dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 min-w-[6rem] shadow-sm transition-shadow hover:shadow-md"
          disabled={item.available < 1}
          onClick={() => onReserve(item)}
        >
          Reserve
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 min-w-[6rem] shadow-sm transition-shadow hover:shadow-md"
          disabled={item.available < 1}
          onClick={() => onMarkInUse(item)}
        >
          Mark in use
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="flex-1 min-w-[6rem]"
          disabled={item.inUse < 1 && item.reserved < 1}
          onClick={() => onRelease(item)}
        >
          Release
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-indigo-600 flex-1 min-w-[6rem]"
          onClick={() => onOpenDetail(item)}
        >
          Details
        </Button>
      </div>
    </motion.article>
  )
}
