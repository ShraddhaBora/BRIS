import { MODELS } from '../data/mockData';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const RADAR_DATA = [
    { metric: 'Accuracy', XGBoost: 94, LightGBM: 94, LSTM: 92 },
    { metric: 'AUC-ROC', XGBoost: 97, LightGBM: 97, LSTM: 95 },
    { metric: 'Precision', XGBoost: 93, LightGBM: 92, LSTM: 90 },
    { metric: 'Recall', XGBoost: 91, LightGBM: 90, LSTM: 89 },
    { metric: 'F1 Score', XGBoost: 92, LightGBM: 91, LSTM: 89 },
    { metric: 'Latency', XGBoost: 85, LightGBM: 95, LSTM: 60 },
];

const GLOBAL_IMPORTANCE = [
    { name: 'Credit Utilization', weight: 0.35, color: 'var(--red)' },
    { name: 'Payment Delay', weight: 0.25, color: 'var(--amber)' },
    { name: 'Spending Volatility', weight: 0.18, color: 'var(--purple)' },
    { name: 'Income Stability', weight: 0.14, color: 'var(--accent)' },
    { name: 'Transaction History', weight: 0.08, color: 'var(--t2)' },
];

export default function ModelInsightsPage() {
    return (
        <div className="fadein" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Model Summary Cards */}
            <div className="grid-2">
                {MODELS.map(m => (
                    <div key={m.name} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 8 }}>{m.name}</div>
                            <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--mono)', color: m.color }}>{m.auc}</div>
                            <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 4 }}>Area Under Curve (ROC)</div>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <span className="tag tag-default" style={{ background: 'var(--s2)' }}>{m.version}</span>
                            <span className="tag tag-default" style={{ background: 'var(--s2)' }}>{m.type}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
                <div className="card">
                    <div className="sec-head">
                        <div className="sec-dot" />
                        <span className="sec-title">Performance Comparison</span>
                    </div>
                    <div style={{ height: 300, marginTop: 20 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={RADAR_DATA}>
                                <PolarGrid stroke="var(--border)" />
                                <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--t3)', fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                                    itemStyle={{ padding: '2px 0' }}
                                />
                                <Radar name="XGBoost" dataKey="XGBoost" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
                                <Radar name="LightGBM" dataKey="LightGBM" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={2} />
                                <Radar name="LSTM" dataKey="LSTM" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <div className="sec-head">
                        <div className="sec-dot" />
                        <span className="sec-title">Global Importance</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>
                        {GLOBAL_IMPORTANCE.map(fi => (
                            <div key={fi.name}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                                    <span style={{ color: 'var(--t2)', fontWeight: 600 }}>{fi.name}</span>
                                    <span style={{ color: 'var(--t1)', fontFamily: 'var(--mono)', fontWeight: 700 }}>{(fi.weight * 100).toFixed(0)}%</span>
                                </div>
                                <div style={{ height: 4, background: 'var(--s3)', borderRadius: 2, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${fi.weight * 100}%`, background: fi.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Architecture Overview */}
            <div className="card">
                <div className="sec-head">
                    <div className="sec-dot" />
                    <span className="sec-title">Ensemble Strategy</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                    {[
                        {
                            title: 'Tree-based Gradient Boosting',
                            body: 'XGBoost and LightGBM handle tabular behavioral snapshots, providing high precision on utilization and payment markers.',
                        },
                        {
                            title: 'Temporal LSTMs',
                            body: 'Recurrent networks process transaction sequences to detect subtle behavioral drift that static models might overlook.',
                        },
                        {
                            title: 'Platt Calibration',
                            body: 'Raw model outputs are calibrated via isotonic regression to ensure predicted probabilities match empirical default rates.',
                        },
                    ].map(c => (
                        <div key={c.title} style={{ padding: '16px', background: 'var(--s2)', borderRadius: 8 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', marginBottom: 10 }}>{c.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.6 }}>{c.body}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
