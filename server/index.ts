/**
 * Hospi-Track REST API — Prisma + PostgreSQL.
 * Dev: `npm run dev:api` (default port 3001). Vite proxies /api when VITE_API_URL is empty.
 */
import "dotenv/config"
import cors from "cors"
import express from "express"
import { PrismaClient, BedStatus } from "@prisma/client"

import { normalizeItem, type InventoryItem } from "../src/types/inventory"

const prisma = new PrismaClient()
const app = express()
const PORT = Number(process.env.PORT) || 3001

app.use(cors({ origin: true }))
app.use(express.json())

function patientToBedPayload(
  p: {
    id: string
    bedId: string | null
    fullName: string
    patientCode: string | null
    gender: string | null
    admissionDate: Date | null
    conditionCategory: string | null
    doctorName: string | null
  },
  bedId: string
) {
  return {
    id: p.id,
    bed_id: bedId,
    patient_code: p.patientCode,
    gender: p.gender as "male" | "female" | "other" | null,
    full_name: p.fullName,
    admission_date: p.admissionDate
      ? p.admissionDate.toISOString().slice(0, 10)
      : null,
    condition_category: p.conditionCategory,
    doctor_name: p.doctorName,
  }
}

function waitingToParticipant(p: {
  id: string
  patientCode: string | null
  fullName: string
  gender: string | null
  conditionCategory: string | null
  doctorName: string | null
}) {
  return {
    id: p.id,
    patient_code: p.patientCode ?? `P${p.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`,
    full_name: p.fullName,
    gender: p.gender as "male" | "female" | "other" | null,
    condition_category: p.conditionCategory,
    doctor_name: p.doctorName,
    bed_id: null,
    bed_code: null,
  }
}

function equipmentToDto(row: {
  id: string
  sku: string
  name: string
  category: string
  ward: string
  total: number
  available: number
  inUse: number
  reserved: number
  lowStockThreshold: number
  lastAudit: Date | null
  dailyUseAvg: number
}): InventoryItem {
  const lastAudit = row.lastAudit
    ? row.lastAudit.toISOString().slice(0, 10)
    : ""
  return normalizeItem({
    id: row.id,
    name: row.name,
    category: row.category as InventoryItem["category"],
    ward: row.ward as InventoryItem["ward"],
    sku: row.sku,
    total: row.total,
    available: row.available,
    inUse: row.inUse,
    reserved: row.reserved,
    lowStockThreshold: row.lowStockThreshold,
    lastAudit,
    dailyUseAvg: row.dailyUseAvg,
  })
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true })
})

app.get("/api/bed-board", async (_req, res) => {
  try {
    const beds = await prisma.bed.findMany({
      orderBy: { code: "asc" },
      include: { patient: true },
    })
    const waiting = await prisma.patient.findMany({
      where: { bedId: null },
      orderBy: { fullName: "asc" },
    })
    res.json({
      beds: beds.map((b) => ({
        id: b.id,
        code: b.code,
        status: b.status,
        status_note: b.statusNote,
        patient: b.patient ? patientToBedPayload(b.patient, b.id) : null,
      })),
      waitingPatients: waiting.map(waitingToParticipant),
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Failed to load bed board" })
  }
})

app.patch("/api/beds/:id/status", async (req, res) => {
  const bedId = req.params.id
  const status = req.body?.status as string | undefined
  const note = req.body?.note as string | undefined

  const allowed: BedStatus[] = [
    BedStatus.available,
    BedStatus.occupied,
    BedStatus.cleaning,
    BedStatus.reserved,
  ]
  if (!status || !allowed.includes(status as BedStatus)) {
    res.status(400).json({ error: "Invalid or missing status" })
    return
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (status === BedStatus.available) {
        await tx.patient.deleteMany({ where: { bedId } })
      }
      await tx.bed.update({
        where: { id: bedId },
        data: {
          status: status as BedStatus,
          statusNote: note ?? null,
        },
      })
    })
    res.status(204).end()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Failed to update bed" })
  }
})

app.get("/api/inventory", async (_req, res) => {
  try {
    const rows = await prisma.equipmentItem.findMany({
      orderBy: { sku: "asc" },
    })
    res.json({ items: rows.map(equipmentToDto) })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Failed to load inventory" })
  }
})

app.post("/api/inventory/:id/actions", async (req, res) => {
  const id = req.params.id
  const action = req.body?.action as string | undefined
  const allowed = ["reserve", "mark_in_use", "release"] as const
  if (!action || !allowed.includes(action as (typeof allowed)[number])) {
    res.status(400).json({ error: "Invalid action" })
    return
  }

  try {
    const next = await prisma.$transaction(async (tx) => {
      const row = await tx.equipmentItem.findUnique({ where: { id } })
      if (!row) return null

      let available = row.available
      let inUse = row.inUse
      let reserved = row.reserved

      if (action === "reserve") {
        if (available < 1) return { error: "No available units" as const }
        available -= 1
        reserved += 1
      } else if (action === "mark_in_use") {
        if (available < 1) return { error: "No available units" as const }
        available -= 1
        inUse += 1
      } else if (action === "release") {
        if (inUse > 0) {
          inUse -= 1
          available += 1
        } else if (reserved > 0) {
          reserved -= 1
          available += 1
        } else {
          return { error: "Nothing to release" as const }
        }
      }

      const updated = await tx.equipmentItem.update({
        where: { id },
        data: { available, inUse, reserved },
      })
      return { item: updated }
    })

    if (!next) {
      res.status(404).json({ error: "Not found" })
      return
    }
    if ("error" in next) {
      res.status(400).json({ error: next.error })
      return
    }
    res.json({ item: equipmentToDto(next.item) })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Action failed" })
  }
})

app.patch("/api/inventory/:id/total", async (req, res) => {
  const id = req.params.id
  const total = Number(req.body?.total)

  if (!Number.isFinite(total) || total < 1) {
    res.status(400).json({ error: "Invalid total" })
    return
  }

  try {
    const row = await prisma.equipmentItem.findUnique({ where: { id } })
    if (!row) {
      res.status(404).json({ error: "Not found" })
      return
    }
    const assigned = row.inUse + row.reserved
    if (total < assigned) {
      res.status(400).json({
        error: `Total must be at least ${assigned} (in use + reserved)`,
      })
      return
    }
    const updated = await prisma.equipmentItem.update({
      where: { id },
      data: { total, available: total - assigned },
    })
    res.json({ item: equipmentToDto(updated) })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Update failed" })
  }
})

app.listen(PORT, () => {
  console.log(`Hospi API listening on http://127.0.0.1:${PORT}`)
})
