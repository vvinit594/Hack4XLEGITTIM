"""
main.py — BedPulse AI Service entry point.
"""
from dotenv import load_dotenv
load_dotenv()

import logging
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.forecast import router as forecast_router

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="BedPulse AI Service",
    version="1.0.0",
    description="AI-powered hospital bed demand forecasting using RandomForest + LangGraph + Groq",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(forecast_router)


@app.get("/")
async def root():
    return {"service": "BedPulse AI", "status": "running", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.on_event("startup")
async def on_startup():
    import os
    from pathlib import Path
    import joblib
    model_path = str(Path(__file__).parent / "models" / "forecast_model.joblib")
    if os.path.exists(model_path):
        try:
            joblib.load(model_path)
            print("✅ Model loaded from disk")
        except Exception:
            print("⚠️  Model file found but failed to load")
    else:
        print("ℹ️  No model found — will train on first request")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
