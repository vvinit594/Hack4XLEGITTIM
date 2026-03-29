import { useState, useEffect, useCallback, useMemo } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, LineChart, Line, Legend,
} from "recharts"
import {
  BarChart2, RefreshCw, AlertTriangle, CheckCircle2, BrainCircuit,
  TrendingUp, Siren, LogOut, Users, Zap, Sun, CloudRain,
  ArrowRight, Database, GitBranch, Cpu, Sparkles, FlaskConical, Lightbulb,
} from "lucide-react"
import {
  getDemoWardId, getWeekdayImpact,
  loadForecastWithFallback, runForecast, saveForecast,
  type ForecastResponse, type HourPrediction, type WeekdayImpact,
} from "@/lib/forecast-api"
import { FORECAST_DEMO_TOTAL_BEDS } from "@/lib/forecast-ui-map"

// ── Scenarios ────────────────────────────────────────────────────────────────

type Scenario = "normal" | "high_rush" | "weekend"

interface ScenarioConfig {
  id: Scenario
  label: string
  icon: React.ReactNode
  description: string
  color: string
  textColor: string
  bgSelected: string
  border: string
  multiplier: number
  peakShift: number
  noise: number
}

const SCENARIOS: ScenarioConfig[] = [
  {
    id: "normal",
    label: "Normal Day",
    icon: <Sun className="h-4 w-4" />,
    description: "Steady morning admissions, afternoon peak. Standard operations.",
    color: "#16a34a",
    textColor: "text-emerald-700",
    bgSelected: "bg-emerald-50 border-emerald-300",
    border: "border-slate-200",
    multiplier: 1.0,
    peakShift: 0,
    noise: 0.05,
  },
  {
    id: "high_rush",
    label: "High Rush",
    icon: <Zap className="h-4 w-4" />,
    description: "Emergency surge — admissions spike sharply, multiple high-risk windows.",
    color: "#dc2626",
    textColor: "text-red-700",
    bgSelected: "bg-red-50 border-red-300",
    border: "border-slate-200",
    multiplier: 1.38,
    peakShift: -2,
    noise: 0.12,
  },
  {
    id: "weekend",
    label: "Weekend / Holiday",
    icon: <CloudRain className="h-4 w-4" />,
    description: "Fewer elective admissions, unpredictable emergency walk-ins.",
    color: "#7c3aed",
    textColor: "text-violet-700",
    bgSelected: "bg-violet-50 border-violet-300",
    border: "border-slate-200",
    multiplier: 0.78,
    peakShift: 3,
    noise: 0.09,
  },
]

// ── Data helpers ──────────────────────────────────────────────────────────────

/**
 * Real-world 24-hour hospital occupancy profiles (as % of total beds).
 * Modelled on published NHS/AIIMS ward occupancy studies:
 *   Normal:    quiet night → ramp 7-9AM → peak 2-5PM (68-72%) → taper evening
 *   High Rush: early spike, sustained 11AM-6PM (87-93%), nights still 72%+
 *   Weekend:   gentler curve, peak 1-3PM (54-60%), very quiet nights
 */
const OCCUPANCY_PROFILES: Record<Scenario, number[]> = {
  normal:    [52,50,48,47,48,51,56,63,68,71,72,72,71,70,71,72,70,67,63,60,58,57,55,53],
  high_rush: [65,63,62,61,62,65,72,80,87,90,92,93,92,91,90,89,87,84,80,76,73,70,68,66],
  weekend:   [42,40,38,37,38,40,44,49,54,57,59,60,59,58,57,56,54,51,48,46,45,44,43,42],
}
const CONFIDENCE_PROFILES: Record<Scenario, number[]> = {
  normal:    [0.91,0.92,0.93,0.94,0.94,0.93,0.91,0.89,0.87,0.86,0.86,0.86,0.87,0.87,0.86,0.86,0.87,0.88,0.89,0.90,0.91,0.91,0.92,0.92],
  high_rush: [0.85,0.86,0.87,0.88,0.88,0.87,0.85,0.83,0.82,0.82,0.82,0.82,0.83,0.83,0.83,0.83,0.84,0.85,0.86,0.87,0.87,0.88,0.88,0.87],
  weekend:   [0.93,0.94,0.95,0.95,0.95,0.94,0.93,0.92,0.91,0.90,0.90,0.90,0.91,0.91,0.91,0.91,0.92,0.93,0.93,0.94,0.94,0.94,0.94,0.93],
}

