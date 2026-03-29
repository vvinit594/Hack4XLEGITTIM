import { useState, type ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { AlertTriangle, Loader2, Wifi, WifiOff } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { usePatientFlowData } from "@/hooks/usePatientFlowData"
import { NoAvailableBedsError } from "@/lib/patient-flow-actions"
import {
  formatFlowTime,
  isDischargeEscalated,
} from "@/lib/patient-flow-utils"
import { cn } from "@/lib/utils"
import type { AdmissionQueueItem, FlowPatient } from "@/types/patient-flow"

function ConnectionChip({
  isMock,
  state,
}: {
  isMock: boolean
  state: string
}) {
  if (isMock) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/90 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
        <WifiOff className="size-3.5" aria-hidden />
        Demo mode
      </span>
    )
  }
  if (state === "reconnecting") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/90 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
        Reconnecting…
      </span>
    )
  }
  if (state === "connected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/90 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">
        <Wifi className="size-3.5" aria-hidden />
        Live
      </span>
    )
  }
  return (
    <span className="text-muted-foreground inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium">
      <Loader2 className="size-3.5 animate-spin" aria-hidden />
      Connecting…
    </span>
  )
}

function FlowColumn({
  title,
  subtitle,
  children,
  className,
  delay = 0,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  delay?: number
}) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: reduceMotion ? 0 : delay,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
      className={cn(
        "border-border/70 bg-card/40 flex min-h-0 flex-1 flex-col rounded-2xl border shadow-sm",
        "hover:shadow-md hover:shadow-indigo-500/5",
        className
      )}
    >
      <div className="border-border/60 border-b px-4 py-3 sm:px-5">
        <h2 className="text-foreground text-base font-bold tracking-tight">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-muted-foreground mt-0.5 text-xs">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-4">
        {children}
      </div>
    </motion.section>
  )
}

function PendingDischargeCard({
  patient,
  index,
  onDischarge,
  busy,
}: {
  patient: FlowPatient
  index: number
  onDischarge: () => void
  busy: boolean
}) {
  const reduceMotion = useReducedMotion()
  const escalated = isDischargeEscalated(patient)
  return (
    <motion.div
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
      transition={{
        delay: reduceMotion ? 0 : 0.05 * index,
        duration: 0.35,
        ease: "easeOut",
      }}
      whileHover={
        reduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }
      }
      className="border-border/80 bg-background rounded-2xl border p-4 shadow-sm"
    >
      {escalated ? (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-200/90 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-950">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <span>
            Escalation: discharge ordered over 2h — patient may still be in
            bed.
          </span>
        </div>
      ) : null}
      <p className="text-foreground font-semibold">{patient.full_name}</p>
      <p className="text-muted-foreground mt-1 text-sm">
        {patient.condition_category ?? "—"}
      </p>
      <p className="text-muted-foreground mt-2 text-xs">
        Expected discharge:{" "}
        <span className="text-foreground font-medium">
          {formatFlowTime(patient.expected_discharge)}
        </span>
      </p>
      <motion.div
        className="mt-4"
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      >
        <Button
          type="button"
          size="sm"
          disabled={busy}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-semibold text-white shadow-md shadow-emerald-500/20 hover:shadow-lg"
          onClick={onDischarge}
        >
          {busy ? "Updating…" : "Mark discharged"}
        </Button>
      </motion.div>
    </motion.div>
  )
}

function AwaitingCard({
  item,
  index,
  onArrived,
  busy,
}: {
  item: AdmissionQueueItem
  index: number
  onArrived: () => void
  busy: boolean
}) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
      transition={{
        delay: reduceMotion ? 0 : 0.05 * index,
        duration: 0.35,
        ease: "easeOut",
      }}
      whileHover={
        reduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }
      }
      className="border-border/80 bg-background rounded-2xl border p-4 shadow-sm"
    >
      <p className="text-foreground font-semibold">{item.patient_name}</p>
      <p className="text-muted-foreground mt-1 text-sm">
        Arrival:{" "}
        {item.arrival_type === "emergency" ? (
          <span className="font-medium text-red-600">Emergency</span>
        ) : (
          <span className="capitalize">{item.arrival_type}</span>
        )}
      </p>
      <p className="text-muted-foreground mt-2 text-xs">
        Expected: {formatFlowTime(item.expected_arrival)}
      </p>
      <motion.div
        className="mt-4"
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      >
        <Button
          type="button"
          size="sm"
          disabled={busy}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 font-semibold text-white shadow-md shadow-indigo-500/20 hover:shadow-lg"
          onClick={onArrived}
        >
          {busy ? "Assigning…" : "Mark arrived"}
        </Button>
      </motion.div>
    </motion.div>
  )
}

