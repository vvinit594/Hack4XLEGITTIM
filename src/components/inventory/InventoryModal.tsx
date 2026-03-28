import { useEffect, useState } from "react"
import { motion } from "framer-motion"

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
import { cn } from "@/lib/utils"
import type { InventoryItem } from "@/types/inventory"

import { InventoryStatusBadge } from "./status-styles"

type InventoryModalProps = {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onReserve: (item: InventoryItem) => void
  onMarkInUse: (item: InventoryItem) => void
  onRelease: (item: InventoryItem) => void
  onUpdateTotal: (item: InventoryItem, nextTotal: number) => void
}

export function InventoryModal({
  item,
  open,
  onOpenChange,
  onReserve,
  onMarkInUse,
  onRelease,
  onUpdateTotal,
}: InventoryModalProps) {
  const [totalInput, setTotalInput] = useState("")

  useEffect(() => {
    if (item) setTotalInput(String(item.total))
  }, [item])

  const assigned = item ? item.inUse + item.reserved : 0
  const minTotal = assigned

  const applyTotal = () => {
    if (!item) return
    const n = Number.parseInt(totalInput, 10)
    if (Number.isNaN(n)) return
    onUpdateTotal(item, n)
  }

  return (
    <Dialog open={open && item !== null} onOpenChange={onOpenChange}>
      {item ? (
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="text-xl">{item.name}</DialogTitle>
            <InventoryStatusBadge status={item.status} />
          </div>
          <DialogDescription className="font-mono text-xs">
            {item.sku} · {item.category} · {item.ward}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Total
            </p>
            <p className="text-2xl font-bold tabular-nums">{item.total}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Available
            </p>
            <p
              className={cn(
                "text-2xl font-bold tabular-nums",
                item.available <= item.lowStockThreshold && "text-red-600"
              )}
            >
              {item.available}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
            <p className="text-muted-foreground text-xs font-medium uppercase">
              In use
            </p>
            <p className="text-2xl font-bold tabular-nums">{item.inUse}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3">
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Reserved
            </p>
            <p className="text-2xl font-bold tabular-nums">{item.reserved}</p>
          </div>
        </div>

        <div className="text-muted-foreground space-y-1 text-xs">
          <p>
            Low-stock threshold:{" "}
            <span className="text-foreground font-semibold">
              {item.lowStockThreshold}
            </span>{" "}
            units
          </p>
          <p>Last audit: {item.lastAudit}</p>
          <p>Avg. daily use: {item.dailyUseAvg} units</p>
        </div>

        <Separator />

        <div>
          <p className="text-foreground mb-2 text-sm font-semibold">
            Update total count
          </p>
          <p className="text-muted-foreground mb-2 text-xs">
            Minimum {minTotal} (in use + reserved). Adds or removes unassigned
            stock.
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              min={minTotal}
              value={totalInput}
              onChange={(e) => setTotalInput(e.target.value)}
              className="border-input bg-background focus-visible:ring-ring h-9 flex-1 rounded-lg border px-3 text-sm outline-none focus-visible:ring-2"
              aria-label="New total count"
            />
            <Button type="button" onClick={applyTotal}>
              Apply
            </Button>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <motion.div
            className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap"
            initial={false}
          >
            <Button
              variant="outline"
              className="shadow-sm transition-shadow hover:shadow-md"
              disabled={item.available < 1}
              onClick={() => onReserve(item)}
            >
              Reserve equipment
            </Button>
            <Button
              variant="outline"
              className="shadow-sm transition-shadow hover:shadow-md"
              disabled={item.available < 1}
              onClick={() => onMarkInUse(item)}
            >
              Mark in use
            </Button>
            <Button
              variant="secondary"
              disabled={item.inUse < 1 && item.reserved < 1}
              onClick={() => onRelease(item)}
            >
              Release
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
      ) : null}
    </Dialog>
  )
}
