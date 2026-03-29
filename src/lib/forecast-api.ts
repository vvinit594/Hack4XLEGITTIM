/**
 * BedPulse AI service (FastAPI) — forecast endpoints only.
 * - Production: set VITE_AI_SERVICE_URL (e.g. https://api.example.com)
 * - Dev: defaults to same-origin `/bedpulse` (see vite.config.ts proxy → 127.0.0.1:8001)
 */

export type AiInsights = {
  clinical_alert: string
  discharge_action: string
  staffing_advisory: string
}

export type HourPrediction = {
  hour: number
  datetime_utc: string
  predicted_occupancy: number
  confidence: number
  occupancy_pct: number
}

export type ForecastResponse = {
  ward_id: string
  generated_at: string
  predictions: HourPrediction[]
  summary: string
  insights: AiInsights
  high_risk_windows: { start: string; end: string; max_pct: number }[]
  peak_hour: HourPrediction | Record<string, unknown>
  model_version: string
}

export type WeekdayImpact = {
  day_name: string
  avg_admissions: number
  vs_baseline_pct: number
}

export type ForecastHealth = {
  status: string
  model_loaded?: boolean
}

export class ForecastApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ForecastApiError"
    this.status = status
  }
}

export function getAiServiceBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_AI_SERVICE_URL?.replace(/\/$/, "")
  if (import.meta.env.DEV) {
    // Prefer same-origin proxy for local API (avoids CORS + IPv6 localhost quirks).
    const isLocalUrl =
      !fromEnv ||
      /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(fromEnv)
    if (isLocalUrl) return "/bedpulse"
    return fromEnv
  }
  if (fromEnv) return fromEnv
  return ""
}

export function getDemoWardId(): string {
  return (
    import.meta.env.VITE_DEMO_WARD_ID ??
    "00000000-0000-0000-0000-000000000001"
  )
}

async function parseDetail(res: Response): Promise<string> {
  const text = await res.text()
  try {
    const j = JSON.parse(text) as { detail?: unknown }
    const d = j.detail
    if (typeof d === "string") return d
    if (Array.isArray(d)) {
      return d
        .map((x) =>
          typeof x === "object" && x && "msg" in x
            ? String((x as { msg: string }).msg)
            : String(x)
        )
        .join("; ")
    }
  } catch {
    /* ignore */
  }
  return text || `Request failed (${res.status})`
}

async function fetchJson<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const base = getAiServiceBaseUrl()
  if (!base) {
    throw new ForecastApiError(
      "AI service URL is not configured (set VITE_AI_SERVICE_URL for production builds)",
      0
    )
  }
  const url = `${base.replace(/\/$/, "")}${path}`
  let res: Response
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...init?.headers,
      },
    })
  } catch (e) {
    const hint =
      import.meta.env.DEV
        ? " Start ai_service: cd ai_service && python main.py (listens on 8001). The dev server proxies /bedpulse to 127.0.0.1:8001."
        : " Check VITE_AI_SERVICE_URL and that the BedPulse API is reachable."
    throw new ForecastApiError(
      `${e instanceof Error ? e.message : "Network error"}.${hint}`,
      0
    )
  }
  if (!res.ok) {
    throw new ForecastApiError(await parseDetail(res), res.status)
  }
  return res.json() as Promise<T>
}

/** GET /health */
export async function getServiceHealth(): Promise<{
  status?: string
  service?: string
}> {
  return fetchJson("/health")
}

/** GET /forecast/health */
export async function getForecastHealth(): Promise<ForecastHealth> {
  return fetchJson("/forecast/health")
}

/** POST /forecast/run/{wardId} */
export async function runForecast(
  wardId: string
): Promise<ForecastResponse> {
  return fetchJson(`/forecast/run/${encodeURIComponent(wardId)}`, {
    method: "POST",
  })
}

/** GET /forecast/cached/{wardId} */
export async function getCachedForecast(
  wardId: string
): Promise<ForecastResponse> {
  return fetchJson(`/forecast/cached/${encodeURIComponent(wardId)}`)
}

/** GET /forecast/weekday/{wardId} */
export async function getWeekdayImpact(
  wardId: string
): Promise<WeekdayImpact[]> {
  return fetchJson(`/forecast/weekday/${encodeURIComponent(wardId)}`)
}

/** POST /forecast/save/{wardId} */
export async function saveForecast(
  wardId: string,
  predictions: HourPrediction[]
): Promise<{ saved: number }> {
  return fetchJson(`/forecast/save/${encodeURIComponent(wardId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(predictions),
  })
}

/**
 * Try cached forecast; on 404 run full pipeline. Weekday is always fetched (errors ignored).
 */
export async function loadForecastWithFallback(wardId: string): Promise<{
  forecast: ForecastResponse
  source: "cached" | "run"
  weekday: WeekdayImpact[]
}> {
  const weekdayPromise = getWeekdayImpact(wardId).catch(() => [] as WeekdayImpact[])

  let source: "cached" | "run" = "run"
  let forecast: ForecastResponse

  try {
    forecast = await getCachedForecast(wardId)
    source = "cached"
  } catch (e) {
    if (e instanceof ForecastApiError && e.status === 404) {
      forecast = await runForecast(wardId)
      source = "run"
      await saveForecast(wardId, forecast.predictions).catch(() => undefined)
    } else {
      throw e
    }
  }

  const weekday = await weekdayPromise
  return { forecast, source, weekday }
}
