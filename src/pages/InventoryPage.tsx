import { useCallback, useMemo, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  Bell,
  Loader2,
  Package,
  Search as SearchIcon,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import { InventoryAnalytics } from "@/components/inventory/InventoryAnalytics"
import { InventoryCard } from "@/components/inventory/InventoryCard"
import {
  InventoryFilters,
  type InventoryFilterState,
} from "@/components/inventory/InventoryFilters"
import { InventoryModal } from "@/components/inventory/InventoryModal"
import { InventorySummaryCards } from "@/components/inventory/InventorySummaryCards"
import { InventoryTable } from "@/components/inventory/InventoryTable"
import { LowStockPanel } from "@/components/inventory/LowStockPanel"
import { Button } from "@/components/ui/button"
import { useInventoryData } from "@/hooks/useInventoryData"
import { computeInventoryMetrics } from "@/lib/inventory-metrics"
import type { InventoryItem } from "@/types/inventory"

const defaultFilters: InventoryFilterState = {
  search: "",
  category: "all",
  status: "all",
  ward: "all",
}

function matchesFilters(item: InventoryItem, f: InventoryFilterState): boolean {
  const q = f.search.trim().toLowerCase()
  if (q) {
    const hay = `${item.name} ${item.sku}`.toLowerCase()
    if (!hay.includes(q)) return false
  }
  if (f.category !== "all" && item.category !== f.category) return false
  if (f.status !== "all" && item.status !== f.status) return false
  if (f.ward !== "all" && item.ward !== f.ward) return false
  return true
}

export function InventoryPage() {
  const reduceMotion = useReducedMotion()
  const { items, loading, error, reserve, markInUse, release, setTotal } =
    useInventoryData()
  const [filters, setFilters] = useState<InventoryFilterState>(defaultFilters)
  const [detailId, setDetailId] = useState<string | null>(null)

  const detailItem = useMemo(
    () => (detailId ? (items.find((i) => i.id === detailId) ?? null) : null),
    [items, detailId]
  )

  const openDetail = useCallback((i: InventoryItem) => setDetailId(i.id), [])

  const filtered = useMemo(
    () => items.filter((i) => matchesFilters(i, filters)),
    [items, filters]
  )

  const metrics = useMemo(() => computeInventoryMetrics(items), [items])

  const handleReserve = useCallback(
    (item: InventoryItem) => {
      void (async () => {
        const r = await reserve(item)
        if (!r.ok) {
          toast.error(r.message)
          return
        }
        toast.success(`Reserved 1× ${item.name}`)
      })()
    },
    [reserve]
  )

  const handleMarkInUse = useCallback(
    (item: InventoryItem) => {
      void (async () => {
        const r = await markInUse(item)
        if (!r.ok) {
          toast.error(r.message)
          return
        }
        toast.success(`Marked 1× ${item.name} in use`)
      })()
    },
    [markInUse]
  )

  const handleRelease = useCallback(
    (item: InventoryItem) => {
      void (async () => {
        const r = await release(item)
        if (!r.ok) {
          toast.error(r.message)
          return
        }
        toast.success(`Released 1 unit — ${item.name}`)
      })()
    },
    [release]
  )

  const handleUpdateTotal = useCallback(
    (item: InventoryItem, nextTotal: number) => {
      void (async () => {
        const r = await setTotal(item, nextTotal)
        if (!r.ok) {
          toast.error(r.message)
          return
        }
        toast.success(`Updated total for ${item.name}`)
      })()
    },
    [setTotal]
  )

  return (
    <div className="bg-background flex min-h-0 flex-1 flex-col">
      <header className="border-border/80 bg-card/90 sticky top-0 z-20 border-b px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-w-0 items-center gap-3"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <Package className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h1 className="text-foreground truncate text-xl font-bold tracking-tight sm:text-2xl">
                Hospital inventory
              </h1>
              <p className="text-muted-foreground truncate text-xs sm:text-sm">
                Equipment, availability, and shortage monitoring
              </p>
            </div>
          </motion.div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="relative min-w-[200px] flex-1 lg:max-w-xs">
              <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <input
                type="search"
                placeholder="Global quick search…"
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-xl border pr-3 pl-10 text-sm outline-none focus-visible:ring-2"
                aria-label="Global search"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="rounded-xl shadow-sm"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl shadow-sm gap-2"
            >
              <UserRound className="size-4" />
              <span className="hidden sm:inline">Dr. Sharma</span>
            </Button>
          </div>
        </div>
      </header>

      {error ? (
        <div
          className="bg-destructive/10 text-destructive mx-auto mt-4 w-full max-w-7xl rounded-xl border border-red-200 px-4 py-3 text-sm"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:py-8">
        {loading && items.length === 0 ? (
          <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-3 py-24">
            <Loader2 className="size-8 animate-spin" aria-hidden />
            <p className="text-sm font-medium">Loading inventory…</p>
          </div>
        ) : (
          <>
            <InventorySummaryCards metrics={metrics} />

            <InventoryFilters value={filters} onChange={setFilters} />

            <section aria-labelledby="low-stock-heading">
              <h2 id="low-stock-heading" className="sr-only">
                Low stock alerts
              </h2>
              <LowStockPanel items={items} onSelect={openDetail} />
            </section>

            <section aria-labelledby="analytics-heading">
              <h2 id="analytics-heading" className="sr-only">
                Inventory analytics
              </h2>
              <InventoryAnalytics items={items} />
            </section>

            <section aria-labelledby="catalog-heading">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <h2
                  id="catalog-heading"
                  className="text-lg font-bold tracking-tight text-slate-900"
                >
                  Equipment catalog
                </h2>
                <p className="text-muted-foreground text-sm font-medium">
                  {filtered.length} of {items.length} SKUs
                </p>
              </div>

              <InventoryTable
                items={filtered}
                onOpenDetail={openDetail}
                onReserve={handleReserve}
                onMarkInUse={handleMarkInUse}
                onRelease={handleRelease}
              />

              <div className="mt-4 grid grid-cols-1 gap-4 lg:hidden">
                {filtered.map((item, i) => (
                  <InventoryCard
                    key={item.id}
                    item={item}
                    index={i}
                    onOpenDetail={openDetail}
                    onReserve={handleReserve}
                    onMarkInUse={handleMarkInUse}
                    onRelease={handleRelease}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>

      <InventoryModal
        item={detailItem}
        open={detailItem !== null}
        onOpenChange={(o) => {
          if (!o) setDetailId(null)
        }}
        onReserve={handleReserve}
        onMarkInUse={handleMarkInUse}
        onRelease={handleRelease}
        onUpdateTotal={handleUpdateTotal}
      />
    </div>
  )
}
