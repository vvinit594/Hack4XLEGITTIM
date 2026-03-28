import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { InventoryRowStatus } from "@/types/inventory"

const LABEL: Record<InventoryRowStatus, string> = {
  available: "Available",
  in_use: "In use",
  reserved: "Reserved",
  low_stock: "Low stock",
}

const CLASS: Record<InventoryRowStatus, string> = {
  available:
    "border-emerald-200/80 bg-emerald-50 text-emerald-900 hover:bg-emerald-50",
  in_use: "border-blue-200/80 bg-blue-50 text-blue-900 hover:bg-blue-50",
  reserved:
    "border-violet-200/80 bg-violet-50 text-violet-900 hover:bg-violet-50",
  low_stock: "border-red-200/80 bg-red-50 text-red-800 hover:bg-red-50",
}

export function InventoryStatusBadge({
  status,
  className,
}: {
  status: InventoryRowStatus
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
        CLASS[status],
        className
      )}
    >
      {LABEL[status]}
    </Badge>
  )
}
