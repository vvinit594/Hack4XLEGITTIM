"""
scripts/seed_historical.py
Generates 90 days of realistic synthetic hospital admission data
and inserts it into the Supabase admission_history table.
"""
from __future__ import annotations

import os
import sys
import time
from datetime import datetime, timedelta, timezone

import numpy as np
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
DEMO_WARD_ID = os.getenv("DEMO_WARD_ID", "00000000-0000-0000-0000-000000000001")

CONDITION_CATEGORIES = [
    "Cardiac",
    "Respiratory",
    "General Surgery",
    "Orthopaedic",
    "Neurological",
    "Gastrointestinal",
]

# Hour-of-day admission probability weights (index = hour)
HOUR_WEIGHTS = [
    0.5, 0.3, 0.2, 0.2, 0.3, 0.5,   # 00-05
    0.8, 1.2, 1.5, 1.8,               # 06-09
    2.2, 2.5, 2.3,                    # 10-12  (30% peak)
    1.8, 1.5, 1.3, 1.2,               # 13-16
    1.8, 2.2, 2.5,                    # 17-19  (25% peak)
    2.0, 1.5, 1.0, 0.7,               # 20-23
]

# Day-of-week multipliers (0=Mon ... 6=Sun)
DOW_MULTIPLIERS = [1.15, 1.0, 1.05, 1.05, 0.90, 0.85, 0.80]


def build_records(rng: np.random.Generator) -> list[dict]:
    now_utc = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    start = now_utc - timedelta(days=90)
    records: list[dict] = []

    hour_prob = np.array(HOUR_WEIGHTS)
    hour_prob = hour_prob / hour_prob.sum()

    for day_offset in range(90):
        day_dt = start + timedelta(days=day_offset)
        dow = day_dt.weekday()  # 0=Mon
        base_admissions = rng.integers(8, 13)
        n_admissions = max(1, int(round(base_admissions * DOW_MULTIPLIERS[dow])))

        for _ in range(n_admissions):
            hour = int(rng.choice(24, p=hour_prob))
            minute = int(rng.integers(0, 60))
            admitted_at = day_dt.replace(hour=hour, minute=minute)

            los_hours = int(
                np.clip(rng.normal(loc=72, scale=36), 4, 240)
            )
            discharged_at = admitted_at + timedelta(hours=los_hours)
            condition = rng.choice(CONDITION_CATEGORIES)

            records.append(
                {
                    "ward_id": DEMO_WARD_ID,
                    "admitted_at": admitted_at.isoformat(),
                    "discharged_at": discharged_at.isoformat(),
                    "los_hours": los_hours,
                    "condition_category": str(condition),
                }
            )
    return records


def insert_batch(client, batch: list[dict], attempt: int = 1) -> bool:
    try:
        client.table("admission_history").insert(batch).execute()
        return True
    except Exception as exc:
        if attempt < 2:
            print(f"  Batch error (attempt {attempt}): {exc} — retrying …")
            time.sleep(1)
            return insert_batch(client, batch, attempt + 1)
        print(f"  Batch failed after 2 attempts: {exc}")
        return False


def main() -> None:
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set in .env")
        sys.exit(1)

    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    rng = np.random.default_rng(42)

    print("Generating synthetic admission records …")
    records = build_records(rng)
    print(f"Total records to insert: {len(records)}")

    batch_size = 50
    inserted = 0
    for i in range(0, len(records), batch_size):
        batch = records[i : i + batch_size]
        ok = insert_batch(client, batch)
        if ok:
            inserted += len(batch)
        print(f"  Progress: {min(i + batch_size, len(records))}/{len(records)} records processed")

    print(f"\n✅ Done — {inserted} records inserted into admission_history.")


if __name__ == "__main__":
    main()
