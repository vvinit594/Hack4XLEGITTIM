import { deriveStatus, type InventoryItem } from "@/types/inventory"

function base(i: InventoryItem): Omit<InventoryItem, "status"> {
  const { status: _, ...rest } = i
  return rest
}

function commit(rest: Omit<InventoryItem, "status">): InventoryItem {
  return { ...rest, status: deriveStatus(rest) }
}

export function inventoryReserve(i: InventoryItem): InventoryItem | null {
  if (i.available < 1) return null
  return commit({
    ...base(i),
    available: i.available - 1,
    reserved: i.reserved + 1,
  })
}

export function inventoryMarkInUse(i: InventoryItem): InventoryItem | null {
  if (i.available < 1) return null
  return commit({
    ...base(i),
    available: i.available - 1,
    inUse: i.inUse + 1,
  })
}

export function inventoryRelease(i: InventoryItem): InventoryItem | null {
  if (i.inUse > 0) {
    return commit({
      ...base(i),
      inUse: i.inUse - 1,
      available: i.available + 1,
    })
  }
  if (i.reserved > 0) {
    return commit({
      ...base(i),
      reserved: i.reserved - 1,
      available: i.available + 1,
    })
  }
  return null
}

export function inventorySetTotal(i: InventoryItem, nextTotal: number): InventoryItem | null {
  if (nextTotal < 1 || !Number.isFinite(nextTotal)) return null
  const assigned = i.inUse + i.reserved
  if (nextTotal < assigned) return null
  return commit({
    ...base(i),
    total: nextTotal,
    available: nextTotal - assigned,
  })
}
