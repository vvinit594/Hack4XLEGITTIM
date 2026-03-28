"""
services/data_fetcher.py
Fetches historical admission data and current ward state from Supabase.
"""
from __future__ import annotations

import logging
import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

logger = logging.getLogger(__name__)

_SUPABASE_URL = os.getenv("SUPABASE_URL", "")
_SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


def _get_client() -> Client:
    return create_client(_SUPABASE_URL, _SUPABASE_KEY)


def get_historical_data(ward_id: str) -> list[dict]:
    """
    Query admission_history for the given ward over the last 90 days.

    Returns list of dicts with keys: admitted_at, discharged_at, los_hours.
    Returns empty list on any error.
    """
    try:
        client = _get_client()
        cutoff = (datetime.now(timezone.utc) - timedelta(days=90)).isoformat()
        response = (
            client.table("admission_history")
            .select("admitted_at, discharged_at, los_hours")
            .eq("ward_id", ward_id)
            .gte("admitted_at", cutoff)
            .execute()
        )
        return response.data or []
    except Exception as exc:
        logger.error("get_historical_data failed: %s", exc)
        return []


def get_current_ward_state(ward_id: str) -> dict:
    """
    Returns bed status counts for the ward.

    Falls back to demo values if the beds table is unavailable.
    """
    fallback = {
        "occupied": 20,
        "available": 15,
        "cleaning": 3,
        "reserved": 2,
        "total": 40,
    }
    try:
        client = _get_client()
        response = (
            client.table("beds")
            .select("status")
            .eq("ward_id", ward_id)
            .execute()
        )
        rows = response.data or []
        counts: dict[str, int] = {
            "occupied": 0,
            "available": 0,
            "cleaning": 0,
            "reserved": 0,
        }
        for row in rows:
            status = row.get("status", "").lower()
            if status in counts:
                counts[status] += 1
        counts["total"] = sum(counts.values()) or 40
        return counts
    except Exception as exc:
        logger.warning("get_current_ward_state failed (%s) — using fallback", exc)
        return fallback
