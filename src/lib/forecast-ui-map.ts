import type { HourPrediction } from "@/lib/forecast-api"

/** Backend demo ward capacity; matches ai_service cached occupancy_pct divisor. */
export const FORECAST_DEMO_TOTAL_BEDS = 40

/**
 * Hour indices 4 and 8 in the 24h prediction series ≈ 4h and 8h ahead
 * (index 0 = first forecast hour from the pipeline).
 */
export function predictionsToCapacityWidgetData(
  predictions: HourPrediction[],
  totalBeds = FORECAST_DEMO_TOTAL_BEDS
) {
  const pick = (idx: number) => {
    if (!predictions.length) return { forecast: 0, pct: 0 }
    const i = Math.min(Math.max(0, idx), predictions.length - 1)
    const p = predictions[i]
    const pct =
      p.occupancy_pct ??
      Math.min(100, Math.round((p.predicted_occupancy / totalBeds) * 100))
    return { forecast: p.predicted_occupancy, pct }
  }
  const h4 = pick(4)
  const h8 = pick(8)
  const risk: "safe" | "warning" | "critical" =
    h4.pct >= 90 || h8.pct >= 90
      ? "critical"
      : h4.pct >= 80 || h8.pct >= 80
        ? "warning"
        : "safe"
  return {
    forecast_4h: h4.forecast,
    forecast_8h: h8.forecast,
    pct_4h: h4.pct,
    pct_8h: h8.pct,
    risk_level: risk,
  }
}

/** Rough shift metrics from occupancy delta to hour 4. */
export function predictionsToShiftMetrics(predictions: HourPrediction[]) {
  if (!predictions.length) {
    return { currentOccupied: 0, expectedDischarges: 0, expectedAdmissions: 0 }
  }
  const cur = predictions[0].predicted_occupancy
  const idx4 = Math.min(4, predictions.length - 1)
  const at4 = predictions[idx4].predicted_occupancy
  const delta = at4 - cur
  return {
    currentOccupied: cur,
    expectedAdmissions: delta > 0 ? delta : 0,
    expectedDischarges: delta < 0 ? -delta : 0,
  }
}
