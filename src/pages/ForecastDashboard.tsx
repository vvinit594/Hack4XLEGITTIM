import { useState, useEffect, useCallback } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts"

import { BarChart2, RefreshCw, AlertTriangle, CheckCircle2, BrainCircuit, TrendingUp, Siren, LogOut, Users } from "lucide-react"

const AI_SERVICE_BASE = "http://localhost:8001"
const DEMO_WARD_ID = "00000000-0000-0000-0000-000000000001"

// ── Types ────────────────────────────────────────────────────────────────────

interface HourPrediction {
  hour: number
  datetime_utc: string
  predicted_occupancy: number
  confidence: number
  occupancy_pct: number
}

interface AiInsights {
  clinical_alert: string
  discharge_action: string
  staffing_advisory: string
}

interface ForecastResponse {
  ward_id: string
  generated_at: string
  predictions: HourPrediction[]
  summary: string
  insights: AiInsights
  high_risk_windows: { start: string; end: string; max_pct: number }[]
  peak_hour: HourPrediction
  model_version: string
}

interface WeekdayImpact {
  day_name: string
  avg_admissions: number
  vs_baseline_pct: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatHour(datetimeUtc: string): string {
  try {
    const d = new Date(datetimeUtc)
    const h = d.getUTCHours()
    const suffix = h >= 12 ? "PM" : "AM"
    const display = h % 12 === 0 ? 12 : h % 12
    return `${display}${suffix}`
  } catch {
    return `H${datetimeUtc}`
  }
}

function barColor(pct: number): string {
  if (pct >= 90) return "#ef4444"
  if (pct >= 80) return "#f59e0b"
  return "#22c55e"
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null
  const d = payload[0].payload as HourPrediction
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1f3c] p-3 text-sm shadow-xl">
      <p className="font-semibold text-white">{d.datetime_utc ? formatHour(d.datetime_utc) : ""}</p>
      <p className="text-slate-300">Beds: <span className="text-white font-bold">{d.predicted_occupancy}</span></p>
      <p className="text-slate-300">Capacity: <span className="text-white font-bold">{d.occupancy_pct}%</span></p>
      <p className="text-slate-300">Confidence: <span className="text-white font-bold">{((d.confidence ?? 0) * 100).toFixed(0)}%</span></p>
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent: string
}

function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className={`rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-sm`}>
      <p className="text-xs font-medium tracking-widest text-slate-400 uppercase">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

// ── Insight Card ──────────────────────────────────────────────────────────────

interface InsightCardProps {
  icon: React.ReactNode
  label: string
  text: string
  borderColor: string
  iconBg: string
  labelColor: string
}

