"""
routers/forecast.py
FastAPI router for all BedPulse forecast endpoints.
"""
from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client

from graphs.forecast_graph import run_forecast

load_dotenv()

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/forecast")

_SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
_SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

_MODEL_PATH = str(Path(__file__).parent.parent / "models" / "forecast_model.joblib")


def _supabase_configured() -> bool:
    return bool(_SUPABASE_URL and _SUPABASE_KEY)


def _sb():
    if not _supabase_configured():
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in ai_service/.env"
        )
    return create_client(_SUPABASE_URL, _SUPABASE_KEY)


# ── Pydantic models ─────────────────────────────────────────────────────────

class AiInsights(BaseModel):
    clinical_alert: str = ""
    discharge_action: str = ""
    staffing_advisory: str = ""


class HourPrediction(BaseModel):
    hour: int
    datetime_utc: str
    predicted_occupancy: int
    confidence: float
    occupancy_pct: float


class ForecastResponse(BaseModel):
    ward_id: str
    generated_at: str
    predictions: list[HourPrediction]
    summary: str
    insights: AiInsights
    high_risk_windows: list[dict]
    peak_hour: dict
    model_version: str = "rf-v1"


class WeekdayImpact(BaseModel):
    day_name: str
    avg_admissions: float
    vs_baseline_pct: float


# ── Helpers ─────────────────────────────────────────────────────────────────

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def _demo_predictions(ward_id: str, total_beds: int = 40) -> list[dict]:
    """Deterministic synthetic 24h occupancy when DB/model has no data (local demo)."""
    import math
    from datetime import timedelta

    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    seed = abs(hash(ward_id)) % (2**31)
    base = int(total_beds * 0.62) + (seed % 5)
    out: list[dict] = []
    for h in range(24):
        t = now + timedelta(hours=h)
        wave = int(6 * math.sin(h / 3.5))
        occ = max(0, min(total_beds, base + wave + ((seed + h) % 4)))
        pct = round((occ / total_beds) * 100, 1) if total_beds else 0.0
        out.append(
            {
                "hour": h,
                "datetime_utc": t.isoformat(),
                "predicted_occupancy": occ,
                "confidence": 0.72 + (h % 5) * 0.02,
                "occupancy_pct": pct,
            }
        )
    return out


def _compute_high_risk_windows(predictions: list[dict]) -> list[dict]:
    """Group consecutive hours where occupancy_pct >= 90 into window dicts."""
    windows: list[dict] = []
    in_window = False
    current: dict = {}
    for p in predictions:
        if p["occupancy_pct"] >= 90:
            if not in_window:
                in_window = True
                current = {"start": p["datetime_utc"], "max_pct": p["occupancy_pct"]}
            else:
                current["max_pct"] = max(current["max_pct"], p["occupancy_pct"])
            current["end"] = p["datetime_utc"]
        else:
            if in_window:
                windows.append(current)
                in_window = False
    if in_window:
        windows.append(current)
    return windows


# ── Endpoints ───────────────────────────────────────────────────────────────

@router.get("/health")
async def health_check():
    """Returns service health and whether the model is loaded."""
    model_loaded = os.path.exists(_MODEL_PATH)
    return {
        "status": "ok",
        "model_loaded": model_loaded,
        "supabase_configured": _supabase_configured(),
    }