function ElectiveCard({ item, index }: { item: AdmissionQueueItem; index: number }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: reduceMotion ? 0 : 0.05 * index,
        duration: 0.35,
        ease: "easeOut",
      }}
      whileHover={
        reduceMotion ? undefined : { y: -2, transition: { duration: 0.2 } }
      }
      className="border-border/60 bg-muted/30 text-muted-foreground rounded-2xl border border-dashed p-4 shadow-sm"
    >
      <p className="text-foreground font-medium">{item.patient_name}</p>
      <p className="mt-1 text-xs">Elective pathway</p>
      <p className="mt-2 text-xs">
        Scheduled:{" "}
        <span className="text-foreground font-medium">
          {formatFlowTime(item.expected_arrival)}
        </span>
      </p>
    </motion.div>
  )
}

export function PatientFlowPage() {
  const {
    pendingDischarge,
    awaitingAdmission,
    electiveAdmissions,
    availableBedCount,
    loading,
    error,
    isMock,
    connectionState,
    markDischarged,
    markArrived,
  } = usePatientFlowData()

  const [busyId, setBusyId] = useState<string | null>(null)

  async function handleDischarge(p: FlowPatient) {
    setBusyId(p.id)
    try {
      await markDischarged(p)
      toast.success("Marked discharged — bed set to cleaning.", {
        description: `${p.full_name} removed from pending list.`,
      })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed")
    } finally {
      setBusyId(null)
    }
  }

  async function handleArrived(q: AdmissionQueueItem) {
    setBusyId(q.id)
    try {
      await markArrived(q)
      toast.success("Patient admitted — bed assigned.", {
        description: `${q.patient_name} linked to an available bed.`,
      })
    } catch (e) {
      if (e instanceof NoAvailableBedsError) {
        toast.warning(`⚠️ No beds available (${e.freeCount} free)`, {
          description: "Free a bed or complete cleaning before new admissions.",
        })
      } else {
        toast.error(e instanceof Error ? e.message : "Admission failed")
      }
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="bg-background flex min-h-0 flex-1 flex-col">
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 10% 0%, rgba(99,102,241,0.07), transparent 45%), radial-gradient(ellipse at 90% 100%, rgba(59,130,246,0.06), transparent 50%)",
        }}
        aria-hidden
      />

      <header className="border-border/60 bg-background/90 sticky top-0 z-10 border-b px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
              Patient flow
            </h1>
            <p className="text-muted-foreground mt-1 max-w-xl text-sm">
              Live movement: discharges, arrivals, and scheduled electives.
              Unique bed assignments are enforced in the database.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium">
              {availableBedCount} beds free
            </span>
            <ConnectionChip isMock={isMock} state={connectionState} />
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col p-4 sm:p-5 lg:p-6">
        {error && !isMock ? (
          <div
            className="bg-destructive/10 text-destructive mb-4 rounded-xl border border-red-200 px-4 py-3 text-sm font-medium"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="text-indigo-500 size-10 animate-spin" />
            <p className="text-sm font-medium">Loading flow data…</p>
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            <FlowColumn
              title="Pending discharge"
              subtitle="discharge_status = discharge_ordered"
              delay={0}
            >
              {pendingDischarge.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  No pending discharges.
                </p>
              ) : (
                <AnimatePresence mode="popLayout">
                  {pendingDischarge.map((p, i) => (
                    <PendingDischargeCard
                      key={p.id}
                      patient={p}
                      index={i}
                      busy={busyId === p.id}
                      onDischarge={() => void handleDischarge(p)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </FlowColumn>

            <FlowColumn
              title="Awaiting admission"
              subtitle="Queue · pending (non-elective)"
              delay={0.06}
            >
              {awaitingAdmission.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  No patients waiting.
                </p>
              ) : (
                <AnimatePresence mode="popLayout">
                  {awaitingAdmission.map((q, i) => (
                    <AwaitingCard
                      key={q.id}
                      item={q}
                      index={i}
                      busy={busyId === q.id}
                      onArrived={() => void handleArrived(q)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </FlowColumn>

            <FlowColumn
              title="Elective admissions"
              subtitle="Scheduled future arrivals"
              className="md:col-span-2 lg:col-span-1"
              delay={0.12}
            >
              {electiveAdmissions.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  No upcoming elective slots.
                </p>
              ) : (
                electiveAdmissions.map((e, i) => (
                  <ElectiveCard key={e.id} item={e} index={i} />
                ))
              )}
            </FlowColumn>
          </div>
        )}
      </div>
    </div>
  )
}