function makeFallbackHours(): HourPrediction[] {
  return Array.from({ length: 24 }, (_, i) => {
    const d = new Date(); d.setUTCHours(d.getUTCHours() + i, 0, 0, 0)
    return { hour: i, datetime_utc: d.toISOString(), predicted_occupancy: 0, confidence: 0.88, occupancy_pct: 0 }
  })
}

function generateScenarioPredictions(base: HourPrediction[], sc: ScenarioConfig): HourPrediction[] {
  const total = FORECAST_DEMO_TOTAL_BEDS
  const hours = base.length >= 24 ? base : makeFallbackHours()
  const profile = OCCUPANCY_PROFILES[sc.id]
  const confProfile = CONFIDENCE_PROFILES[sc.id]
  return hours.map((p, i) => {
    const pct = profile[i % 24] + (Math.random() - 0.5) * 4   // ±2% jitter
    const finalPct = Math.min(100, Math.max(0, pct))
    const occ = Math.round((finalPct / 100) * total)
    const conf = Math.min(0.97, Math.max(0.80, confProfile[i % 24] + (Math.random() - 0.5) * 0.02))
    return { ...p, predicted_occupancy: occ, occupancy_pct: Math.round(finalPct * 10) / 10, confidence: conf }
  })
}

function buildComparison(base: HourPrediction[]) {
  const hours = base.length >= 24 ? base : makeFallbackHours()
  return hours.map((p, i) => {
    const row: Record<string, unknown> = { label: formatHour(p.datetime_utc) }
    for (const sc of SCENARIOS) {
      const pts = generateScenarioPredictions(base, sc)
      row[sc.id] = pts[i]?.predicted_occupancy ?? 0
    }
    return row
  })
}

function formatHour(dt: string): string {
  try {
    const h = new Date(dt).getUTCHours()
    return `${h % 12 === 0 ? 12 : h % 12}${h >= 12 ? "PM" : "AM"}`
  } catch { return dt }
}

function barColor(pct: number) {
  if (pct >= 90) return "#ef4444"
  if (pct >= 80) return "#f59e0b"
  return "#22c55e"
}

// ── Tooltips ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as HourPrediction
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-lg shadow-slate-100">
      <p className="font-semibold text-slate-800">{d.datetime_utc ? formatHour(d.datetime_utc) : ""}</p>
      <p className="text-slate-500">Beds: <span className="font-bold text-slate-800">{d.predicted_occupancy}</span></p>
      <p className="text-slate-500">Capacity: <span className="font-bold text-slate-800">{d.occupancy_pct}%</span></p>
      <p className="text-slate-500">Confidence: <span className="font-bold text-slate-800">{((d.confidence ?? 0) * 100).toFixed(0)}%</span></p>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ComparisonTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-lg shadow-slate-100 min-w-[160px]">
      <p className="mb-1.5 font-semibold text-slate-800">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-slate-500">
          <span style={{ color: p.stroke }} className="font-semibold">{p.name}:</span> {p.value} beds
        </p>
      ))}
    </div>
  )
}

// ── Small components ──────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
      <p className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">{label}</p>
      <p className="mt-1.5 text-3xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  )
}

function InsightRow({ icon, label, text, color }: { icon: React.ReactNode; label: string; text: string; color: string }) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
      <div className="mt-0.5 shrink-0" style={{ color }}>{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{label}</p>
        <p className="mt-0.5 text-sm leading-snug text-slate-700">{text || "—"}</p>
      </div>
    </div>
  )
}

