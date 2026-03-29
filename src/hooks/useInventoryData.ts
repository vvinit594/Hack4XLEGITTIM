import { useCallback, useEffect, useMemo, useState } from "react"

import {
  inventoryMarkInUse,
  inventoryRelease,
  inventoryReserve,
  inventorySetTotal,
} from "@/lib/inventory-actions"
import { getHospiApiBase } from "@/lib/hospi-api"
import { INVENTORY_SEED } from "@/lib/inventory-seed"
import type { InventoryItem } from "@/types/inventory"

type ActionResult = { ok: true } | { ok: false; message: string }

export function useInventoryData() {
  const apiEnabled = useMemo(() => getHospiApiBase() !== undefined, [])

  const [items, setItems] = useState<InventoryItem[]>(() =>
    apiEnabled ? [] : [...INVENTORY_SEED]
  )
  const [loading, setLoading] = useState(apiEnabled)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!apiEnabled) {
      setLoading(false)
      return
    }
    const base = getHospiApiBase()!
    const prefix = base === "" ? "" : base
    try {
      const res = await fetch(`${prefix}/api/inventory`)
      if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`)
      const data = (await res.json()) as { items: InventoryItem[] }
      setItems(data.items ?? [])
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load inventory")
    } finally {
      setLoading(false)
    }
  }, [apiEnabled])

  useEffect(() => {
    void load()
  }, [load])

  const patchItem = useCallback((next: InventoryItem) => {
    setItems((prev) => prev.map((i) => (i.id === next.id ? next : i)))
  }, [])

  const reserve = useCallback(
    async (item: InventoryItem): Promise<ActionResult> => {
      if (!apiEnabled) {
        const next = inventoryReserve(item)
        if (!next) {
          return { ok: false, message: "No available units to reserve." }
        }
        patchItem(next)
        return { ok: true }
      }
      const base = getHospiApiBase()!
      const prefix = base === "" ? "" : base
      const res = await fetch(`${prefix}/api/inventory/${item.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reserve" }),
      })
      if (!res.ok) {
        const text = await res.text()
        let message = text
        try {
          const j = JSON.parse(text) as { error?: string }
          if (j.error) message = j.error
        } catch {
          /* use text */
        }
        return { ok: false, message: message || res.statusText }
      }
      const data = (await res.json()) as { item: InventoryItem }
      patchItem(data.item)
      return { ok: true }
    },
    [apiEnabled, patchItem]
  )

  const markInUse = useCallback(
    async (item: InventoryItem): Promise<ActionResult> => {
      if (!apiEnabled) {
        const next = inventoryMarkInUse(item)
        if (!next) {
          return { ok: false, message: "No available units to mark in use." }
        }
        patchItem(next)
        return { ok: true }
      }
      const base = getHospiApiBase()!
      const prefix = base === "" ? "" : base
      const res = await fetch(`${prefix}/api/inventory/${item.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_in_use" }),
      })
      if (!res.ok) {
        const text = await res.text()
        let message = text
        try {
          const j = JSON.parse(text) as { error?: string }
          if (j.error) message = j.error
        } catch {
          /* use text */
        }
        return { ok: false, message: message || res.statusText }
      }
      const data = (await res.json()) as { item: InventoryItem }
      patchItem(data.item)
      return { ok: true }
    },
    [apiEnabled, patchItem]
  )

  const release = useCallback(
    async (item: InventoryItem): Promise<ActionResult> => {
      if (!apiEnabled) {
        const next = inventoryRelease(item)
        if (!next) {
          return {
            ok: false,
            message: "Nothing to release from in-use or reserved.",
          }
        }
        patchItem(next)
        return { ok: true }
      }
      const base = getHospiApiBase()!
      const prefix = base === "" ? "" : base
      const res = await fetch(`${prefix}/api/inventory/${item.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "release" }),
      })
      if (!res.ok) {
        const text = await res.text()
        let message = text
        try {
          const j = JSON.parse(text) as { error?: string }
          if (j.error) message = j.error
        } catch {
          /* use text */
        }
        return { ok: false, message: message || res.statusText }
      }
      const data = (await res.json()) as { item: InventoryItem }
      patchItem(data.item)
      return { ok: true }
    },
    [apiEnabled, patchItem]
  )

  const setTotal = useCallback(
    async (item: InventoryItem, nextTotal: number): Promise<ActionResult> => {
      if (!apiEnabled) {
        const next = inventorySetTotal(item, nextTotal)
        if (!next) {
          return {
            ok: false,
            message: `Total must be at least ${item.inUse + item.reserved} (in use + reserved).`,
          }
        }
        patchItem(next)
        return { ok: true }
      }
      const base = getHospiApiBase()!
      const prefix = base === "" ? "" : base
      const res = await fetch(`${prefix}/api/inventory/${item.id}/total`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total: nextTotal }),
      })
      if (!res.ok) {
        const text = await res.text()
        let message = text
        try {
          const j = JSON.parse(text) as { error?: string }
          if (j.error) message = j.error
        } catch {
          /* use text */
        }
        return { ok: false, message: message || res.statusText }
      }
      const data = (await res.json()) as { item: InventoryItem }
      patchItem(data.item)
      return { ok: true }
    },
    [apiEnabled, patchItem]
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
