# BRIS: Behavioral Risk Intelligence System

## About
BRIS (Behavioral Risk Intelligence System) is an analytical framework designed for the quantification of financial risk through the identification of behavioral drift. Modern credit scoring traditionally relies on static, point-in-time financial snapshots. BRIS provides a methodological shift by monitoring continuous transaction sequences to detect subtle, early-warning signals of financial distress that often precede default by 60 to 90 days.

## Project Status & Prototype Disclaimer
**This project is currently in the prototype stage.** It is designed as a research-grade demonstration of how behavioral drift can be modeled for credit risk assessment. 
- **Simulated Data**: All transaction data and subject summaries within this interface are synthetically generated for demonstration.
- **Inference Engine**: The current web-based interface utilizes a deterministic fallback engine to simulate model predictions. The full multi-model backend (Python/FastAPI) is required for high-fidelity inference.
- **Not for Commercial Use**: This system has not undergone the mandatory auditing required for commercial lending by the FCRA, GDPR, or the EU AI Act. It should be used for research and evaluation purposes only.

## Core Methodology
The system architecture prioritizes model robustness and interpretability, utilizing a calibrated ensemble approach suitable for high-stakes financial environments.

### Ensemble Architecture
The core prediction system combines multiple learning paradigms to balance snapshot precision with temporal awareness:
- **Gradient Boosted Ensembles**: Utilizes XGBoost and LightGBM to process high-dimensional tabular snapshots and behavioral rate-of-change markers.
- **Recurrent Architectures**: Incorporates LSTM (Long Short-Term Memory) layers to ingest sequential transaction data, capturing multi-period temporal dependencies.

### Statistical Calibration and Reliability
To ensure the integrity of the predicted risk scores, the system implements:
- **Platt Scaling**: Raw model outputs undergo logistic regression on a held-out verification set to transform them into well-calibrated probabilities.
- **Epistemic Uncertainty**: Monte Carlo (MC) Dropout (n=500 iterations) is utilized to estimate model confidence intervals, allowing analysts to distinguish between high-risk predictions and high-uncertainty regions of the feature space.

## Key Analytical Features

### Behavioral Drift Quantification
Risk is conceptualized as the statistical deviation from a 90-day moving behavioral baseline. The framework monitors specific signals including:
- **Utilization Velocity**: The normalized rate of credit limit exhaustion.
- **Payment Delay Trajectory**: Shifts in the mean and variance of payment timing relative to historical norms.
- **Spending Volatility**: The 30-day coefficient of transaction variation, serving as a proxy for income irregularity and financial stress.

### Explainable AI (XAI) Protocol
Regulatory compliance (e.g., EU AI Act, Basel III) requires transparency in automated decisioning. BRIS utilizes SHAP (SHapley Additive exPlanations) to provide local feature attribution for every individual assessment. This mathematical decomposition allows for a precise understanding of the specific behavioral drivers behind any given risk elevation.

## Critical Limitations
Researchers utilizing this framework should be aware of the following:
1. **Feature Engineering Scope**: The system currently models five primary behavioral vectors. Additional features (e.g., merchant category diversity, income stability) are approximated.
2. **Temporal Resolution**: High-fidelity drift detection requires transaction-level granularity (real-time). The current sliders simulate aggregated behavioral shifts.
3. **Data Sovereignty**: While local storage is used for privacy, this does not constitute a hardened encryption strategy for highly sensitive financial PII.

## Technical Specifications
- **Client Interface**: React 18, Vite, Recharts (Modern SaaS Layout).
- **Backend Analytics**: Python 3.11, FastAPI, Scikit-Learn.
- **Storage**: Client-side localStorage for sensitive subject data.

## Academic Foundations
This framework builds upon established research in credit risk and machine learning:
- **Thomas, L. C., et al. (2002)**: Fundamental principles of credit scoring.
- **Lundberg, S. M., & Lee, S.-I. (2017)**: Theoretical framework for SHAP attribution.
- **Gal, Y., & Ghahramani, Z. (2016)**: Bayesian approximations via Dropout.

## License
Licensed under the MIT License.
