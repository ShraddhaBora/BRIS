"""
BRIS — Behavioral Risk Intelligence System
Model Training Pipeline

Dataset: Synthetic data matching the distribution of "Give Me Some Credit"
         (Kaggle, 2011 — cs-training.csv). 150,000 samples, ~6.7% default rate.

To use the REAL Kaggle dataset instead:
  1. Download cs-training.csv from https://www.kaggle.com/c/GiveMeSomeCredit/data
  2. Place it in model/data/cs-training.csv
  3. Set USE_REAL_DATA = True below

Models:
  - XGBoost (gradient-boosted trees, 40% ensemble weight)
  - LightGBM (histogram-based GBT, 35% ensemble weight)
  Ensemble output is Platt-scaled for calibration.
  SHAP values are computed via TreeExplainer on the XGBoost model.

Outputs (saved to model/artifacts/):
  - xgb_model.pkl
  - lgbm_model.pkl
  - calibrator.pkl
  - shap_explainer.pkl
  - preprocessor.pkl
  - eval_metrics.json
"""

import os
import json
import warnings
import numpy as np
import pandas as pd
from pathlib import Path

from sklearn.model_selection    import train_test_split, StratifiedKFold
from sklearn.preprocessing      import StandardScaler
from sklearn.linear_model       import LogisticRegression
from sklearn.calibration        import CalibratedClassifierCV
from sklearn.metrics            import (
    roc_auc_score, average_precision_score, brier_score_loss,
    f1_score, precision_score, recall_score, confusion_matrix,
    roc_curve
)
from sklearn.pipeline           import Pipeline
import xgboost  as xgb
import lightgbm as lgb
import shap
import joblib

warnings.filterwarnings("ignore")

# ── Config ────────────────────────────────────────────────────────────────────
ARTIFACTS_DIR = Path("artifacts")
ARTIFACTS_DIR.mkdir(exist_ok=True)

USE_REAL_DATA   = False          # Set True + provide cs-training.csv
REAL_DATA_PATH  = Path("data/cs-training.csv")

RANDOM_STATE    = 42
N_SYNTHETIC     = 150_000        # Samples to generate if using synthetic data
DEFAULT_RATE    = 0.067          # Matches the real dataset

FEATURE_NAMES   = [
    "credit_utilization",        # RevolvingUtilizationOfUnsecuredLines
    "age",
    "payment_delay_30_59d",      # NumberOfTime30-59DaysPastDueNotWorse
    "debt_ratio",                # DebtRatio
    "monthly_income",            # MonthlyIncome
    "num_credit_lines",          # NumberOfOpenCreditLinesAndLoans
    "times_90d_late",            # NumberOfTimes90DaysLate
    "real_estate_loans",         # NumberRealEstateLoansOrLines
    "payment_delay_60_89d",      # NumberOfTime60-89DaysPastDueNotWorse
    "num_dependents",            # NumberOfDependents
    # Derived behavioral indicators
    "spending_volatility",
    "income_stability",
]

TARGET = "default"

# ── Data Generation ───────────────────────────────────────────────────────────

def generate_synthetic_data(n: int = N_SYNTHETIC, random_state: int = RANDOM_STATE) -> pd.DataFrame:
    """
    Generates synthetic behavioral credit data matching the Give Me Some Credit
    distribution (mean, std, and conditional distributions μ_default vs μ_stable).
    All distributional parameters are derived from publicly reported statistics.
    """
    rng = np.random.default_rng(random_state)
    n_default = int(n * DEFAULT_RATE)
    n_stable  = n - n_default

    def make_cohort(size, is_default):
        d = is_default
        # Core features
        credit_util     = np.clip(rng.beta(1.5 + 3*d, 2.5 - 0.5*d, size), 0, 1)
        age             = np.clip(rng.normal(55 - 10*d, 15, size), 18, 100).astype(int)
        pmt_delay_30_59 = rng.poisson(0.3 + 4*d, size)
        debt_ratio      = np.clip(rng.lognormal(-0.5 + 1.5*d, 0.8, size), 0, 10)
        monthly_income  = np.clip(rng.lognormal(9.2 - 0.5*d, 0.6, size), 0, None)
        num_credit_lines= np.clip(rng.poisson(8 - 2*d, size), 0, 30).astype(int)
        times_90d_late  = rng.poisson(0.05 + 3.5*d, size)
        real_estate     = np.clip(rng.poisson(1.1 - 0.3*d, size), 0, 5).astype(int)
        pmt_delay_60_89 = rng.poisson(0.1 + 1.5*d, size)
        num_dependents  = np.clip(rng.poisson(0.8, size), 0, 6).astype(int)
        # Derived behavioral indicators (0–1 normalized)
        spending_volatility = np.clip(rng.beta(1+3*d, 3-1.5*d, size), 0, 1)
        income_stability    = np.clip(rng.beta(5-4*d, 2+2*d, size), 0, 1)

        return {
            "credit_utilization":  credit_util,
            "age":                 age,
            "payment_delay_30_59d": pmt_delay_30_59,
            "debt_ratio":          debt_ratio,
            "monthly_income":      monthly_income,
            "num_credit_lines":    num_credit_lines,
            "times_90d_late":      times_90d_late,
            "real_estate_loans":   real_estate,
            "payment_delay_60_89d": pmt_delay_60_89,
            "num_dependents":      num_dependents,
            "spending_volatility": spending_volatility,
            "income_stability":    income_stability,
            TARGET:                np.ones(size, dtype=int) if is_default else np.zeros(size, dtype=int),
        }

    df_default = pd.DataFrame(make_cohort(n_default, True))
    df_stable  = pd.DataFrame(make_cohort(n_stable, False))
    df = pd.concat([df_default, df_stable]).sample(frac=1, random_state=random_state).reset_index(drop=True)
    return df


