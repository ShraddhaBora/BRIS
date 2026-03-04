import { useState, useMemo } from 'react';
import { RotateCcw, TrendingUp, Info } from 'lucide-react';

const PARAMS = [
    { key: 'creditUtil', label: 'Credit Utilization (%)', min: 0, max: 100, weight: 0.35, color: 'var(--accent)' },
    { key: 'paymentDelay', label: 'Payment Delay (days)', min: 0, max: 90, weight: 0.25, color: 'var(--red)' },
    { key: 'volatility', label: 'Spending Volatility (%)', min: 0, max: 100, weight: 0.18, color: 'var(--purple)' },
    { key: 'incomeStability', label: 'Income Stability (%)', min: 0, max: 100, weight: 0.14, inverse: true, color: 'var(--green)' },
];

const DEFAULTS = { creditUtil: 42, paymentDelay: 8, volatility: 35, incomeStability: 75 };

function compute(v) {
    let s = 0.12; // Base
    s += (v.creditUtil / 100) * 0.35;
    s += (v.paymentDelay / 90) * 0.25;
    s += (v.volatility / 100) * 0.18;
    s -= (v.incomeStability / 100) * 0.14;
    return Math.max(0.02, Math.min(0.99, s));
}

export default function StressSimulator() {
    const [vals, setVals] = useState({ ...DEFAULTS });
    const score = useMemo(() => compute(vals), [vals]);
    const pct = Math.round(score * 100);

    return (
        <div className="card">
            <div className="sec-head">
                <div className="sec-dot" />
                <span className="sec-title">Risk Scenario Simulator</span>
                <div className="sec-actions">
                    <button onClick={() => setVals({ ...DEFAULTS })} className="btn btn-outline" style={{ height: 28, padding: '0 8px', fontSize: 11 }}>
                        <RotateCcw size={12} /> Reset to Baseline
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>
                {/* Sliders */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {PARAMS.map(p => (
                        <div key={p.key} className="card" style={{ background: 'var(--s2)', border: 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t2)' }}>{p.label}</span>
                                <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--mono)', color: p.color }}>{vals[p.key]}</span>
                            </div>
                            <input
                                type="range"
                                className="form-range"
                                min={p.min}
                                max={p.max}
                                value={vals[p.key]}
                                onChange={e => setVals(v => ({ ...v, [p.key]: Number(e.target.value) }))}
                            />
                        </div>
                    ))}

                    <div className="card" style={{ gridColumn: 'span 2', background: 'var(--accent-lo)', border: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Info size={16} color="var(--accent)" />
                        <span style={{ fontSize: 13, color: 'var(--t2)' }}>
                            Adjust parameters to observe how marginal shifts in behavior impact the ensemble risk score in real-time.
                        </span>
                    </div>
                </div>

                {/* Score Output */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card" style={{ textAlign: 'center', padding: '32px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Simulated Probability</div>
                        <div style={{ fontSize: 64, fontWeight: 800, fontFamily: 'var(--mono)', color: pct > 70 ? 'var(--red)' : pct > 45 ? 'var(--amber)' : 'var(--green)', lineHeight: 1 }}>
                            {pct}%
                        </div>
                        <div style={{ marginTop: 20, fontSize: 14, fontWeight: 600, color: 'var(--t2)' }}>
                            Category: <span style={{ color: pct > 70 ? 'var(--red)' : pct > 45 ? 'var(--amber)' : 'var(--green)' }}>{pct > 70 ? 'High' : pct > 45 ? 'Moderate' : 'Stable'}</span>
                        </div>
                    </div>

                    <div className="card" style={{ background: 'var(--s2)', border: 'none' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <TrendingUp size={14} /> Sensitivity Profile
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {PARAMS.map(p => {
                                const impact = (vals[p.key] / p.max) * 100;
                                return (
                                    <div key={p.key}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--t3)', marginBottom: 4 }}>
                                            <span>{p.label}</span>
                                            <span>{impact.toFixed(0)}%</span>
                                        </div>
                                        <div style={{ height: 4, background: 'var(--s3)', borderRadius: 2, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${impact}%`, background: p.color }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