function InsightCard({ icon, label, text, borderColor, iconBg, labelColor }: InsightCardProps) {
  return (
    <div className={`flex gap-3 rounded-2xl border ${borderColor} bg-white/[0.03] p-4`}>
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`mb-1 text-[10px] font-bold uppercase tracking-widest ${labelColor}`}>{label}</p>
        <p className="text-sm leading-snug text-slate-200">{text || "—"}</p>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ForecastDashboard() {
  const [forecast, setForecast] = useState<ForecastResponse | null>(null)
  const [weekday, setWeekday] = useState<WeekdayImpact[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [fRes, wRes] = await Promise.all([
        fetch(`${AI_SERVICE_BASE}/forecast/run/${DEMO_WARD_ID}`, { method: "POST" }),
        fetch(`${AI_SERVICE_BASE}/forecast/weekday/${DEMO_WARD_ID}`),
      ])

      if (!fRes.ok) {
        const errBody = await fRes.json().catch(() => ({}))
        throw new Error(errBody?.detail ?? `Forecast API error ${fRes.status}`)
      }

      const fData: ForecastResponse = await fRes.json()
      setForecast(fData)

      if (wRes.ok) {
        const wData: WeekdayImpact[] = await wRes.json()
        setWeekday(wData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Derived stats ──────────────────────────────────────────────────────────
  const predictions = forecast?.predictions ?? []
  const peakOccupancy = predictions.length
    ? Math.max(...predictions.map((p) => p.predicted_occupancy))
    : 0
  const peakPred = predictions.find((p) => p.predicted_occupancy === peakOccupancy)
  const peakTime = peakPred ? formatHour(peakPred.datetime_utc) : "—"
  const highRiskHours = predictions.filter((p) => p.occupancy_pct >= 90).length
  const avgConfidence = predictions.length
    ? Math.round((predictions.reduce((s, p) => s + p.confidence, 0) / predictions.length) * 100)
    : 0

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0a0f2c]">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-500" />
          <BrainCircuit className="h-8 w-8 text-violet-400" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-white">Running AI Forecast Pipeline</p>
          <p className="mt-1 text-sm text-slate-400">Training RandomForest · Generating Groq summary…</p>
        </div>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error && !forecast) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0f2c]">
        <AlertTriangle className="h-12 w-12 text-red-400" />
        <p className="text-lg font-semibold text-white">Forecast service unreachable</p>
        <p className="max-w-md text-center text-sm text-slate-400">{error}</p>
        <p className="text-xs text-slate-500">Make sure <code className="text-violet-400">python main.py</code> is running on port 8001</p>
        <button
          onClick={fetchAll}
          className="mt-2 flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    )
  }

  const hasHighRisk = highRiskHours > 0

  return (
    <div className="min-h-screen bg-[#0a0f2c] text-white">
      {/* ── Header ── */}
      <div className="border-b border-white/5 bg-white/[0.02] px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
              <BarChart2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                AI Patient Flow Forecast
              </h1>
              <p className="text-xs text-slate-400">
                24-hour bed demand prediction · Random Forest + Groq AI
              </p>
            </div>
          </div>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">

        {/* ── Stat Cards ── */}
        <div className="space-y-2">
          <p className="text-xs text-slate-500">A quick snapshot of what the AI predicts for the next 24 hours — how many beds will be in use, when it peaks, how many hours are dangerous, and how certain the model is.</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Peak Occupancy" value={`${peakOccupancy} beds`} sub={`of 40 total`} accent="text-violet-400" />
            <StatCard label="Peak Time" value={peakTime} sub="highest demand hour" accent="text-indigo-400" />
            <StatCard
              label="High Risk Hours"
              value={highRiskHours}
              sub="≥ 90% capacity"
              accent={highRiskHours > 0 ? "text-red-400" : "text-emerald-400"}
            />
            <StatCard label="Avg Confidence" value={`${avgConfidence}%`} sub="model certainty" accent="text-cyan-400" />
          </div>
        </div>

        {/* ── Alert Banner ── */}
        {hasHighRisk ? (
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
            <div>
              <p className="font-semibold text-red-300">HIGH RISK WINDOW DETECTED</p>
              <p className="text-sm text-red-400/80">
                {highRiskHours} hour{highRiskHours !== 1 ? "s" : ""} predicted above 90% capacity.
                {forecast?.high_risk_windows?.[0] && (
                  <> Starts around {formatHour(forecast.high_risk_windows[0].start)}.</>
                )}
                {" "}Initiate early discharge planning now to prevent patient overflow.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            <div>
              <p className="font-semibold text-emerald-300">Capacity Looks Manageable</p>
              <p className="text-sm text-emerald-400/80">No hours are predicted to exceed 90% bed capacity in the next 24 hours. Standard operations can continue.</p>
            </div>
          </div>
        )}

        {/* ── Bar Chart ── */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
          <div className="mb-1 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-violet-400" />
            <h2 className="text-sm font-semibold text-slate-200">24-Hour Occupancy Prediction</h2>
            <div className="ml-auto flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />Safe</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-amber-500" />Caution</span>
              <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-red-500" />High Risk</span>
            </div>
          </div>
          <p className="mb-4 text-xs text-slate-500">Each bar = 1 hour of the day. Height shows how many beds are predicted occupied. Hover any bar to see exact numbers. Red dashed line = 90% full (36 beds).</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={predictions} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
              <XAxis
                dataKey="datetime_utc"
                tickFormatter={formatHour}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "#ffffff10" }}
                tickLine={false}
                interval={2}
              />
              <YAxis
                domain={[0, 40]}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff08" }} />
              <ReferenceLine
                y={36}
                stroke="#ef4444"
                strokeDasharray="4 3"
                strokeWidth={1.5}
                label={{ value: "90% threshold", position: "insideTopRight", fill: "#ef4444", fontSize: 10 }}
              />
              <Bar dataKey="predicted_occupancy" radius={[4, 4, 0, 0]}>
                {predictions.map((p, i) => (
                  <Cell key={i} fill={barColor(p.occupancy_pct)} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Bottom Row: AI Insights + Weekday Table ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* AI Structured Insights */}
          <div className="rounded-2xl bg-gradient-to-br from-violet-900/50 to-indigo-900/50 border border-violet-500/20 p-5 backdrop-blur-sm">
            <div className="mb-1 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-violet-300" />
              <h2 className="text-sm font-semibold text-violet-200">AI Clinical Insights</h2>
              <span className="ml-auto rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-300">
                Gemini · 2.5-flash
              </span>
            </div>
            <p className="mb-4 text-xs text-slate-400">The AI has read the forecast and translated it into 3 plain-English actions — one for the medical team, one for bed management, and one for staffing.</p>
            <div className="space-y-3">
              <InsightCard
                icon={<Siren className="h-4 w-4 text-red-300" />}
                label="Clinical Alert"
                text={forecast?.insights?.clinical_alert ?? ""}
                borderColor="border-red-500/20"
                iconBg="bg-red-500/15"
                labelColor="text-red-400"
              />
              <InsightCard
                icon={<LogOut className="h-4 w-4 text-amber-300" />}
                label="Discharge Action"
                text={forecast?.insights?.discharge_action ?? ""}
                borderColor="border-amber-500/20"
                iconBg="bg-amber-500/15"
                labelColor="text-amber-400"
              />
              <InsightCard
                icon={<Users className="h-4 w-4 text-cyan-300" />}
                label="Staffing Advisory"
                text={forecast?.insights?.staffing_advisory ?? ""}
                borderColor="border-cyan-500/20"
                iconBg="bg-cyan-500/15"
                labelColor="text-cyan-400"
              />
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Generated {forecast?.generated_at ? new Date(forecast.generated_at).toLocaleTimeString() : "—"} · {forecast?.model_version ?? "rf-v1"}
            </p>
          </div>

          {/* Weekday Impact Table */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
            <h2 className="mb-1 text-sm font-semibold text-slate-200">Weekday Admission Patterns</h2>
            <p className="mb-4 text-xs text-slate-500">Based on 90 days of historical data — shows which days of the week tend to have more or fewer admissions compared to the weekly average. Red = busier than usual, green = quieter.</p>
            {weekday.length === 0 ? (
              <p className="text-sm text-slate-500">No weekday data available.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-slate-500">
                    <th className="pb-2 text-left font-medium">Day</th>
                    <th className="pb-2 text-right font-medium">Avg Admissions</th>
                    <th className="pb-2 text-right font-medium">vs Baseline</th>
                  </tr>
                </thead>
                <tbody>
                  {weekday.map((row) => (
                    <tr key={row.day_name} className="border-b border-white/5 last:border-0">
                      <td className="py-2 text-slate-300">{row.day_name}</td>
                      <td className="py-2 text-right text-slate-200">{row.avg_admissions}</td>
                      <td className={`py-2 text-right font-semibold ${row.vs_baseline_pct > 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {row.vs_baseline_pct > 0 ? "+" : ""}{row.vs_baseline_pct}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
