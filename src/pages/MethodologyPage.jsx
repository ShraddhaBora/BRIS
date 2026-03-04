import { FileText, Info, AlertCircle } from 'lucide-react';

const REFERENCES = [
    { id: '[1]', text: 'Thomas, L. C., Edelman, D. B., & Crook, J. N. (2002). Credit Scoring and Its Applications. SIAM.' },
    { id: '[2]', text: 'Siddiqi, N. (2012). Credit Risk Scorecards: Developing and Implementing Intelligent Credit Scoring. Wiley.' },
    { id: '[3]', text: 'Lundberg, S. M., & Lee, S.-I. (2017). A unified approach to interpreting model predictions. NeurIPS 30.' },
    { id: '[4]', text: 'Chen, T., & Guestrin, C. (2016). XGBoost: A scalable tree boosting system. KDD \'16.' },
    { id: '[5]', text: 'Ke, G., et al. (2017). LightGBM: A highly efficient gradient boosting decision tree. NeurIPS 30.' },
];

const FEATURES = [
    { name: 'Credit Utilization (%)', weight: '35%', desc: 'Current revolving utilization vs limits.' },
    { name: 'Payment Delay (days)', weight: '25%', desc: 'Mean days past due across history.' },
    { name: 'Spending Volatility (%)', weight: '18%', desc: '30-day coefficient of transaction variation.' },
    { name: 'Income Stability (%)', weight: '14%', desc: 'Consistency of periodic deposits.' },
    { name: 'Arrears History', weight: '8%', desc: 'Count of severe delinquency events (90d+).' },
];

function Sec({ title, children }) {
    return (
        <div className="card fadein">
            <div className="sec-head">
                <div className="sec-dot" />
                <span className="sec-title">{title}</span>
            </div>
            {children}
        </div>
    );
}

export default function MethodologyPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Sec title="System Overview">
                <p style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 20 }}>
                    BRIS (Behavioral Risk Intelligence System) is an ensemble-based framework designed to predict credit default and financial stress. Unlike traditional static models, BRIS focuses on <strong>behavioral drift</strong> — identifying shifts in transaction patterns that precede financial distress by 60 to 90 days.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    <div style={{ padding: 16, background: 'var(--s2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>Ensemble Modeling</div>
                        <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.5 }}>Combines XGBoost and LightGBM for robust classification across diverse behavioral snapshots.</div>
                    </div>
                    <div style={{ padding: 16, background: 'var(--s2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>Platt Calibration</div>
                        <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.5 }}>Isotonic regression ensures modeled probabilities align with empirical default frequencies.</div>
                    </div>
                    <div style={{ padding: 16, background: 'var(--s2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>Explainability</div>
                        <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.5 }}>SHAP values provide per-prediction transparency into risk-contributing behavioral features.</div>
                    </div>
                </div>
            </Sec>

            <Sec title="Feature Rationale">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Predictor</th>
                            <th>Attribution</th>
                            <th>Analytical Rationale</th>
                        </tr>
                    </thead>
                    <tbody>
                        {FEATURES.map(f => (
                            <tr key={f.name}>
                                <td style={{ fontWeight: 600, color: 'var(--t1)' }}>{f.name}</td>
                                <td style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', fontWeight: 700 }}>{f.weight}</td>
                                <td style={{ fontSize: 13, color: 'var(--t2)' }}>{f.desc}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Sec>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <Sec title="Research Background">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {REFERENCES.map(r => (
                            <div key={r.id} style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--t2)', lineHeight: 1.5 }}>
                                <span style={{ color: 'var(--t3)', fontSize: 11, fontFamily: 'var(--mono)', flexShrink: 0, marginTop: 2 }}>{r.id}</span>
                                <span>{r.text}</span>
                            </div>
                        ))}
                    </div>
                </Sec>

                <Sec title="System Implementation">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div style={{ padding: 16, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 8, textTransform: 'uppercase' }}>Frontend Environment</div>
                            <div style={{ fontSize: 12, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>Vite + React · Recharts · Lucide</div>
                        </div>
                        <div style={{ padding: 16, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 8, textTransform: 'uppercase' }}>Model Pipeline</div>
                            <div style={{ fontSize: 12, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>Python 3.11 · Scikit-Learn · XGBoost</div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, padding: 12, background: 'var(--accent-lo)', borderRadius: 8 }}>
                            <Info size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                            <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5 }}>
                                Predictions are computed locally using a simulated engine. Production systems sync via the FastAPI backend.
                            </div>
                        </div>
                    </div>
                </Sec>
            </div>
        </div>
    );
}