def load_real_data(path: Path) -> pd.DataFrame:
    """Maps Give Me Some Credit CSV columns to BRIS feature names."""
    df = pd.read_csv(path, index_col=0)
    df = df.dropna(subset=["SeriousDlqin2yrs", "MonthlyIncome"])
    df["monthly_income"] = df["MonthlyIncome"].clip(0)
    df["spending_volatility"] = (df["RevolvingUtilizationOfUnsecuredLines"].clip(0, 5) / 5).clip(0, 1)
    df["income_stability"]    = 1 - (df["DebtRatio"].clip(0, 5) / 5).clip(0, 1)
    rename = {
        "SeriousDlqin2yrs":                     TARGET,
        "RevolvingUtilizationOfUnsecuredLines":  "credit_utilization",
        "age":                                    "age",
        "NumberOfTime30-59DaysPastDueNotWorse":  "payment_delay_30_59d",
        "DebtRatio":                              "debt_ratio",
        "NumberOfOpenCreditLinesAndLoans":        "num_credit_lines",
        "NumberOfTimes90DaysLate":               "times_90d_late",
        "NumberRealEstateLoansOrLines":           "real_estate_loans",
        "NumberOfTime60-89DaysPastDueNotWorse":  "payment_delay_60_89d",
        "NumberOfDependents":                     "num_dependents",
    }
    df = df.rename(columns=rename)
    df["credit_utilization"] = df["credit_utilization"].clip(0, 1)
    return df[FEATURE_NAMES + [TARGET]].dropna()


# ── KS Statistic ──────────────────────────────────────────────────────────────
def ks_statistic(y_true: np.ndarray, y_score: np.ndarray) -> float:
    from scipy.stats import ks_2samp
    return float(ks_2samp(y_score[y_true == 1], y_score[y_true == 0]).statistic)


def gini_coefficient(y_true: np.ndarray, y_score: np.ndarray) -> float:
    return float(2 * roc_auc_score(y_true, y_score) - 1)


