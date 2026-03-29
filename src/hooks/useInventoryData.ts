import type { RealtimeChannel } from "@supabase/supabase-js"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { getSupabase } from "@/lib/supabase"
import { INVENTORY_SEED } from "@/lib/inventory-seed"
import { normalizeItem, type InventoryItem } from "@/types/inventory"

type ActionResult = { ok: true } | { ok: false; message: string }

type EquipmentRow = {
  id: string
  sku: string
  name: string
  category: string
  ward: string
  total: number
  available: number
  in_use: number
  reserved: number
  low_stock_threshold: number
  last_audit: string | null
  daily_use_avg: number
}

function rowToItem(row: EquipmentRow): InventoryItem {
  return normalizeItem({
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category as InventoryItem["category"],
    ward: row.ward as InventoryItem["ward"],
    total: row.total,
    available: row.available,
    inUse: row.in_use,
    reserved: row.reserved,
    lowStockThreshold: row.low_stock_threshold,
    lastAudit: row.last_audit ?? "",
    dailyUseAvg: row.daily_use_avg,
  })
}

export function useInventoryData() {
  const client = useMemo(() => getSupabase(), [])
  const isMock = client === null

  const [items, setItems] = useState<InventoryItem[]>(() =>
    isMock ? [...INVENTORY_SEED] : []
  )
  const [loading, setLoading] = useState(!isMock)
  const [error, setError] = useState<string | null>(null)

  const channelRef = useRef<RealtimeChannel | null>(null)

  const load = useCallback(async () => {
    if (!client) {
      setLoading(false)
      return
    }
    const { data, error: fetchErr } = await client
      .from("equipment_items")
      .select("*")
      .order("sku")
    setLoading(false)
    if (fetchErr) {
      setError(fetchErr.message)
      return
    }
    setItems((data as EquipmentRow[]).map(rowToItem))
    setError(null)
  }, [client])

  useEffect(() => {
    void load()
  }, [load])

  // Realtime subscription
  useEffect(() => {
    if (!client) return
    const ch = client
      .channel(`equipment:${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "equipment_items" }, () => {
        void load()
      })
      .subscribe()
    channelRef.current = ch
    return () => {
      ch.unsubscribe()
      channelRef.current = null
    }
  }, [client, load])

  const patchItem = useCallback((next: InventoryItem) => {
    setItems((prev) => prev.map((i) => (i.id === next.id ? next : i)))
  }, [])

  const reserve = useCallback(
    async (item: InventoryItem): Promise<ActionResult> => {
      if (!client) {
        if (item.available < 1) return { ok: false, message: "No available units to reserve." }
        patchItem({ ...item, available: item.available - 1, reserved: item.reserved + 1 })
        return { ok: true }
      }
      if (item.available < 1) return { ok: false, message: "No available units to reserve." }
      const { data, error: err } = await client
        .from("equipment_items")
        .update({ available: item.available - 1, reserved: item.reserved + 1 })
        .eq("id", item.id)
        .select()
        .single()
      if (err) return { ok: false, message: err.message }
      patchItem(rowToItem(data as EquipmentRow))
      return { ok: true }
    },
    [client, patchItem]
  )

  const markInUse = useCallback(
    async (item: InventoryItem): Promise<ActionResult> => {
      if (!client) {
        if (item.available < 1) return { ok: false, message: "No available units to mark in use." }
        patchItem({ ...item, available: item.available - 1, inUse: item.inUse + 1 })
        return { ok: true }
      }
      if (item.available < 1) return { ok: false, message: "No available units to mark in use." }
      const { data, error: err } = await client
        .from("equipment_items")
        .update({ available: item.available - 1, in_use: item.inUse + 1 })
        .eq("id", item.id)
        .select()
        .single()
      if (err) return { ok: false, message: err.message }
      patchItem(rowToItem(data as EquipmentRow))
      return { ok: true }
    },
    [client, patchItem]
  )

  const release = useCallback(
    async (item: InventoryItem): Promise<ActionResult> => {
      if (!client) {
        if (item.inUse > 0) {
          patchItem({ ...item, inUse: item.inUse - 1, available: item.available + 1 })
          return { ok: true }
        }
        if (item.reserved > 0) {
          patchItem({ ...item, reserved: item.reserved - 1, available: item.available + 1 })
          return { ok: true }
        }
        return { ok: false, message: "Nothing to release from in-use or reserved." }
      }
      if (item.inUse > 0) {
        const { data, error: err } = await client
          .from("equipment_items")
          .update({ in_use: item.inUse - 1, available: item.available + 1 })
          .eq("id", item.id)
          .select()
          .single()
        if (err) return { ok: false, message: err.message }
        patchItem(rowToItem(data as EquipmentRow))
        return { ok: true }
      }
      if (item.reserved > 0) {
        const { data, error: err } = await client
          .from("equipment_items")
          .update({ reserved: item.reserved - 1, available: item.available + 1 })
          .eq("id", item.id)
          .select()
          .single()
        if (err) return { ok: false, message: err.message }
        patchItem(rowToItem(data as EquipmentRow))
        return { ok: true }
      }
      return { ok: false, message: "Nothing to release from in-use or reserved." }
    },
    [client, patchItem]
  )

  const setTotal = useCallback(
    async (item: InventoryItem, nextTotal: number): Promise<ActionResult> => {
      if (!Number.isFinite(nextTotal) || nextTotal < 1)
        return { ok: false, message: "Invalid total." }
      const assigned = item.inUse + item.reserved
      if (nextTotal < assigned)
        return { ok: false, message: `Total must be at least ${assigned} (in use + reserved).` }

      if (!client) {
        patchItem({ ...item, total: nextTotal, available: nextTotal - assigned })
        return { ok: true }
      }
      const { data, error: err } = await client
        .from("equipment_items")
        .update({ total: nextTotal, available: nextTotal - assigned })
        .eq("id", item.id)
        .select()
        .single()
      if (err) return { ok: false, message: err.message }
      patchItem(rowToItem(data as EquipmentRow))
      return { ok: true }
    },
    [client, patchItem]
  )

  return {
    items,
    loading,
    error,
    reload: load,
    patchItem,
    reserve,
    markInUse,
    release,
    setTotal,
  }
}
