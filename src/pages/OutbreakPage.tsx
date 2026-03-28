import { useCallback, useMemo, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  Bell,
  Microscope,
  Search as SearchIcon,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

import { AuthorityCard } from "@/components/outbreak/AuthorityCard"
import { ClusterTable } from "@/components/outbreak/ClusterTable"
import { DetectionLogicPanel } from "@/components/outbreak/DetectionLogicPanel"
import { DiseaseChart } from "@/components/outbreak/DiseaseChart"
import { DiseaseMonitoringCards } from "@/components/outbreak/DiseaseMonitoringCards"
import { NotificationModal } from "@/components/outbreak/NotificationModal"
import { OutbreakBanner } from "@/components/outbreak/OutbreakBanner"
import {
  AUTHORITY_SEED,
  OUTBREAK_ALERT,
  OUTBREAK_CHART,
  OUTBREAK_CLUSTERS,
  OUTBREAK_METRICS,
  buildDefaultOutreachMessage,
} from "@/lib/outbreak-seed"
import type { AuthorityContact } from "@/types/outbreak"

export function OutbreakPage() {
  const reduceMotion = useReducedMotion()
  const [alert] = useState(OUTBREAK_ALERT)
  const [authorities, setAuthorities] = useState<AuthorityContact[]>(() => [
    ...AUTHORITY_SEED,
  ])
  const [modalOpen, setModalOpen] = useState(false)
  const [targetAuthority, setTargetAuthority] =
    useState<AuthorityContact | null>(null)

  const defaultMessage = useMemo(
    () => buildDefaultOutreachMessage(alert),
    [alert]
  )

  const openModalFor = useCallback((a: AuthorityContact) => {
    setTargetAuthority(a)
    setModalOpen(true)
  }, [])

  const markSent = useCallback((id: string, label: string) => {
    setAuthorities((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "sent" } : x))
    )
    toast.success(`Notification sent to ${label}`)
  }, [])

  const handleNotify = useCallback(
    (a: AuthorityContact) => {
      if (a.status === "sent") return
      openModalFor(a)
    },
    [openModalFor]
  )

  const handleSendReport = useCallback(
    (a: AuthorityContact) => {
      if (a.status === "sent") return
      openModalFor(a)
    },
    [openModalFor]
  )

  const handleModalSend = useCallback(
    (payload: {
      authorityId: string
      message: string
      disease: string
      caseCount: number
      timeWindow: string
    }) => {
      const a = authorities.find((x) => x.id === payload.authorityId)
      const label = a?.shortName ?? "authority"
      markSent(payload.authorityId, label)
    },
    [authorities, markSent]
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
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg shadow-red-500/30">
              <Microscope className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <h1 className="text-foreground truncate text-xl font-bold tracking-tight sm:text-2xl">
                Outbreak intelligence
              </h1>
              <p className="text-muted-foreground truncate text-xs sm:text-sm">
                Real-time detection · Government &amp; health authority routing
              </p>
            </div>
          </motion.div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="relative min-w-[200px] flex-1 lg:max-w-xs">
              <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <input
                type="search"
                placeholder="Search diseases, wards…"
                className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-xl border pr-3 pl-10 text-sm outline-none focus-visible:ring-2"
                aria-label="Search outbreak data"
              />
            </div>
            <motion.button
              type="button"
              className="border-input bg-background hover:bg-muted inline-flex size-9 items-center justify-center rounded-xl border shadow-sm transition-colors"
              aria-label="Alerts"
              whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            >
              <Bell className="size-4" />
            </motion.button>
            <motion.button
              type="button"
              className="border-input bg-background hover:bg-muted inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-medium shadow-sm transition-colors"
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              <UserRound className="size-4" />
              <span className="hidden sm:inline">Command</span>
            </motion.button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:py-8">
        <OutbreakBanner alert={alert} />

        <section aria-labelledby="monitor-heading">
          <h2 id="monitor-heading" className="sr-only">
            Disease monitoring
          </h2>
          <DiseaseMonitoringCards metrics={OUTBREAK_METRICS} />
        </section>

        <section aria-labelledby="trend-heading">
          <h2 id="trend-heading" className="sr-only">
            Trends
          </h2>
          <DiseaseChart data={OUTBREAK_CHART} />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-foreground mb-3 text-lg font-bold tracking-tight text-slate-900">
              Case clusters
            </h2>
            <ClusterTable clusters={OUTBREAK_CLUSTERS} />
          </div>
          <DetectionLogicPanel
            threshold={alert.threshold}
            windowLabel={alert.windowLabel}
          />
        </div>

        <section aria-labelledby="auth-heading">
          <div className="mb-4">
            <h2
              id="auth-heading"
              className="text-foreground text-lg font-bold tracking-tight text-slate-900"
            >
              Authorities &amp; statutory notification
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              One-click routing to municipal, food safety, district, and
              optional IHR channels.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {authorities.map((a, i) => (
              <AuthorityCard
                key={a.id}
                authority={a}
                index={i}
                onNotify={handleNotify}
                onSendReport={handleSendReport}
              />
            ))}
          </div>
        </section>
      </div>

      <NotificationModal
        open={modalOpen}
        onOpenChange={(o) => {
          setModalOpen(o)
          if (!o) setTargetAuthority(null)
        }}
        authority={targetAuthority}
        alert={alert}
        defaultMessage={defaultMessage}
        onSend={handleModalSend}
      />
    </div>
  )
}
