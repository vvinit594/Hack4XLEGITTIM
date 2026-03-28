import type { ReactNode } from "react"
import {
  Activity,
  Clock,
  ShieldAlert,
  TrendingUp,
} from "lucide-react"

import { PremiumCard } from "@/components/inventory/PremiumCard"
import { cn } from "@/lib/utils"
import type { OutbreakRiskLevel } from "@/types/outbreak"

export type DiseaseMonitoringMetrics = {
  totalActiveCases: number
  topDisease: string
  newCasesLast6h: number
  riskLevel: OutbreakRiskLevel
}

type DiseaseMonitoringCardsProps = {
  metrics: DiseaseMonitoringMetrics
}

function riskStyles(level: OutbreakRiskLevel) {
  switch (level) {
    case "critical":
      return {
        badge: "bg-red-100 text-red-800 border-red-200",
        label: "Critical",
      }
    case "warning":
      return {
        badge: "bg-amber-100 text-amber-900 border-amber-200",
        label: "Warning",
      }
    default:
      return {
        badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
        label: "Safe",
      }
  }
}

function StatCard({
  title,
  sub,
  icon: Icon,
  iconClass,
  children,
}: {
  title: string
  sub: string
  icon: typeof Activity
  iconClass: string
  children: ReactNode
}) {
  return (
    <PremiumCard className="min-h-[8.5rem]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            {title}
          </p>
          <div className="mt-1">{children}</div>
          <p className="text-muted-foreground mt-1 text-xs">{sub}</p>
        </div>
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            iconClass
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
      </div>
    </PremiumCard>
  )
}

export function DiseaseMonitoringCards({ metrics }: DiseaseMonitoringCardsProps) {
  const risk = riskStyles(metrics.riskLevel)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total active cases"
        sub="Across monitored wards"
        icon={Activity}
        iconClass="bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-lg shadow-slate-900/20"
      >
        <p className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
          {metrics.totalActiveCases}
        </p>
      </StatCard>
      <StatCard
        title="Most reported disease"
        sub="By admission & triage logs"
        icon={TrendingUp}
        iconClass="bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-red-500/25"
      >
        <p className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {metrics.topDisease}
        </p>
      </StatCard>
      <StatCard
        title="New cases (last 6h)"
        sub="Syndromic + confirmed"
        icon={Clock}
        iconClass="bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25"
      >
        <p className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
          {metrics.newCasesLast6h}
        </p>
      </StatCard>
      <StatCard
        title="Outbreak risk level"
        sub="Automated rules engine"
        icon={ShieldAlert}
        iconClass="bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
      >
        <span
          className={cn(
            "inline-flex w-fit rounded-full border px-3 py-1 text-sm font-bold",
            risk.badge
          )}
        >
          {risk.label}
        </span>
      </StatCard>
    </div>
  )
}
