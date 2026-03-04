export const MOCK_SERIES = Array.from({ length: 24 }, (_, i) => {
  const month = i + 1;
  const base = 0.42 + (i * 0.013);
  const volatility = Math.sin(i * 0.7) * 0.08 + Math.random() * 0.04;
  const delay = 10 + Math.sin(i * 0.5) * 6 + (i > 18 ? (i - 18) * 1.5 : 0);
  const utilization = 0.45 + i * 0.018 + Math.sin(i * 1.1) * 0.05;
  const drift = i > 16 ? (i - 16) * 0.04 + Math.random() * 0.02 : Math.random() * 0.015;
  return {
    month: `M${String(month).padStart(2, '0')}`,
    riskScore: Math.min(0.99, base + volatility),
    spendingVolatility: Math.max(0.05, 0.2 + Math.sin(i * 0.8) * 0.12 + (i > 17 ? (i - 17) * 0.018 : 0)),
    paymentDelay: parseFloat(delay.toFixed(1)),
    creditUtilization: Math.min(0.99, utilization),
    driftScore: parseFloat(drift.toFixed(3)),
  };
});

export const SHAP_FEATURES = [
  { name: 'Credit Utilization Spike', value: 0.312, positive: true },
  { name: 'Payment Delay Trend', value: 0.248, positive: true },
  { name: 'Spending Volatility (30d)', value: 0.187, positive: true },
  { name: 'Transaction Frequency Drop', value: 0.143, positive: true },
  { name: 'Behavioral Drift Score', value: 0.124, positive: true },
  { name: 'Income Stability Index', value: -0.198, positive: false },
  { name: 'On-time Payment Streak', value: -0.156, positive: false },
  { name: 'Average Balance (90d)', value: -0.134, positive: false },
  { name: 'Savings Ratio', value: -0.102, positive: false },
  { name: 'Merchant Diversity Score', value: -0.078, positive: false },
];

export const MODELS = [
  // Metrics shown are reference values from training on synthetic behavioral data.
  // Actual metrics from your training run are saved to model/artifacts/eval_metrics.json.
  { name: 'XGBoost Gradient Boost', version: 'v3.2.1', accuracy: '87.4%', auc: '0.891', type: 'Ensemble', color: '#3b82f6' },
  { name: 'LightGBM Classifier', version: 'v2.8.0', accuracy: '86.9%', auc: '0.887', type: 'Ensemble', color: '#60a5fa' },
  { name: 'LSTM Temporal Network', version: 'v1.5.3', accuracy: '—', auc: '—', type: 'Sequential', color: '#8b5cf6' },
];

export const DRIFT_EVENTS = [
  { date: '2026-03-03', title: 'Critical Drift Detected', desc: 'Behavioral pattern deviated >2.4σ from 90-day baseline. Credit utilization spiked +38%.', severity: 'high' },
  { date: '2026-02-18', title: 'Payment Gap Anomaly', desc: 'Unusual 18-day payment gap identified. Risk acceleration score increased by 0.31.', severity: 'medium' },
  { date: '2026-02-01', title: 'Spending Regime Shift', desc: 'Average transaction size increased 2.1x. Category drift toward high-volatility merchants.', severity: 'medium' },
  { date: '2026-01-14', title: 'Moderate Volatility Increase', desc: 'Rolling 30d spending variance crossed threshold. Monitoring intensified.', severity: 'low' },
  { date: '2026-01-02', title: 'Baseline Established', desc: 'Initial behavioral baseline snapshot captured. All metrics within normal range.', severity: 'info' },
];

export const RISK_USERS = [
  { id: 'USR-0041', name: 'Marcus Chen', score: 0.87, category: 'high', trend: '+0.12', delta: 'up' },
  { id: 'USR-0189', name: 'Priya Sharma', score: 0.73, category: 'high', trend: '+0.07', delta: 'up' },
  { id: 'USR-0302', name: 'Luca Ferrari', score: 0.61, category: 'medium', trend: '+0.03', delta: 'up' },
  { id: 'USR-0457', name: 'Sara Lindqvist', score: 0.54, category: 'medium', trend: '-0.02', delta: 'down' },
  { id: 'USR-0673', name: 'James Okafor', score: 0.29, category: 'low', trend: '-0.09', delta: 'down' },
  { id: 'USR-0891', name: 'Mei Tanaka', score: 0.21, category: 'low', trend: '-0.04', delta: 'down' },
];
