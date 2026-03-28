import { Filter, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type {
  InventoryCategory,
  InventoryRowStatus,
  InventoryWard,
} from "@/types/inventory"

export type InventoryFilterState = {
  search: string
  category: InventoryCategory | "all"
  status: InventoryRowStatus | "all"
  ward: InventoryWard | "all"
}

type InventoryFiltersProps = {
  value: InventoryFilterState
  onChange: (next: InventoryFilterState) => void
  className?: string
}

const CATEGORIES: (InventoryCategory | "all")[] = [
  "all",
  "ICU",
  "General",
  "Emergency",
]

const STATUSES: (InventoryRowStatus | "all")[] = [
  "all",
  "available",
  "in_use",
  "reserved",
  "low_stock",
]

const WARDS: (InventoryWard | "all")[] = [
  "all",
  "Ward A",
  "Ward B",
  "Ward C",
  "Central Store",
  "OR Suite",
]

const selectClass =
  "border-input bg-background text-foreground focus-visible:ring-ring h-9 w-full min-w-0 rounded-lg border px-3 text-sm outline-none transition-shadow focus-visible:ring-2"

export function InventoryFilters({
  value,
  onChange,
  className,
}: InventoryFiltersProps) {
  const patch = (partial: Partial<InventoryFilterState>) =>
    onChange({ ...value, ...partial })

  const clear = () =>
    onChange({
      search: "",
      category: "all",
      status: "all",
      ward: "all",
    })

  const dirty =
    value.search !== "" ||
    value.category !== "all" ||
    value.status !== "all" ||
    value.ward !== "all"

  return (
    <div
      className={cn(
        "border-border/80 bg-card/80 rounded-2xl border p-4 shadow-sm backdrop-blur-sm sm:p-5",
        className
      )}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="text-foreground flex items-center gap-2 text-sm font-semibold">
          <Filter className="text-muted-foreground size-4" aria-hidden />
          Filters
        </div>
        {dirty ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-8 text-xs"
            onClick={clear}
          >
            Clear all
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-12 lg:gap-4">
        <div className="relative lg:col-span-4">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            type="search"
            placeholder="Search equipment name or SKU…"
            value={value.search}
            onChange={(e) => patch({ search: e.target.value })}
            className={cn(selectClass, "pl-10")}
            aria-label="Search inventory"
          />
        </div>
        <div className="lg:col-span-2">
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            Category
          </label>
          <select
            value={value.category}
            onChange={(e) =>
              patch({
                category: e.target.value as InventoryCategory | "all",
              })
            }
            className={selectClass}
            aria-label="Filter by category"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>
        </div>
        <div className="lg:col-span-2">
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            Status
          </label>
          <select
            value={value.status}
            onChange={(e) =>
              patch({
                status: e.target.value as InventoryRowStatus | "all",
              })
            }
            className={selectClass}
            aria-label="Filter by status"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "all"
                  ? "All statuses"
                  : s === "in_use"
                    ? "In use"
                    : s === "low_stock"
                      ? "Low stock"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="lg:col-span-4">
          <label className="text-muted-foreground mb-1 block text-xs font-medium">
            Ward / location
          </label>
          <select
            value={value.ward}
            onChange={(e) =>
              patch({ ward: e.target.value as InventoryWard | "all" })
            }
            className={selectClass}
            aria-label="Filter by ward"
          >
            {WARDS.map((w) => (
              <option key={w} value={w}>
                {w === "all" ? "All locations" : w}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