@router.post("/run/{ward_id}", response_model=ForecastResponse)
async def run_forecast_endpoint(ward_id: str):
    """Trigger the full LangGraph forecasting pipeline for a ward."""
    try:
        result = await run_forecast(ward_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    predictions: list[dict] = result.get("predictions", [])
    demo_mode = False
    if not predictions:
        logger.info(
            "No model predictions (e.g. empty Supabase) — returning demo series for ward %s",
            ward_id,
        )
        predictions = _demo_predictions(ward_id)
        demo_mode = True

    high_risk_windows = _compute_high_risk_windows(predictions)
    peak_hour = max(predictions, key=lambda p: p["predicted_occupancy"])

    raw_insights = result.get("insights", {}) or {}
    if demo_mode:
        raw_insights = {
            "clinical_alert": "Demo forecast — connect Supabase and seed admission_history for live AI output.",
            "discharge_action": "Configure ai_service/.env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
            "staffing_advisory": "Charts below use synthetic occupancy; weekday table stays empty until data exists.",
        }

    ai_insights = AiInsights(
        clinical_alert=raw_insights.get("clinical_alert", ""),
        discharge_action=raw_insights.get("discharge_action", ""),
        staffing_advisory=raw_insights.get("staffing_advisory", ""),
    )

    summary = result.get("summary", "") or ""
    if demo_mode and not summary.strip():
        summary = "Demo 24h projection (no historical admissions in database)."

    return ForecastResponse(
        ward_id=ward_id,
        generated_at=datetime.now(timezone.utc).isoformat(),
        predictions=[HourPrediction(**p) for p in predictions],
        summary=summary,
        insights=ai_insights,
        high_risk_windows=high_risk_windows,
        peak_hour=peak_hour,
        model_version="demo-v1" if demo_mode else "rf-v1",
    )


@router.get("/cached/{ward_id}", response_model=ForecastResponse)
async def get_cached_forecast(ward_id: str):
    """Read latest 24h cached predictions from Supabase forecasts table."""
    if not _supabase_configured():
        raise HTTPException(
            status_code=404,
            detail="Supabase not configured — copy ai_service/.env.example to .env and set credentials.",
        )
    try:
        response = (
            _sb()
            .table("forecasts")
            .select("*")
            .eq("ward_id", ward_id)
            .order("forecast_for", desc=False)
            .limit(24)
            .execute()
        )
        rows = response.data or []
    except Exception as exc:
        logger.warning("get_cached_forecast failed: %s", exc)
        # 404 so clients fall back to POST /forecast/run instead of surfacing 500
        raise HTTPException(
            status_code=404,
            detail=f"Could not load cached forecast ({exc!s}). Run /forecast/run to generate.",
        ) from exc

    if not rows:
        raise HTTPException(status_code=404, detail="No cached forecast found for this ward")

    predictions = [
        HourPrediction(
            hour=i,
            datetime_utc=r["forecast_for"],
            predicted_occupancy=r["predicted_occupancy"],
            confidence=r.get("confidence", 0.8),
            occupancy_pct=round((r["predicted_occupancy"] / 40) * 100, 1),
        )
        for i, r in enumerate(rows)
    ]
    pred_dicts = [p.model_dump() for p in predictions]
    return ForecastResponse(
        ward_id=ward_id,
        generated_at=datetime.now(timezone.utc).isoformat(),
        predictions=predictions,
        summary="Cached 24h forecast from database (run /forecast/run to refresh with AI summary).",
        insights=AiInsights(),
        high_risk_windows=_compute_high_risk_windows(pred_dicts),
        peak_hour=max(pred_dicts, key=lambda p: p["predicted_occupancy"]),
        model_version=rows[0].get("model_version", "rf-v1"),
    )


@router.get("/weekday/{ward_id}", response_model=list[WeekdayImpact])
async def get_weekday_impact(ward_id: str):
    """Return weekday admission patterns vs baseline for the last 90 days."""
    from datetime import timedelta

    if not _supabase_configured():
        return []

    try:
        cutoff = (datetime.now(timezone.utc) - timedelta(days=90)).isoformat()
        response = (
            _sb()
            .table("admission_history")
            .select("admitted_at")
            .eq("ward_id", ward_id)
            .gte("admitted_at", cutoff)
            .execute()
        )
        rows = response.data or []
    except Exception as exc:
        logger.warning("get_weekday_impact failed: %s", exc)
        return []

    if not rows:
        return []

    import pandas as pd

    df = pd.DataFrame(rows)
    df["admitted_at"] = pd.to_datetime(df["admitted_at"], utc=True)
    df["day_of_week"] = df["admitted_at"].dt.dayofweek
    df["date"] = df["admitted_at"].dt.date

    daily_counts = df.groupby(["date", "day_of_week"]).size().reset_index(name="count")
    dow_avg = daily_counts.groupby("day_of_week")["count"].mean()
    overall_avg = dow_avg.mean()

    result: list[WeekdayImpact] = []
    for dow in range(7):
        avg = float(dow_avg.get(dow, overall_avg))
        vs_baseline = round((avg - overall_avg) / overall_avg * 100, 1) if overall_avg else 0.0
        result.append(
            WeekdayImpact(
                day_name=DAY_NAMES[dow],
                avg_admissions=round(avg, 1),
                vs_baseline_pct=vs_baseline,
            )
        )
    return result


@router.post("/save/{ward_id}")
async def save_forecast(ward_id: str, predictions: list[HourPrediction]):
    """Upsert a list of hour predictions into the Supabase forecasts table."""
    if not _supabase_configured():
        return {"saved": 0, "skipped": True, "reason": "Supabase not configured"}

    rows = [
        {
            "ward_id": ward_id,
            "forecast_for": p.datetime_utc,
            "predicted_occupancy": p.predicted_occupancy,
            "confidence": p.confidence,
            "model_version": "rf-v1",
        }
        for p in predictions
    ]
    try:
        _sb().table("forecasts").upsert(rows, on_conflict="ward_id,forecast_for").execute()
    except Exception as exc:
        logger.warning("save_forecast failed: %s", exc)
        return {"saved": 0, "skipped": True, "reason": str(exc)}
    return {"saved": len(rows)}
