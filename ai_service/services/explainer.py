"""
services/explainer.py
Generates 3 structured clinical insights via Google Gemini API.
"""
from __future__ import annotations

import json
import logging
import os

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

_GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
_MODEL_NAME = "gemini-2.5-flash"


def generate_insights(
    predictions: list[dict],
    ward_name: str = "General Ward A",
) -> dict:
    """
    Generate 3 structured hospital insights using Google Gemini.

    Returns dict with keys:
        clinical_alert    — immediate risk status (1 sentence)
        discharge_action  — proactive discharge recommendation (1 sentence)
        staffing_advisory — staffing/resource implication (1 sentence)
    """
    if not predictions:
        return _empty_insights()

    peak = max(predictions, key=lambda p: p["predicted_occupancy"])
    peak_occ = peak["predicted_occupancy"]
    peak_pct = peak["occupancy_pct"]
    peak_hour = peak["hour"]
    total_beds = round(peak_occ / (peak_pct / 100)) if peak_pct > 0 else 40

    high_risk = [p for p in predictions if p["occupancy_pct"] >= 90]
    safe_hours = [p for p in predictions if p["occupancy_pct"] < 70]
    hr_count = len(high_risk)
    avg_conf = round(sum(p["confidence"] for p in predictions) / len(predictions) * 100)

    def _fmt(h: int) -> str:
        suffix = "AM" if h < 12 else "PM"
        return f"{h % 12 or 12}{suffix}"

    peak_time = _fmt(peak_hour)
    risk_window = (
        f"{_fmt(high_risk[0]['hour'])}–{_fmt(high_risk[-1]['hour'])}"
        if hr_count else "none"
    )
    safe_window = (
        f"{_fmt(safe_hours[0]['hour'])}–{_fmt(safe_hours[-1]['hour'])}"
        if safe_hours else "none"
    )

    def _fallback() -> dict:
        if hr_count > 0:
            alert = f"Ward approaching critical capacity — {peak_occ}/{total_beds} beds predicted occupied at {peak_time} ({hr_count} consecutive high-risk hours)."
            discharge = f"Initiate discharge review for eligible patients before {_fmt(max(0, peak_hour - 3))} to free {max(2, hr_count // 2)}+ beds ahead of peak demand."
            staffing = f"Reinforce afternoon nursing staff for the {risk_window} window; model confidence is {avg_conf}% — plan for worst case."
        else:
            alert = f"Ward within safe operating range — peak at {peak_occ}/{total_beds} beds ({peak_pct}%) around {peak_time}."
            discharge = f"Routine discharge flow is sufficient; no emergency backlog expected. Best discharge window is {safe_window}."
            staffing = f"Standard staffing levels adequate for the next 24 hours. Model confidence: {avg_conf}%."
        return {
            "clinical_alert": alert,
            "discharge_action": discharge,
            "staffing_advisory": staffing,
        }

    if not _GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not set — returning fallback insights")
        return _fallback()

    try:
        from google import genai

        client = genai.Client(api_key=_GEMINI_API_KEY)

        prompt = f"""You are a clinical operations AI for a hospital ward management system.

Ward: {ward_name}
Total beds: {total_beds}
Predicted peak: {peak_occ} beds ({peak_pct}%) at {peak_time}
High-risk hours (>=90% capacity): {hr_count} hours ({risk_window})
Safe discharge window (<70% load): {safe_window}
Model confidence: {avg_conf}%

Respond ONLY with a valid JSON object with exactly these 3 keys. Each value must be a single sentence (max 20 words). Be specific with numbers and times. No markdown, no extra text, no code fences.

{{
  "clinical_alert": "One sentence about current risk level with specific bed numbers and times.",
  "discharge_action": "One sentence recommending when to discharge and how many beds to free.",
  "staffing_advisory": "One sentence about staffing adjustment needed for the predicted load."
}}"""

        response = client.models.generate_content(
            model=_MODEL_NAME,
            contents=prompt,
        )
        raw = response.text.strip()

        # Strip markdown code fences if present
        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        parsed = json.loads(raw)
        return {
            "clinical_alert": str(parsed.get("clinical_alert", "")).strip(),
            "discharge_action": str(parsed.get("discharge_action", "")).strip(),
            "staffing_advisory": str(parsed.get("staffing_advisory", "")).strip(),
        }

    except Exception as exc:
        logger.error("Gemini insights call failed: %s", exc)
        return _fallback()


# Backward-compat wrapper
def generate_summary(predictions: list[dict], ward_name: str = "General Ward A") -> str:
    ins = generate_insights(predictions, ward_name)
    return ins.get("clinical_alert", "")


def _empty_insights() -> dict:
    return {
        "clinical_alert": "No prediction data available.",
        "discharge_action": "Cannot generate recommendation without forecast data.",
        "staffing_advisory": "Standard staffing levels recommended until data is available.",
    }
