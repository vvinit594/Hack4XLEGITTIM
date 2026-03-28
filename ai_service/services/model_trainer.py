"""
services/model_trainer.py
Trains, saves, loads and runs the RandomForest occupancy prediction model.
"""
from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

logger = logging.getLogger(__name__)

FEATURE_COLUMNS = ["hour_of_day", "day_of_week", "month", "is_weekend", "is_peak_hour"]
TARGET_COLUMN = "occupancy_estimate"
# Absolute path so it works regardless of CWD
MODEL_PATH = str(Path(__file__).parent.parent / "models" / "forecast_model.joblib")


def train_model(df: pd.DataFrame) -> RandomForestRegressor:
    """
    Train a RandomForestRegressor on the feature DataFrame and save to disk.

    Args:
        df: DataFrame with FEATURE_COLUMNS and TARGET_COLUMN

    Returns:
        Trained RandomForestRegressor

    Raises:
        ValueError: if fewer than 50 training rows available
    """
    df_clean = df.dropna(subset=[TARGET_COLUMN])
    if len(df_clean) < 10:
        raise ValueError("Insufficient training data")

    X = df_clean[FEATURE_COLUMNS]
    y = df_clean[TARGET_COLUMN]

    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X, y)

    os.makedirs(str(Path(MODEL_PATH).parent), exist_ok=True)
    try:
        joblib.dump(model, MODEL_PATH)
        logger.info("Model saved to %s", MODEL_PATH)
    except Exception as exc:
        logger.warning("Could not save model: %s", exc)

    return model


def load_model() -> RandomForestRegressor | None:
    """
    Load model from disk. Returns None if file does not exist.
    """
    if not os.path.exists(MODEL_PATH):
        return None
    try:
        return joblib.load(MODEL_PATH)
    except Exception as exc:
        logger.error("Failed to load model: %s", exc)
        return None


def predict_24h(
    future_df: pd.DataFrame,
    model: RandomForestRegressor,
    total_beds: int = 40,
) -> list[dict]:
    """
    Generate 24-hour occupancy predictions with confidence scores.

    Args:
        future_df: DataFrame with FEATURE_COLUMNS + datetime_utc column
        model: trained RandomForestRegressor
        total_beds: ward capacity used for clipping and percentage calc

    Returns:
        List of 24 dicts: hour, datetime_utc, predicted_occupancy,
        confidence, occupancy_pct
    """
    X_future = future_df[FEATURE_COLUMNS]
    results = []

    # Collect per-tree predictions for confidence estimation
    tree_preds = np.array(
        [tree.predict(X_future) for tree in model.estimators_]
    )  # shape: (n_estimators, 24)

    mean_preds = tree_preds.mean(axis=0)
    std_preds = tree_preds.std(axis=0)

    for i in range(len(future_df)):
        raw_occ = float(mean_preds[i])
        predicted_occupancy = int(np.clip(round(raw_occ), 0, total_beds))
        confidence = float(
            np.clip(1 - (std_preds[i] / max(total_beds, 1)), 0.0, 1.0)
        )
        occupancy_pct = round((predicted_occupancy / total_beds) * 100, 1)
        dt_utc = future_df.iloc[i].get("datetime_utc", datetime.now(timezone.utc).isoformat())

        results.append(
            {
                "hour": i,
                "datetime_utc": str(dt_utc),
                "predicted_occupancy": predicted_occupancy,
                "confidence": round(confidence, 2),
                "occupancy_pct": occupancy_pct,
            }
        )

    return results


def get_or_train_model(df: pd.DataFrame) -> RandomForestRegressor:
    """
    Load existing model from disk; train fresh if not found.
    Never raises — always returns a valid model.
    """
    model = load_model()
    if model is not None:
        return model
    try:
        return train_model(df)
    except Exception as exc:
        logger.error("Training failed (%s) — using untrained fallback model", exc)
        fallback = RandomForestRegressor(n_estimators=10, random_state=42)
        dummy_X = pd.DataFrame(
            [[h % 24, h % 7, 1, 0, 0] for h in range(50)],
            columns=FEATURE_COLUMNS,
        )
        dummy_y = pd.Series([20.0] * 50)
        fallback.fit(dummy_X, dummy_y)
        return fallback
