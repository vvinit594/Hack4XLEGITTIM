"""
graphs/forecast_graph.py
LangGraph StateGraph orchestrating the 5-step forecasting pipeline.
"""
from __future__ import annotations

import logging
from typing import TypedDict

import pandas as pd
from langgraph.graph import StateGraph, END

from services.data_fetcher import get_historical_data
from services.feature_eng import build_features, build_future_features
from services.model_trainer import get_or_train_model, predict_24h
from services.explainer import generate_insights

logger = logging.getLogger(__name__)


class ForecastState(TypedDict):
    ward_id: str
    total_beds: int
    raw_data: list
    features_df: object
    future_df: object
    model: object
    predictions: list
    summary: str
    insights: dict
    error: str


# ── Node functions ──────────────────────────────────────────────────────────

def node_fetch_data(state: ForecastState) -> ForecastState:
    """Fetch historical admission records from Supabase."""
    raw = get_historical_data(state["ward_id"])
    if not raw:
        logger.warning("No historical data returned for ward %s", state["ward_id"])
        return {**state, "raw_data": [], "error": "no_data"}
    return {**state, "raw_data": raw}


def node_engineer_features(state: ForecastState) -> ForecastState:
    """Build training and future feature DataFrames."""
    raw = state.get("raw_data", [])
    if not raw:
        empty_df = pd.DataFrame()
        return {**state, "features_df": empty_df, "future_df": build_future_features()}
    features_df = build_features(raw)
    future_df = build_future_features(hours_ahead=24)
    return {**state, "features_df": features_df, "future_df": future_df}


def node_train_model(state: ForecastState) -> ForecastState:
    """Load or train the RandomForest model."""
    features_df = state.get("features_df")
    try:
        model = get_or_train_model(features_df if features_df is not None else pd.DataFrame())
        return {**state, "model": model}
    except ValueError as exc:
        logger.error("Model training failed: %s", exc)
        return {**state, "model": None, "error": "insufficient_data"}


def node_predict(state: ForecastState) -> ForecastState:
    """Run 24-hour occupancy predictions."""
    model = state.get("model")
    future_df = state.get("future_df")
    total_beds = state.get("total_beds", 40)

    if model is None or future_df is None or (
        isinstance(future_df, pd.DataFrame) and future_df.empty
    ):
        return {**state, "predictions": []}

    predictions = predict_24h(future_df, model, total_beds)
    return {**state, "predictions": predictions}


def node_explain(state: ForecastState) -> ForecastState:
    """Generate 3 structured clinical insights via Groq LLM."""
    predictions = state.get("predictions", [])
    insights = generate_insights(predictions)
    summary = insights.get("clinical_alert", "")
    return {**state, "summary": summary, "insights": insights}


# ── Build & compile graph ───────────────────────────────────────────────────

def _build_graph() -> StateGraph:
    g = StateGraph(ForecastState)
    g.add_node("node_fetch_data", node_fetch_data)
    g.add_node("node_engineer_features", node_engineer_features)
    g.add_node("node_train_model", node_train_model)
    g.add_node("node_predict", node_predict)
    g.add_node("node_explain", node_explain)

    g.set_entry_point("node_fetch_data")
    g.add_edge("node_fetch_data", "node_engineer_features")
    g.add_edge("node_engineer_features", "node_train_model")
    g.add_edge("node_train_model", "node_predict")
    g.add_edge("node_predict", "node_explain")
    g.add_edge("node_explain", END)
    return g


forecast_chain = _build_graph().compile()


async def run_forecast(ward_id: str, total_beds: int = 40) -> dict:
    """
    Execute the full forecasting pipeline for a ward.

    Returns dict with: predictions, summary, error, ward_id
    """
    initial_state: ForecastState = {
        "ward_id": ward_id,
        "total_beds": total_beds,
        "raw_data": [],
        "features_df": None,
        "future_df": None,
        "model": None,
        "predictions": [],
        "summary": "",
        "insights": {},
        "error": "",
    }
    try:
        result = forecast_chain.invoke(initial_state)
        return {
            "ward_id": ward_id,
            "predictions": result.get("predictions", []),
            "summary": result.get("summary", ""),
            "insights": result.get("insights", {}),
            "error": result.get("error", ""),
        }
    except Exception as exc:
        logger.error("run_forecast pipeline error: %s", exc)
        return {
            "ward_id": ward_id,
            "predictions": [],
            "summary": "",
            "insights": {},
            "error": str(exc),
        }
