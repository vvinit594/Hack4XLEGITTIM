"""
routers/forecast.py
FastAPI router for all BedPulse forecast endpoints.
"""
from __future__ import annotations

import os
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client

from graphs.forecast_graph import run_forecast

load_dotenv()

router = APIRouter(prefix="/forecast")

_SUPABASE_URL = os.getenv("SUPABASE_URL", "")
_SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

_MODEL_PATH = str(Path(__file__).parent.parent / "models" / "forecast_model.joblib")


def _sb():
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
    return {"status": "ok", "model_loaded": model_loaded}


@router.post("/run/{ward_id}", response_model=ForecastResponse)
async def run_forecast_endpoint(ward_id: str):
    """Trigger the full LangGraph forecasting pipeline for a ward."""
    try:
        result = await run_forecast(ward_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    predictions = result.get("predictions", [])
    if not predictions:
        raise HTTPException(
            status_code=500,
            detail=result.get("error", "Forecast pipeline returned no predictions"),
        )

    high_risk_windows = _compute_high_risk_windows(predictions)
    peak_hour = max(predictions, key=lambda p: p["predicted_occupancy"])

    raw_insights = result.get("insights", {})
    ai_insights = AiInsights(
        clinical_alert=raw_insights.get("clinical_alert", ""),
        discharge_action=raw_insights.get("discharge_action", ""),
        staffing_advisory=raw_insights.get("staffing_advisory", ""),
    )

    return ForecastResponse(
        ward_id=ward_id,
        generated_at=datetime.now(timezone.utc).isoformat(),
        predictions=[HourPrediction(**p) for p in predictions],
        summary=result.get("summary", ""),
        insights=ai_insights,
        high_risk_windows=high_risk_windows,
        peak_hour=peak_hour,
        model_version="rf-v1",
    )


@router.get("/cached/{ward_id}", response_model=ForecastResponse)
async def get_cached_forecast(ward_id: str):
    """Read latest 24h cached predictions from Supabase forecasts table."""
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
        raise HTTPException(status_code=500, detail=str(exc))

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
        summary="",
        high_risk_windows=_compute_high_risk_windows(pred_dicts),
        peak_hour=max(pred_dicts, key=lambda p: p["predicted_occupancy"]),
        model_version=rows[0].get("model_version", "rf-v1"),
    )


@router.get("/weekday/{ward_id}", response_model=list[WeekdayImpact])
async def get_weekday_impact(ward_id: str):
    """Return weekday admission patterns vs baseline for the last 90 days."""
    from datetime import timedelta

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
        raise HTTPException(status_code=500, detail=str(exc))

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
        raise HTTPException(status_code=500, detail=str(exc))
    return {"saved": len(rows)}
