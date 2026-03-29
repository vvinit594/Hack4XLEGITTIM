import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { PremiumCard } from "@/components/inventory/PremiumCard"
import {
  ADMIN_CAMPUS_BEDS,
  ADMIN_MOCK_WARDS,
  occupancyStatusColor,
  shortWardLabel,
} from "@/lib/admin-dashboard-data"

const CHART_MOTION = { duration: 600, easing: "ease-out" as const }

const wardOccupancyData = ADMIN_MOCK_WARDS.slice(0, 4).map((w) => ({
  name: shortWardLabel(w.name),
  occupancy: w.occupancy,
  fill: occupancyStatusColor(w.occupancy),
}))

const bedUtilizationData = [
  {
    name: "Total beds",
    value: ADMIN_CAMPUS_BEDS.total,
    fill: "#94a3b8",
  },
  {
    name: "Occupied",
    value: ADMIN_CAMPUS_BEDS.occupied,
    fill: "#3b82f6",
  },
  {
    name: "Available",
    value: ADMIN_CAMPUS_BEDS.available,
    fill: "#22c55e",
  },
]

const criticalPerWardData = ADMIN_MOCK_WARDS.map((w) => ({
  name: shortWardLabel(w.name),
  /** Escalations + critical flag for demo storytelling */
  criticalLoad: w.isCritical ? w.alerts + 3 : w.alerts,
  fill: w.isCritical || w.alerts >= 4 ? "#ef4444" : w.alerts >= 2 ? "#f59e0b" : "#22c55e",
}))

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: {
    value: number
    name?: string
    dataKey?: string
    payload?: Record<string, string | number>
  }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const row = payload[0]
  const data = row.payload as
    | { name?: string; occupancy?: number; value?: number; criticalLoad?: number }
    | undefined
  const title = label ?? data?.name ?? row.name ?? "—"
  let detail = ""
  if (row.dataKey === "occupancy" || data?.occupancy != null) {
    detail = `${row.value}% occupancy`
  } else if (row.dataKey === "value" || data?.value != null) {
    detail = `${title}: ${row.value} beds`
  } else if (row.dataKey === "criticalLoad" || data?.criticalLoad != null) {
    detail = `Load index: ${row.value}`
  } else {
    detail = String(row.value)
  }
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-xs shadow-lg shadow-slate-900/10">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="text-slate-600">{detail}</p>
    </div>
  )
}

export function AdminAnalyticsCharts() {
  return (
    <section
      className="mb-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3"
      aria-label="Hospital analytics"
    >
      <PremiumCard className="min-h-[320px] lg:col-span-2 xl:col-span-1" innerClassName="bg-white p-5">
        <h3 className="text-sm font-extrabold tracking-tight text-slate-900">
          Ward occupancy
        </h3>
        <p className="text-muted-foreground mt-1 text-xs font-medium">
          Occupancy % by ward — green safe, yellow warning, red critical
        </p>
        <div className="mt-4 h-[240px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={wardOccupancyData}
              margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148, 163, 184, 0.12)" }} />
              <Bar
                dataKey="occupancy"
                radius={[8, 8, 0, 0]}
                maxBarSize={48}
                animationDuration={CHART_MOTION.duration}
                animationEasing={CHART_MOTION.easing}
              >
                {wardOccupancyData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PremiumCard>

      <PremiumCard className="min-h-[320px]" innerClassName="bg-white p-5">
        <h3 className="text-sm font-extrabold tracking-tight text-slate-900">
          Bed utilization
        </h3>
        <p className="text-muted-foreground mt-1 text-xs font-medium">
          Campus total vs occupied vs available beds
        </p>
        <div className="mt-4 h-[240px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={bedUtilizationData}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={88}
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148, 163, 184, 0.12)" }} />
              <Bar
                dataKey="value"
                radius={[0, 8, 8, 0]}
                barSize={28}
                animationDuration={CHART_MOTION.duration}
                animationEasing={CHART_MOTION.easing}
              >
                {bedUtilizationData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PremiumCard>

      <PremiumCard className="min-h-[320px] lg:col-span-2 xl:col-span-1" innerClassName="bg-white p-5">
        <h3 className="text-sm font-extrabold tracking-tight text-slate-900">
          Critical load by ward
        </h3>
        <p className="text-muted-foreground mt-1 text-xs font-medium">
          Escalations and critical pressure (demo metrics)
        </p>
        <div className="mt-4 h-[240px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={criticalPerWardData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-12}
                textAnchor="end"
                height={48}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148, 163, 184, 0.12)" }} />
              <Bar
                dataKey="criticalLoad"
                name="Load index"
                radius={[8, 8, 0, 0]}
                maxBarSize={36}
                animationDuration={CHART_MOTION.duration}
                animationEasing={CHART_MOTION.easing}
              >
                {criticalPerWardData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PremiumCard>
    </section>
  )
}
