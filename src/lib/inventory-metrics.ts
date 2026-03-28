import type { InventoryItem, InventoryMetrics } from "@/types/inventory"

export function computeInventoryMetrics(items: InventoryItem[]): InventoryMetrics {
  return {
    totalUnits: items.reduce((s, i) => s + i.total, 0),
    available: items.reduce((s, i) => s + i.available, 0),
    inUse: items.reduce((s, i) => s + i.inUse, 0),
    reserved: items.reduce((s, i) => s + i.reserved, 0),
    lowStockCount: items.filter(
      (i) => i.available <= i.lowStockThreshold
    ).length,
  }
}
