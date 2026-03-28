export type InventoryCategory = "ICU" | "General" | "Emergency"

export type InventoryWard =
  | "Ward A"
  | "Ward B"
  | "Ward C"
  | "Central Store"
  | "OR Suite"

export type InventoryRowStatus =
  | "available"
  | "in_use"
  | "reserved"
  | "low_stock"

export type InventoryItem = {
  id: string
  name: string
  category: InventoryCategory
  ward: InventoryWard
  sku: string
  total: number
  available: number
  inUse: number
  reserved: number
  lowStockThreshold: number
  /** Primary status for filtering / badges */
  status: InventoryRowStatus
  lastAudit: string
  dailyUseAvg: number
}

export function deriveStatus(item: Omit<InventoryItem, "status">): InventoryRowStatus {
  if (item.available <= item.lowStockThreshold) return "low_stock"
  if (item.inUse >= item.reserved && item.inUse > 0) return "in_use"
  if (item.reserved > 0) return "reserved"
  return "available"
}

export function normalizeItem(
  item: Omit<InventoryItem, "status">
): InventoryItem {
  return { ...item, status: deriveStatus(item) }
}

export type InventoryMetrics = {
  totalUnits: number
  available: number
  inUse: number
  reserved: number
  lowStockCount: number
}
