import { useCallback, useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Calendar, History, Info, RefreshCw, Server } from "lucide-react"
import { toast } from "sonner"

import { BrandLogo } from "@/components/brand/BrandLogo"
import { ForecastBadge } from "@/components/forecast/ForecastBadge"
import { CapacityWidget } from "@/components/forecast/CapacityWidget"
import { MetricCardsContainer } from "@/components/forecast/MetricCards"
import { AnimatedBorderCard } from "@/components/ui/AnimatedBorderCard"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ForecastApiError,
  getCachedForecast,
  getDemoWardId,
  getForecastHealth,
  getServiceHealth,
  getWeekdayImpact,
  loadForecastWithFallback,
  runForecast,
  saveForecast,
  type ForecastResponse,
  type WeekdayImpact,
} from "@/lib/forecast-api"
import {
  predictionsToCapacityWidgetData,
  predictionsToShiftMetrics,
} from "@/lib/forecast-ui-map"

const POLL_MS = 60_000

export function CapacityForecastPage() {
  const wardId = useMemo(() => getDemoWardId(), [])

  const [forecast, setForecast] = useState<ForecastResponse | null>(null)
  const [weekday, setWeekday] = useState<WeekdayImpact[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const applyForecast = useCallback((f: ForecastResponse) => {
    setForecast(f)
  }, [])

  const loadInitial = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { forecast: f, weekday: w } = await loadForecastWithFallback(wardId)
      applyForecast(f)
      setWeekday(w)
    } catch (e) {
      const msg =
        e instanceof ForecastApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Failed to load forecast"
      setError(msg)
      setForecast(null)
    } finally {
      setLoading(false)
    }
  }, [wardId, applyForecast])

  useEffect(() => {
    void loadInitial()
  }, [loadInitial])

  /** Soft refresh: prefer cache when tab visible (cheap). */
  useEffect(() => {
    if (!forecast) return

    const tick = () => {
      if (document.visibilityState !== "visible") return
      void getCachedForecast(wardId)
        .then((f) => applyForecast(f))
        .catch(() => undefined)
    }

    const id = window.setInterval(tick, POLL_MS)
    return () => window.clearInterval(id)
  }, [forecast, wardId, applyForecast])

  const handleRecalculate = async () => {
    setRefreshing(true)
    setError(null)
    try {
      const f = await runForecast(wardId)
      await saveForecast(wardId, f.predictions).catch(() => undefined)
      applyForecast(f)
      const w = await getWeekdayImpact(wardId).catch(() => weekday)
      setWeekday(w)
      toast.success("Forecast recalculated and saved.")
    } catch (e) {
      const msg =
        e instanceof ForecastApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Recalculate failed"
      setError(msg)
      toast.error(msg)
    } finally {
      setRefreshing(false)
    }
  }

  const capacityData = useMemo(
    () =>
      forecast
        ? predictionsToCapacityWidgetData(forecast.predictions)
        : {
            forecast_4h: 0,
            forecast_8h: 0,
            pct_4h: 0,
            pct_8h: 0,
            risk_level: "safe" as const,
          },
    [forecast]
  )

  const metrics = useMemo(
    () =>
      forecast
        ? predictionsToShiftMetrics(forecast.predictions)
        : { currentOccupied: 0, expectedDischarges: 0, expectedAdmissions: 0 },
    [forecast]
  )

  const insightText =
    forecast?.summary?.trim() ||
    [
      forecast?.insights?.clinical_alert,
      forecast?.insights?.discharge_action,
      forecast?.insights?.staffing_advisory,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Run a forecast to see AI-generated capacity guidance."

  if (loading) {
    return (
      <div className="relative flex min-h-svh flex-col overflow-x-hidden bg-[#FAFBFC]">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10">
          <div className="border-primary size-10 animate-spin rounded-full border-2 border-t-transparent" />
          <p className="text-muted-foreground text-sm font-medium">
            Loading forecast from BedPulse AI…
          </p>
        </div>
      </div>
    )
  }

  if (error && !forecast) {
    return (
      <div className="relative flex min-h-svh flex-col overflow-x-hidden bg-[#FAFBFC]">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
          <p className="text-lg font-semibold text-slate-900">
            Forecast service unavailable
          </p>
          <p className="text-muted-foreground max-w-md text-sm">{error}</p>
          <p className="text-muted-foreground text-xs">
            In dev, the Vite server proxies{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5">/bedpulse</code> to{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5">127.0.0.1:8001</code>.
            Run{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5">python main.py</code> in{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5">ai_service</code>, then
            restart <code className="rounded bg-slate-100 px-1.5 py-0.5">npm run dev</code> if
            you changed Vite config. For production, set{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5">VITE_AI_SERVICE_URL</code>.
          </p>
          <Button
            type="button"
            className="rounded-xl"
            onClick={() => void loadInitial()}
          >
            <RefreshCw className="mr-2 size-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-svh flex-col overflow-x-hidden bg-[#FAFBFC]">
      <div
        className="pointer-events-none absolute top-0 right-0 left-0 h-[400px] overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute top-[-20%] left-[60%] h-[600px] w-[600px] rounded-full bg-indigo-600 opacity-[0.03] blur-[100px]" />
        <div className="absolute top-[10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600 opacity-[0.02] blur-[80px]" />
      </div>

      <header className="relative z-10 p-6 pb-0 sm:p-10">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/90 bg-white px-2 shadow-md">
              <BrandLogo size="sm" className="max-h-8 max-w-[120px]" />
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Capacity Forecast
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 rounded-xl border-slate-200/80 bg-white shadow-sm hover:shadow-md"
                >
                  <History className="size-4 opacity-70" />
                  History
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Forecast snapshot</DialogTitle>
                  <DialogDescription>
                    Metadata for the forecast currently shown on this page.
                  </DialogDescription>
                </DialogHeader>
                {forecast ? (
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>
                      <span className="font-semibold">Generated:</span>{" "}
                      {new Date(forecast.generated_at).toLocaleString()}
                    </li>
                    <li>
                      <span className="font-semibold">Model:</span>{" "}
                      {forecast.model_version}
                    </li>
                    <li>
                      <span className="font-semibold">Horizons:</span>{" "}
                      {forecast.predictions.length} hourly points
                    </li>
                    <li>
                      <span className="font-semibold">High-risk windows:</span>{" "}
                      {forecast.high_risk_windows?.length ?? 0}
                    </li>
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">No data.</p>
                )}
              </DialogContent>
            </Dialog>

            <Button
              type="button"
              className="gap-2 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/20 hover:bg-indigo-700"
              disabled={refreshing}
              onClick={() => void handleRecalculate()}
            >
              <RefreshCw
                className={refreshing ? "size-4 animate-spin" : "size-4"}
              />
              Recalculate
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 p-6 pt-8 sm:p-10">
        <div className="mx-auto max-w-6xl">
          {error ? (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-900"
            >
              {error}{" "}
              <button
                type="button"
                className="font-semibold underline underline-offset-2"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </motion.div>
          ) : null}

          <AnimatePresence mode="wait">
            <ForecastBadge
              key={`${capacityData.pct_4h}-${capacityData.pct_8h}`}
              pct4h={capacityData.pct_4h}
              pct8h={capacityData.pct_8h}
            />
          </AnimatePresence>

          <CapacityWidget
            data={capacityData}
            key={forecast?.generated_at ?? "empty"}
          />

          <MetricCardsContainer
            currentOccupied={metrics.currentOccupied}
            expectedDischarges={metrics.expectedDischarges}
            expectedAdmissions={metrics.expectedAdmissions}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="mt-8"
          >
            <AnimatedBorderCard innerClassName="bg-slate-50/95 p-0">
              <div className="flex items-start gap-4 p-6">
                <div className="mt-0.5 rounded-lg border border-blue-200 bg-blue-100/80 p-2">
                  <Info className="size-4 text-blue-700" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="mb-2 text-sm font-bold text-slate-900">
                    Forecast insight
                  </h4>
                  <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                    {insightText}
                  </p>
                  {forecast?.insights ? (
                    <ul className="mt-4 space-y-2 border-t border-slate-200/80 pt-4 text-sm text-slate-700">
                      {forecast.insights.clinical_alert ? (
                        <li>
                          <span className="font-semibold text-red-700">
                            Clinical:
                          </span>{" "}
                          {forecast.insights.clinical_alert}
                        </li>
                      ) : null}
                      {forecast.insights.discharge_action ? (
                        <li>
                          <span className="font-semibold text-amber-800">
                            Discharge:
                          </span>{" "}
                          {forecast.insights.discharge_action}
                        </li>
                      ) : null}
                      {forecast.insights.staffing_advisory ? (
                        <li>
                          <span className="font-semibold text-cyan-800">
                            Staffing:
                          </span>{" "}
                          {forecast.insights.staffing_advisory}
                        </li>
                      ) : null}
                    </ul>
                  ) : null}
                </div>
              </div>
            </AnimatedBorderCard>
          </motion.div>

          {weekday.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <AnimatedBorderCard innerClassName="bg-white p-6">
                <h4 className="mb-3 text-sm font-bold text-slate-900">
                  Weekday admission pattern (90d)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[320px] text-sm">
                    <thead>
                      <tr className="text-muted-foreground border-b text-left text-xs font-bold tracking-wider uppercase">
                        <th className="pb-2">Day</th>
                        <th className="pb-2 text-right">Avg admissions</th>
                        <th className="pb-2 text-right">vs baseline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weekday.map((row) => (
                        <tr
                          key={row.day_name}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="py-2 font-medium">{row.day_name}</td>
                          <td className="py-2 text-right tabular-nums">
                            {row.avg_admissions}
                          </td>
                          <td
                            className={`py-2 text-right font-semibold tabular-nums ${
                              row.vs_baseline_pct > 0
                                ? "text-red-600"
                                : "text-emerald-600"
                            }`}
                          >
                            {row.vs_baseline_pct > 0 ? "+" : ""}
                            {row.vs_baseline_pct}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AnimatedBorderCard>
            </motion.div>
          ) : null}

          <div className="text-muted-foreground mt-12 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold tracking-wider uppercase">
                {forecast
                  ? `Updated ${new Date(forecast.generated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "No data"}
              </span>
            </div>
            <p className="flex items-center gap-1.5 text-xs font-medium italic opacity-70">
              <Calendar className="size-3" />
              Next refresh checks cache every {POLL_MS / 1000}s (tab visible)
            </p>
          </div>
        </div>
      </main>

      <footer className="relative z-10 mt-auto flex flex-col items-center justify-between gap-4 border-t border-slate-200/40 p-10 opacity-70 md:flex-row">
        <p className="text-muted-foreground text-xs font-medium">
          © 2026 Hospi-Track AI Predictive Systems
        </p>
        <div className="flex gap-6">
          <span className="text-xs font-bold text-slate-400 underline decoration-slate-200 underline-offset-4">
            Privacy Policy
          </span>
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="text-xs font-bold text-slate-400 underline decoration-slate-200 underline-offset-4"
              >
                System status
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Server className="size-4" />
                  BedPulse services
                </DialogTitle>
                <DialogDescription>
                  Health checks against the configured AI service URL.
                </DialogDescription>
              </DialogHeader>
              <StatusPanel />
            </DialogContent>
          </Dialog>
        </div>
      </footer>
    </div>
  )
}

function StatusPanel() {
  const [app, setApp] = useState<{ status?: string; service?: string } | null>(
    null
  )
  const [fc, setFc] = useState<{ status?: string; model_loaded?: boolean } | null>(
    null
  )
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setErr(null)
      try {
        const [a, f] = await Promise.all([
          getServiceHealth().catch(() => null),
          getForecastHealth().catch(() => null),
        ])
        if (!cancelled) {
          setApp(a)
          setFc(f)
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Health check failed")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return <p className="text-muted-foreground text-sm">Checking…</p>
  }
  if (err) {
    return <p className="text-destructive text-sm">{err}</p>
  }
  return (
    <ul className="space-y-2 text-sm text-slate-700">
      <li>
        <span className="font-semibold">API root:</span>{" "}
        {app?.status ?? app?.service ?? "unreachable"}
      </li>
      <li>
        <span className="font-semibold">Forecast module:</span>{" "}
        {fc?.status ?? "—"}
      </li>
      <li>
        <span className="font-semibold">Model on disk:</span>{" "}
        {fc?.model_loaded === true
          ? "yes"
          : fc?.model_loaded === false
            ? "no (trains on demand)"
            : "unknown"}
      </li>
    </ul>
  )
}