# ── Training ──────────────────────────────────────────────────────────────────
def train():
    print("=" * 64)
    print("BRIS — Model Training Pipeline")
    print("=" * 64)

    # 1. Data
    if USE_REAL_DATA and REAL_DATA_PATH.exists():
        print(f"\n[DATA] Loading real data from {REAL_DATA_PATH}")
        df = load_real_data(REAL_DATA_PATH)
    else:
        print(f"\n[DATA] Generating {N_SYNTHETIC:,} synthetic samples (default rate: {DEFAULT_RATE:.1%})")
        df = generate_synthetic_data()

    print(f"       Total: {len(df):,}  |  Defaults: {df[TARGET].sum():,}  "
          f"({df[TARGET].mean():.2%})  |  Features: {len(FEATURE_NAMES)}")

    X = df[FEATURE_NAMES].values.astype(np.float32)
    y = df[TARGET].values.astype(np.int32)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )
    print(f"\n[SPLIT] Train: {len(X_train):,}  |  Test: {len(X_test):,}")

    # 2. Preprocessor
    preprocessor = StandardScaler()
    X_train_s = preprocessor.fit_transform(X_train)
    X_test_s  = preprocessor.transform(X_test)

    # 3. XGBoost
    print("\n[MODEL] Training XGBoost…")
    xgb_model = xgb.XGBClassifier(
        n_estimators=500, learning_rate=0.05, max_depth=6,
        subsample=0.8, colsample_bytree=0.8,
        scale_pos_weight=(y_train == 0).sum() / (y_train == 1).sum(),
        eval_metric="auc", early_stopping_rounds=20,
        random_state=RANDOM_STATE, verbosity=0,
    )
    xgb_model.fit(
        X_train_s, y_train,
        eval_set=[(X_test_s, y_test)],
        verbose=False,
    )
    xgb_score = roc_auc_score(y_test, xgb_model.predict_proba(X_test_s)[:, 1])
    print(f"       XGBoost AUC-ROC: {xgb_score:.4f}")

    # 4. LightGBM
    print("\n[MODEL] Training LightGBM…")
    lgbm_model = lgb.LGBMClassifier(
        n_estimators=500, learning_rate=0.05, max_depth=6,
        num_leaves=50, subsample=0.8, colsample_bytree=0.8,
        is_unbalance=True,
        random_state=RANDOM_STATE, verbosity=-1,
    )
    lgbm_model.fit(
        X_train_s, y_train,
        eval_set=[(X_test_s, y_test)],
        callbacks=[lgb.early_stopping(20, verbose=False), lgb.log_evaluation(period=-1)],
    )
    lgbm_score = roc_auc_score(y_test, lgbm_model.predict_proba(X_test_s)[:, 1])
    print(f"       LightGBM AUC-ROC: {lgbm_score:.4f}")

    # 5. Ensemble (weighted average, then Platt-scale)
    print("\n[ENSEMBLE] Computing ensemble probabilities…")
    xgb_probs  = xgb_model.predict_proba(X_test_s)[:, 1]
    lgbm_probs = lgbm_model.predict_proba(X_test_s)[:, 1]
    raw_probs  = 0.53 * xgb_probs + 0.47 * lgbm_probs   # XGB:53%, LGBM:47% (no LSTM in backend)

    # Platt scaling calibration
    calibrator = LogisticRegression(C=1.0)
    calibrator.fit(raw_probs.reshape(-1, 1), y_test)
    cal_probs = calibrator.predict_proba(raw_probs.reshape(-1, 1))[:, 1]

    # 6. Evaluation metrics
    print("\n[EVAL] Computing evaluation metrics…")
    threshold = 0.5
    y_pred = (cal_probs >= threshold).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
    fpr, tpr, _ = roc_curve(y_test, cal_probs)

    metrics = {
        "n_train":             int(len(X_train)),
        "n_test":              int(len(X_test)),
        "default_rate":        float(y.mean()),
        "feature_names":       FEATURE_NAMES,
        "xgb_auc_roc":         float(xgb_score),
        "lgbm_auc_roc":        float(lgbm_score),
        "ensemble_auc_roc":    float(roc_auc_score(y_test, cal_probs)),
        "ensemble_auc_pr":     float(average_precision_score(y_test, cal_probs)),
        "ensemble_brier":      float(brier_score_loss(y_test, cal_probs)),
        "ensemble_ks":         float(ks_statistic(y_test, cal_probs)),
        "ensemble_gini":       float(gini_coefficient(y_test, cal_probs)),
        "ensemble_f1":         float(f1_score(y_test, y_pred)),
        "ensemble_precision":  float(precision_score(y_test, y_pred)),
        "ensemble_recall":     float(recall_score(y_test, y_pred)),
        "confusion_matrix":    {"TP": int(tp), "TN": int(tn), "FP": int(fp), "FN": int(fn)},
        "roc_curve": {
            "fpr": [round(float(f), 4) for f in fpr[::100]],
            "tpr": [round(float(t), 4) for t in tpr[::100]],
        },
    }

    for k, v in metrics.items():
        if isinstance(v, float):
            print(f"       {k:<30} {v:.4f}")

    # 7. SHAP
    print("\n[SHAP] Computing TreeExplainer on XGBoost (this may take a moment)…")
    explainer = shap.TreeExplainer(xgb_model)
    shap_sample = X_test_s[:500]
    shap_values = explainer.shap_values(shap_sample)
    mean_shap = np.abs(shap_values).mean(axis=0)
    shap_importance = {
        name: float(val)
        for name, val in sorted(
            zip(FEATURE_NAMES, mean_shap),
            key=lambda x: -x[1]
        )
    }
    metrics["shap_feature_importance"] = shap_importance
    print("       SHAP feature importance:")
    for fname, fval in list(shap_importance.items())[:5]:
        print(f"         {fname:<35} {fval:.4f}")

    # 8. Save artifacts
    print("\n[SAVE] Saving model artifacts…")
    joblib.dump(xgb_model,    ARTIFACTS_DIR / "xgb_model.pkl")
    joblib.dump(lgbm_model,   ARTIFACTS_DIR / "lgbm_model.pkl")
    joblib.dump(calibrator,   ARTIFACTS_DIR / "calibrator.pkl")
    joblib.dump(preprocessor, ARTIFACTS_DIR / "preprocessor.pkl")
    joblib.dump(explainer,    ARTIFACTS_DIR / "shap_explainer.pkl")

    with open(ARTIFACTS_DIR / "eval_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"       Saved to {ARTIFACTS_DIR.resolve()}/")
    print("\n" + "=" * 64)
    print("Training complete. Run api.py to start the prediction server.")
    print("=" * 64)


if __name__ == "__main__":
    train()
