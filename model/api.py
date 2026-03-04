"""
BRIS — FastAPI Prediction Server

Serves real-time risk predictions from trained XGBoost + LightGBM ensemble.
SHAP values are computed per inference using TreeExplainer.

Usage:
  cd model/
  uvicorn api:app --reload --host 0.0.0.0 --port 8000

Health check: GET  http://localhost:8000/health
Prediction:   POST http://localhost:8000/predict
Metrics:      GET  http://localhost:8000/metrics
"""

from pathlib import Path
from typing  import Optional
import json, time
import numpy  as np
import joblib

from fastapi             import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic            import BaseModel, Field, validator

# ── Artifact paths ────────────────────────────────────────────────────────────
ARTIFACTS = Path("artifacts")

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title       = "BRIS Prediction API",
    description = "Behavioral Risk Intelligence System — Ensemble Model Server",
    version     = "2.4.1",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins  = ["*"],           # In production: restrict to your domain
    allow_methods  = ["GET", "POST"],
    allow_headers  = ["*"],
)

# ── Model registry ────────────────────────────────────────────────────────────
_models      = {}
_metrics     = {}
_loaded      = False
_load_error  = None

FEATURE_NAMES = [
    "credit_utilization",
    "age",
    "payment_delay_30_59d",
    "debt_ratio",
    "monthly_income",
    "num_credit_lines",
    "times_90d_late",
    "real_estate_loans",
    "payment_delay_60_89d",
    "num_dependents",
    "spending_volatility",
    "income_stability",
]

def load_models():
    global _models, _metrics, _loaded, _load_error
    try:
        _models["xgb"]         = joblib.load(ARTIFACTS / "xgb_model.pkl")
        _models["lgbm"]        = joblib.load(ARTIFACTS / "lgbm_model.pkl")
        _models["calibrator"]  = joblib.load(ARTIFACTS / "calibrator.pkl")
        _models["preprocessor"]= joblib.load(ARTIFACTS / "preprocessor.pkl")
        _models["shap"]        = joblib.load(ARTIFACTS / "shap_explainer.pkl")
        with open(ARTIFACTS / "eval_metrics.json") as f:
            _metrics = json.load(f)
        _loaded = True
        print("[BRIS API] Models loaded successfully.")
    except Exception as e:
        _load_error = str(e)
        print(f"[BRIS API] WARNING: Models not loaded — {e}")
        print("[BRIS API] Run train.py first to generate model artifacts.")

load_models()


# ── Request / Response schemas ────────────────────────────────────────────────
class PredictRequest(BaseModel):
    # Normalized behavioral indicators (matches BRIS frontend fields)
    credit_utilization:   float = Field(..., ge=0, le=1,    description="% revolving credit in use (0–1 fraction)")
    payment_delay:        float = Field(..., ge=0, le=90,   description="Mean days past due")
    spending_volatility:  float = Field(..., ge=0, le=1,    description="30d coefficient of variation (0–1)")
    income_stability:     float = Field(..., ge=0, le=1,    description="Payroll regularity index (0–1)")
    missed_payments:      int   = Field(default=0, ge=0, le=12)
    avg_balance:          float = Field(default=10000, ge=0)
    monthly_income:       float = Field(default=5000, ge=0)
    age:                  Optional[int]   = Field(default=40, ge=18, le=100)
    employment_status:    Optional[str]   = Field(default="employed")

    @validator("credit_utilization", "spending_volatility", "income_stability")
    def check_fraction(cls, v):
        return float(np.clip(v, 0, 1))


class SHAPEntry(BaseModel):
    feature: str
    value:   float
    positive: bool


class PredictResponse(BaseModel):
    score:              float
    category:           str
    confidence_lower:   float
    confidence_upper:   float
    shap_values:        list[SHAPEntry]
    ensemble_weights:   dict
    model_version:      str
    inference_ms:       float
    using_real_model:   bool


# ── Helper: build feature vector ──────────────────────────────────────────────
def build_features(req: PredictRequest) -> np.ndarray:
    """
    Maps the frontend's BRIS form fields to the 12-feature vector.
    Fields not directly available are estimated from related inputs.
    """
    debt_ratio = 1.0 - req.income_stability          # inverse proxy
    num_credit_lines = max(1, int(req.avg_balance / 3000))
    times_90d_late   = req.missed_payments // 3
    real_estate      = 0
    pmt_delay_60_89  = req.missed_payments // 4

    return np.array([[
        req.credit_utilization,
        req.age or 40,
        req.missed_payments,     # using as proxy for 30-59d delays
        debt_ratio,
        req.monthly_income,
        num_credit_lines,
        times_90d_late,
        real_estate,
        pmt_delay_60_89,
        0,                       # num_dependents — not collected in frontend
        req.spending_volatility,
        req.income_stability,
    ]], dtype=np.float32)


def categorize(score: float) -> str:
    if score >= 0.70: return "High Risk"
    if score >= 0.45: return "Moderate Risk"
    return "Stable"


# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status":        "ok" if _loaded else "degraded",
        "models_loaded": _loaded,
        "load_error":    _load_error,
        "version":       "2.4.1",
    }


@app.get("/metrics")
def get_metrics():
    if not _metrics:
        raise HTTPException(503, "Model metrics not available. Run train.py first.")
    return _metrics


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    t0 = time.perf_counter()

    if not _loaded:
        raise HTTPException(
            503,
            detail="Models not loaded. Run `python train.py` in the model/ directory first."
        )

    # Build + preprocess feature vector
    X_raw = build_features(req)
    X     = _models["preprocessor"].transform(X_raw)

    # Ensemble predictions
    xgb_prob  = float(_models["xgb"].predict_proba(X)[0, 1])
    lgbm_prob = float(_models["lgbm"].predict_proba(X)[0, 1])
    raw_prob  = 0.53 * xgb_prob + 0.47 * lgbm_prob

    # Platt-scaled calibrated score
    cal_score = float(
        _models["calibrator"].predict_proba(np.array([[raw_prob]]))[0, 1]
    )

    # Approximate 95% CI (±1.96 * estimate of std from model variation)
    spread = abs(xgb_prob - lgbm_prob) / 2 + 0.012
    lo = float(np.clip(cal_score - 1.96 * spread, 0, 1))
    hi = float(np.clip(cal_score + 1.96 * spread, 0, 1))

    # SHAP values (per-inference via TreeExplainer on XGBoost)
    shap_vals = _models["shap"].shap_values(X)[0]

    shap_entries = [
        SHAPEntry(
            feature  = FEATURE_NAMES[i],
            value    = float(shap_vals[i]),
            positive = float(shap_vals[i]) >= 0,
        )
        for i in np.argsort(np.abs(shap_vals))[::-1]
    ]

    inference_ms = (time.perf_counter() - t0) * 1000

    return PredictResponse(
        score            = round(cal_score, 4),
        category         = categorize(cal_score),
        confidence_lower = round(lo, 4),
        confidence_upper = round(hi, 4),
        shap_values      = shap_entries,
        ensemble_weights = {"XGBoost": 0.53, "LightGBM": 0.47},
        model_version    = "2.4.1",
        inference_ms     = round(inference_ms, 2),
        using_real_model = True,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
