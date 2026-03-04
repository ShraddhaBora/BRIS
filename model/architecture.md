# Model Ensemble Architecture

This document provides a technical deep-dive into the modeling logic used within the BRIS platform.

## Ensemble Design
BRIS utilizes a linear-weighted ensemble approach for classification. The raw probability score $P_{ensemble}$ is derived from individual base learners:

$$P_{ensemble} = w_1 P_{XGB} + w_2 P_{LGBM} + w_3 P_{LSTM}$$

Where:
- $w_1 = 0.40$ (XGBoost)
- $w_2 = 0.35$ (LightGBM)
- $w_3 = 0.25$ (LSTM)

### Base Learners
1. **XGBoost**: Serves as the primary tree-based learner, optimized for capturing non-linear interactions between static behavioral features (e.g., Utilization vs. Income).
2. **LightGBM**: Employed for its efficiency with leaf-wise growth, often better at capturing sparse signals in payment delay categorical data.
3. **LSTM**: Processes temporal sequences of credit utilization over a 90-day window (normalized to [0,1]) to identify "downward spirals" that tabular models might miss.

## Calibration Layer
To ensure the output represents a true likelihood of default, we apply Platt Scaling:

$$P(y=1 | x) = \frac{1}{1 + \exp(A \cdot f(x) + B)}$$

Parameters $A$ and $B$ are estimated via maximum likelihood on a held-out calibration set (20% of the training data).

## Synthetic Data Synthesis
In the absence of a real-time banking feed, the training pipeline utilizes a Gaussian Copula approach to generate realistic behavioral data. Marginal distributions for each feature (Beta for Utilization, Poisson for Delays) are shifted for the "Default" cohort to reproduce known empirical risk clusters.

### Drift Simulation
Drift is simulated by applying a persistent variance increase and a mean-shift to the behavioral parameters of a subject over a 24-month horizon, mimicking financial deterioration.
