"""
services/feature_eng.py
Builds feature DataFrames for training and future-hour prediction.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import numpy as np
import pandas as pd


def build_features(raw_data: list[dict]) -> pd.DataFrame:
    """
    Transform raw admission records into an hourly feature DataFrame.

    Args:
        raw_data: list of dicts with admitted_at (ISO str),
                  discharged_at (ISO str or None), los_hours (int)

    Returns:
        DataFrame with columns:
        hour_of_day, day_of_week, month, is_weekend, is_peak_hour,
        admissions_count, avg_los_hours, occupancy_estimate
    """
    if not raw_data:
        cols = [
            "hour_of_day", "day_of_week", "month",
            "is_weekend", "is_peak_hour",
            "admissions_count", "avg_los_hours", "occupancy_estimate",
        ]
        return pd.DataFrame(columns=cols)

    df = pd.DataFrame(raw_data)
    df["admitted_at"] = pd.to_datetime(df["admitted_at"], utc=True)
    df["discharged_at"] = pd.to_datetime(df["discharged_at"], utc=True, errors="coerce")
    df["los_hours"] = pd.to_numeric(df["los_hours"], errors="coerce").fillna(72)

    # Time features
    df["hour_of_day"] = df["admitted_at"].dt.hour
    df["day_of_week"] = df["admitted_at"].dt.dayofweek
    df["month"] = df["admitted_at"].dt.month
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)
    df["is_peak_hour"] = df["hour_of_day"].isin([10, 11, 12, 18, 19, 20]).astype(int)

    # Aggregate per admission-hour slot
    grouped = (
        df.groupby("hour_of_day")
        .agg(
            admissions_count=("admitted_at", "count"),
            avg_los_hours=("los_hours", "mean"),
            day_of_week=("day_of_week", "median"),
            month=("month", "median"),
            is_weekend=("is_weekend", "median"),
            is_peak_hour=("is_peak_hour", "median"),
        )
        .reset_index()
    )

    # Occupancy estimate: rolling proxy (admissions not yet discharged in 24h window)
    grouped = grouped.sort_values("hour_of_day").reset_index(drop=True)
    grouped["occupancy_estimate"] = (
        grouped["admissions_count"].rolling(window=8, min_periods=1).sum()
    )

    grouped = grouped.fillna(0)
    grouped["day_of_week"] = grouped["day_of_week"].astype(int)
    grouped["month"] = grouped["month"].astype(int)
    grouped["is_weekend"] = grouped["is_weekend"].astype(int)
    grouped["is_peak_hour"] = grouped["is_peak_hour"].astype(int)

    return grouped


def build_future_features(hours_ahead: int = 24) -> pd.DataFrame:
    """
    Create a feature DataFrame for the next `hours_ahead` hours from now.

    Returns:
        DataFrame with columns: hour_of_day, day_of_week, month,
        is_weekend, is_peak_hour (one row per future hour)
    """
    now = datetime.now(timezone.utc)
    rows: list[dict] = []
    for i in range(hours_ahead):
        future = now + timedelta(hours=i)
        dow = future.weekday()
        hour = future.hour
        rows.append(
            {
                "hour_of_day": hour,
                "day_of_week": dow,
                "month": future.month,
                "is_weekend": int(dow >= 5),
                "is_peak_hour": int(hour in [10, 11, 12, 18, 19, 20]),
                "datetime_utc": future.isoformat(),
            }
        )
    return pd.DataFrame(rows)