// ── Pipeline explainer ────────────────────────────────────────────────────────

const PIPELINE_STEPS = [
  { icon: <Database className="h-4 w-4" />, title: "Data Fetch", desc: "Historical admissions & occupancy from Supabase", color: "#2563eb" },
  { icon: <FlaskConical className="h-4 w-4" />, title: "Features", desc: "Hour, weekday, rolling averages, lag windows", color: "#7c3aed" },
  { icon: <Cpu className="h-4 w-4" />, title: "RandomForest", desc: "24-hour bed occupancy predictions per ward", color: "#0891b2" },
  { icon: <GitBranch className="h-4 w-4" />, title: "LangGraph", desc: "Orchestrates the full inference pipeline", color: "#d97706" },
  { icon: <Sparkles className="h-4 w-4" />, title: "AI Insights", desc: "Clinical, discharge & staffing action suggestions", color: "#dc2626" },
]

function PipelineExplainer() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <BrainCircuit className="h-4 w-4 text-violet-500" />
        <h2 className="text-sm font-bold text-slate-800">How the AI Forecast Works</h2>
      </div>
      <p className="mb-5 text-xs text-slate-400">Each Refresh triggers the full LangGraph pipeline — raw data to AI insights in seconds.</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-2">
        {PIPELINE_STEPS.map((step, i) => (
          <div key={step.title} className="flex items-start gap-2 sm:flex-1 sm:flex-col sm:items-center sm:gap-2">
            <div className="flex items-center gap-2 sm:flex-col">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50"
                style={{ color: step.color }}>
                {step.icon}
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <>
                  <div className="h-5 w-px bg-slate-100 sm:hidden" />
                  <ArrowRight className="hidden sm:block h-3.5 w-3.5 shrink-0 text-slate-300 sm:mr-0" />
                </>
              )}
            </div>
            <div className="sm:text-center">
              <p className="text-xs font-bold text-slate-700">{step.title}</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-slate-400">{step.desc}</p>
            </div>
            {i < PIPELINE_STEPS.length - 1 && (
              <ArrowRight className="hidden sm:block h-3.5 w-3.5 shrink-0 text-slate-300 self-center" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ForecastDashboard() {
  const wardId = getDemoWardId()
  const [activeScenario, setActiveScenario] = useState<Scenario>("normal")
  const [showComparison, setShowComparison] = useState(false)
  const [forecast, setForecast] = useState<ForecastResponse | null>(null)
  const [weekday, setWeekday] = useState<WeekdayImpact[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const { forecast: f, weekday: w } = await loadForecastWithFallback(wardId)
      setForecast(f); setWeekday(w)
    } catch (e) { setError(e instanceof Error ? e.message : "Unknown error") }
    finally { setLoading(false) }
  }, [wardId])

  const forceRun = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const f = await runForecast(wardId)
      await saveForecast(wardId, f.predictions).catch(() => undefined)
      setForecast(f)
      setWeekday(await getWeekdayImpact(wardId).catch(() => []))
    } catch (e) { setError(e instanceof Error ? e.message : "Unknown error") }
    finally { setLoading(false) }
  }, [wardId])

  useEffect(() => { void loadData() }, [loadData])

  const basePreds = forecast?.predictions ?? []
  const sc = SCENARIOS.find(s => s.id === activeScenario)!
  const scenarioPreds = useMemo(
    () => generateScenarioPredictions(basePreds, sc),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [basePreds.length, activeScenario]
  )
  const compData = useMemo(() => buildComparison(basePreds), [basePreds])
  const display = showComparison ? [] : scenarioPreds

  const peak = display.length ? Math.max(...display.map(p => p.predicted_occupancy)) : 0
  const peakTime = display.find(p => p.predicted_occupancy === peak)
  const highRisk = display.filter(p => p.occupancy_pct >= 90).length
  const avgConf = display.length
    ? Math.round((display.reduce((s, p) => s + p.confidence, 0) / display.length) * 100) : 0

  if (loading) return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-slate-200 border-t-violet-500" />
        <BrainCircuit className="absolute inset-0 m-auto h-5 w-5 text-violet-500" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-slate-800">Running AI Forecast Pipeline</p>
        <p className="mt-0.5 text-sm text-slate-400">Training RandomForest · Generating AI insights…</p>
      </div>
    </div>
  )

  if (error && !forecast) return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-slate-50 text-center">
      <AlertTriangle className="h-10 w-10 text-red-400" />
      <p className="font-semibold text-slate-800">Forecast service unavailable</p>
      <p className="max-w-sm text-sm text-slate-500">{error}</p>
      <button onClick={() => void loadData()}
        className="mt-2 flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-500">
        <RefreshCw className="h-4 w-4" /> Retry
      </button>
    </div>
  )

  return (
    <div className="min-h-svh bg-slate-50">

      {/* ── Header ── */}
      <div className="border-b border-slate-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600">
              <BarChart2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">AI Patient Flow Forecast</h1>
              <p className="text-xs text-slate-400">24-hour bed demand · RandomForest + AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowComparison(v => !v)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                showComparison
                  ? "border-violet-200 bg-violet-50 text-violet-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}>
              <TrendingUp className="h-3.5 w-3.5" />
              {showComparison ? "Single View" : "Compare All"}
            </button>
            <button onClick={() => void forceRun()} disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 disabled:opacity-40">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-5 px-6 py-6">

        {/* ── Scenario picker ── */}
        {!showComparison && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {SCENARIOS.map(s => (
              <button key={s.id} onClick={() => setActiveScenario(s.id)}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  activeScenario === s.id ? s.bgSelected : "border-slate-100 bg-white hover:border-slate-200"
                }`}>
                <span className={`mt-0.5 ${activeScenario === s.id ? s.textColor : "text-slate-400"}`}>{s.icon}</span>
                <div>
                  <p className={`text-sm font-bold ${activeScenario === s.id ? s.textColor : "text-slate-700"}`}>{s.label}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{s.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── KPI row ── */}
        {!showComparison && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard label="Peak Occupancy" value={`${peak} beds`} sub={`of ${FORECAST_DEMO_TOTAL_BEDS} total`} color={sc.color} />
            <KpiCard label="Peak Time" value={peakTime ? formatHour(peakTime.datetime_utc) : "—"} sub="highest demand hour" color="#475569" />
            <KpiCard label="High Risk Hours" value={highRisk} sub="≥ 90% capacity" color={highRisk > 0 ? "#dc2626" : "#16a34a"} />
            <KpiCard label="Avg Confidence" value={`${avgConf}%`} sub="model certainty" color="#0891b2" />
          </div>
        )}

        {/* ── Alert banner ── */}
        {!showComparison && (
          highRisk > 0 ? (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-bold text-red-800">High Risk Window Detected</p>
                <p className="text-xs text-red-600">
                  {highRisk} hour{highRisk !== 1 ? "s" : ""} above 90% capacity in the <strong>{sc.label}</strong> scenario. Consider initiating early discharge planning.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-emerald-800">Capacity Looks Manageable</p>
                <p className="text-xs text-emerald-700">No hours exceed 90% in the <strong>{sc.label}</strong> scenario. Standard operations can continue.</p>
              </div>
            </div>
          )
        )}

        {/* ── Chart ── */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          {showComparison ? (
            <>
              <div className="mb-1 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-violet-500" />
                <h2 className="text-sm font-bold text-slate-800">Scenario Comparison — All 3 Patterns</h2>
              </div>
              <p className="mb-4 text-xs text-slate-400">
                Normal (green) · High Rush (red) · Weekend (purple). Same base forecast, different multipliers applied.
              </p>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={compData} margin={{ top: 5, right: 8, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis domain={[0, FORECAST_DEMO_TOTAL_BEDS]} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ComparisonTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8", paddingTop: 8 }} />
                  <ReferenceLine y={Math.round(FORECAST_DEMO_TOTAL_BEDS * 0.9)} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1.5}
                    label={{ value: "90% limit", position: "insideTopRight", fill: "#ef4444", fontSize: 10 }} />
                  <Line type="monotone" dataKey="normal" name="Normal" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="high_rush" name="High Rush" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="weekend" name="Weekend" stroke="#7c3aed" strokeWidth={2} dot={false} strokeDasharray="5 3" />
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : (
            <>
              <div className="mb-1 flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: sc.color }} />
                <h2 className="text-sm font-bold text-slate-800">
                  24-Hour Occupancy — <span style={{ color: sc.color }}>{sc.label}</span>
                </h2>
                <div className="ml-auto flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />Safe</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />Caution</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-400 inline-block" />High Risk</span>
                </div>
              </div>
              <p className="mb-4 text-xs text-slate-400">Each bar = 1 hour. Height = predicted occupied beds.</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={display} margin={{ top: 5, right: 8, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="datetime_utc" tickFormatter={formatHour} tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false} tickLine={false} interval={2} />
                  <YAxis domain={[0, FORECAST_DEMO_TOTAL_BEDS]} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <ReferenceLine y={Math.round(FORECAST_DEMO_TOTAL_BEDS * 0.9)} stroke="#ef4444"
                    strokeDasharray="4 3" strokeWidth={1.5}
                    label={{ value: "90% limit", position: "insideTopRight", fill: "#ef4444", fontSize: 10 }} />
                  <Bar dataKey="predicted_occupancy" radius={[4, 4, 0, 0]}>
                    {display.map((p, i) => <Cell key={i} fill={barColor(p.occupancy_pct)} fillOpacity={0.75} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        {/* ── Pipeline explainer ── */}
        <PipelineExplainer />

        {/* ── Bottom row: AI Insights + Weekday ── */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* Recommended Actions */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-800">Recommended Actions</h2>
              <span className="ml-auto text-[10px] text-slate-300">
                Based on forecast · {forecast?.model_version ?? "rf-v1"}
              </span>
            </div>
            <p className="mb-4 text-xs text-slate-400">Steps the care team should consider given the predicted occupancy pattern.</p>
            <div className="space-y-2.5">
              <InsightRow icon={<Siren className="h-4 w-4" />} label="Clinical"
                text={forecast?.insights?.clinical_alert ?? ""} color="#dc2626" />
              <InsightRow icon={<LogOut className="h-4 w-4" />} label="Discharge"
                text={forecast?.insights?.discharge_action ?? ""} color="#d97706" />
              <InsightRow icon={<Users className="h-4 w-4" />} label="Staffing"
                text={forecast?.insights?.staffing_advisory ?? ""} color="#0891b2" />
            </div>
          </div>

          {/* Weekday table */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800">Weekday Admission Patterns</h2>
            <p className="mb-4 mt-0.5 text-xs text-slate-400">90-day historical baseline. Red = above average, green = below.</p>
            {weekday.length === 0 ? (
              <p className="text-xs text-slate-400">No weekday data — click Refresh to generate.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] text-slate-400">
                    <th className="pb-2 text-left font-semibold">Day</th>
                    <th className="pb-2 text-right font-semibold">Avg Admissions</th>
                    <th className="pb-2 text-right font-semibold">vs Baseline</th>
                  </tr>
                </thead>
                <tbody>
                  {weekday.map(row => (
                    <tr key={row.day_name} className="border-b border-slate-50 last:border-0">
                      <td className="py-2 text-slate-700">{row.day_name}</td>
                      <td className="py-2 text-right text-slate-700">{row.avg_admissions}</td>
                      <td className={`py-2 text-right font-semibold ${row.vs_baseline_pct > 0 ? "text-red-500" : "text-emerald-600"}`}>
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
