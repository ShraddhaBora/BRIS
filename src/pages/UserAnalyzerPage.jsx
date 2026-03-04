import { useState, useEffect } from 'react';
import {
    Activity, ShieldAlert, ArrowRight, Clock,
    Search, Download, FileJson, AlertTriangle,
    CheckCircle, Trash2, RefreshCcw, Info
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { getCategory } from '../utils/risk';

// ── Mock Constants ──────────────────────────────────────────────────────────
const BENCHMARKS = {
    creditUtil: 62,
    paymentDelay: 18,
    volatility: 45,
    incomeStability: 65
};

// ── Local Utils ─────────────────────────────────────────────────────────────
const saveHistory = (email, history) => {
    localStorage.setItem(`bris_history_${email}`, JSON.stringify(history.slice(0, 20)));
}

// ── Defaults ──────────────────────────────────────────────────────────────────
const DEFAULTS = {
    userId: '', name: '', age: '',
    creditUtil: 50, paymentDelay: 15, volatility: 40,
    incomeStability: 70, missedPayments: 1, avgBalance: 12000,
    monthlyIncome: 5000, employmentStatus: 'employed'
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function UserAnalyzerPage({ user }) {
    const [activeTab, setActiveTab] = useState('analyzer');
    const [form, setForm] = useState(DEFAULTS);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState(() => {
        try { return JSON.parse(localStorage.getItem(`bris_history_${user?.email}`) || '[]'); }
        catch { return []; }
    });

    const setF = (key, val) => setForm(p => ({ ...p, [key]: val }));

    const analyze = () => {
        if (!form.name || !form.userId) return;
        setLoading(true);
        setTimeout(() => {
            const score = Math.min(0.98, Math.max(0.02,
                (form.creditUtil / 100) * 0.4 +
                (form.paymentDelay / 90) * 0.35 +
                (form.volatility / 100) * 0.15 +
                (1 - form.incomeStability / 100) * 0.1
            ));

            const newEntry = {
                id: Date.now(),
                timestamp: new Date().toLocaleString(),
                form: { ...form },
                score
            };

            const updatedHistory = [newEntry, ...history];
            setHistory(updatedHistory);
            saveHistory(user.email, updatedHistory);
            setResult(newEntry);
            setLoading(false);
            window.dispatchEvent(new CustomEvent('bris-refresh'));
        }, 1200);
    };

    const deleteEntry = (id, e) => {
        e.stopPropagation();
        const updated = history.filter(h => h.id !== id);
        setHistory(updated);
        saveHistory(user.email, updated);
        window.dispatchEvent(new CustomEvent('bris-refresh'));
    };

    const clearHistory = () => {
        if (window.confirm('Are you sure you want to clear all analysis history for this account?')) {
            setHistory([]);
            saveHistory(user.email, []);
            window.dispatchEvent(new CustomEvent('bris-refresh'));
        }
    };

    const loadEntry = (entry) => {
        setResult(entry);
        setForm(entry.form);
        setActiveTab('analyzer');
    };

    const exportJSON = () => {
        const data = JSON.stringify(result || history, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bris-export-${Date.now()}.json`;
        a.click();
    };

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            {/* Tabs */}
            <div className="tab-nav">
                <button className={`tab-btn ${activeTab === 'analyzer' ? 'active' : ''}`} onClick={() => setActiveTab('analyzer')}>
                    <RefreshCcw size={14} /> Analyzer
                </button>
                <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                    <Clock size={14} /> History ({history.length})
                </button>
            </div>

            {activeTab === 'analyzer' ? (
                <div className="analyzer-layout">
                    {/* Input Column */}
                    <div className="card analyzer-form">
                        <div className="sec-head">
                            <div className="sec-dot" />
                            <span className="sec-title">Subject Profile</span>
                        </div>

                        <div className="form-grid-2">
                            <div className="form-row">
                                <label className="form-label">Case ID</label>
                                <input className="form-input" type="text" placeholder="UID-000-000" value={form.userId} onChange={e => setF('userId', e.target.value)} />
                            </div>
                            <div className="form-row">
                                <label className="form-label">Full Name</label>
                                <input className="form-input" type="text" placeholder="John Doe" value={form.name} onChange={e => setF('name', e.target.value)} />
                            </div>
                        </div>

                        <div className="form-grid-2">
                            <div className="form-row">
                                <label className="form-label">Age</label>
                                <input className="form-input" type="number" value={form.age} onChange={e => setF('age', e.target.value)} />
                            </div>
                            <div className="form-row">
                                <label className="form-label">Employment</label>
                                <select className="form-input" value={form.employmentStatus} onChange={e => setF('employmentStatus', e.target.value)}>
                                    <option value="employed">Employed</option>
                                    <option value="self-employed">Self-Employed</option>
                                    <option value="unemployed">Unemployed</option>
                                    <option value="student">Student</option>
                                </select>
                            </div>
                        </div>

                        <div className="divider" />

                        <div className="form-row">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <label className="form-label">Credit Util. (%)</label>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{form.creditUtil}%</span>
                            </div>
                            <input className="form-range" type="range" min="0" max="100" value={form.creditUtil} onChange={e => setF('creditUtil', Number(e.target.value))} />
                        </div>

                        <div className="form-row">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <label className="form-label">Payment Delay (d)</label>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{form.paymentDelay}d</span>
                            </div>
                            <input className="form-range" type="range" min="0" max="90" value={form.paymentDelay} onChange={e => setF('paymentDelay', Number(e.target.value))} />
                        </div>

                        <div className="form-row">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <label className="form-label">Volatility (%)</label>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{form.volatility}%</span>
                            </div>
                            <input className="form-range" type="range" min="0" max="100" value={form.volatility} onChange={e => setF('volatility', Number(e.target.value))} />
                        </div>

                        <div className="form-row">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <label className="form-label">Income Stability (%)</label>
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{form.incomeStability}%</span>
                            </div>
                            <input className="form-range" type="range" min="0" max="100" value={form.incomeStability} onChange={e => setF('incomeStability', Number(e.target.value))} />
                        </div>

                        <div className="form-row">
                            <label className="form-label">Monthly Income ($)</label>
                            <input className="form-input" type="number" min={0} value={form.monthlyIncome} onChange={e => setF('monthlyIncome', Number(e.target.value))} />
                        </div>

                        <button className="btn btn-primary" onClick={analyze} disabled={loading} style={{ width: '100%', marginTop: 8 }}>
                            {loading ? 'Running ensemble model...' : 'Run Risk Analysis'}
                            {!loading && <ArrowRight size={16} />}
                        </button>
                    </div>

                    {/* Result Column */}
                    <div className="analyzer-result">
                        {!result && !loading ? (
                            <div className="empty-state card" style={{ height: '100%' }}>
                                <div className="empty-icon"><Search size={28} color="var(--t3)" /></div>
                                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--t1)' }}>Ready for Analysis</div>
                                <div style={{ fontSize: 12.5, color: 'var(--t2)', maxWidth: 260, lineHeight: 1.7 }}>
                                    Enter background data and behavioral indicators to compute the risk score.
                                </div>
                            </div>
                        ) : loading ? (
                            <div className="empty-state card" style={{ height: '100%' }}>
                                <div className="loader" />
                                <div style={{ fontSize: 13, color: 'var(--t2)', marginTop: 16 }}>Running Gradient Boosting Models...</div>
                            </div>
                        ) : (
                            <div className="card fadein" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div className="sec-head">
                                    <div className="sec-dot" />
                                    <span className="sec-title">Analysis Output</span>
                                    <div className="sec-actions">
                                        <span className="tag" style={{ background: 'var(--s3)' }}>{result.timestamp.split(',')[1]}</span>
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    {/* Score Gauge */}
                                    <div style={{ padding: '20px 0', textAlign: 'center' }}>
                                        <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Computed Risk Score</div>
                                        <div style={{ fontSize: 52, fontWeight: 800, color: getCategory(result.score).color, lineHeight: 1, fontFamily: 'var(--mono)' }}>
                                            {Math.round(result.score * 100)}%
                                        </div>
                                        <div className={`risk-badge ${getCategory(result.score).cls}`} style={{ marginTop: 12, padding: '4px 14px' }}>
                                            {getCategory(result.score).label}
                                        </div>
                                    </div>

                                    <div className="divider" />

                                    {/* Feature Insights */}
                                    <div style={{ marginTop: 15 }}>
                                        <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--t1)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Activity size={14} /> Feature Attribution (SHAP)
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            <SHAPBar label="Credit Utilization" val={result.form.creditUtil} bench={BENCHMARKS.creditUtil} color="#3b82f6" />
                                            <SHAPBar label="Payment Pipeline" val={result.form.paymentDelay} bench={BENCHMARKS.paymentDelay} color="#8b5cf6" max={90} />
                                            <SHAPBar label="Transaction Vol." val={result.form.volatility} bench={BENCHMARKS.volatility} color="#f59e0b" />
                                            <SHAPBar label="Income Density" val={result.form.incomeStability} bench={BENCHMARKS.incomeStability} color="#10b981" />
                                        </div>
                                    </div>

                                    <div className="divider" style={{ margin: '20px 0' }} />

                                    {/* Uncertainty Metrics */}
                                    <div style={{ background: 'var(--s2)', padding: 12, borderRadius: 6, border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase' }}>Uncertainty Quantification</div>
                                            <Info size={12} color="var(--t3)" />
                                        </div>
                                        <div style={{ display: 'flex', gap: 12 }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 10, color: 'var(--t2)', marginBottom: 2 }}>Aleatoric (Data)</div>
                                                <div style={{ height: 3, background: 'var(--s3)', borderRadius: 2 }}><div style={{ height: '100%', width: '15%', background: 'var(--accent)' }} /></div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 10, color: 'var(--t2)', marginBottom: 2 }}>Epistemic (Model)</div>
                                                <div style={{ height: 3, background: 'var(--s3)', borderRadius: 2 }}><div style={{ height: '100%', width: '8%', background: 'var(--purple)' }} /></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Verdict notice */}
                                    {result.score >= 0.70 && (
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '9px 12px', background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: 6, marginTop: 12, fontSize: 12, color: 'var(--t2)' }}>
                                            <AlertTriangle size={14} color="var(--red)" />
                                            <span>Subject exhibits pre-default convergence patterns.</span>
                                        </div>
                                    )}
                                    {result.score < 0.45 && (
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '9px 12px', background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.12)', borderRadius: 6, marginTop: 12, fontSize: 12, color: 'var(--t2)' }}>
                                            <CheckCircle size={14} color="var(--green)" />
                                            <span>Subject profile remains within historical stability bounds.</span>
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
                                        <button onClick={() => window.print()} className="btn btn-outline" style={{ justifyContent: 'center', fontSize: 11 }}>
                                            <Download size={14} /> Print Report
                                        </button>
                                        <button onClick={exportJSON} className="btn btn-outline" style={{ justifyContent: 'center', fontSize: 11 }}>
                                            <FileJson size={14} /> Export JSON
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="card fadein">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div className="sec-head" style={{ marginBottom: 0 }}>
                            <div className="sec-dot" />
                            <span className="sec-title">Recent History</span>
                        </div>
                        {history.length > 0 && (
                            <button onClick={clearHistory} className="btn btn-outline" style={{ color: 'var(--red)', borderColor: 'rgba(239,68,68,0.2)', padding: '4px 10px', fontSize: 11 }}>
                                <Trash2 size={13} /> Clear All
                            </button>
                        )}
                    </div>
                    {history.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon"><Clock size={20} color="var(--t3)" /></div>
                            <div style={{ fontSize: 13, color: 'var(--t2)' }}>No analyses yet</div>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 36 }} />
                                    <th>Subject</th>
                                    <th style={{ textAlign: 'center' }}>Score</th>
                                    <th style={{ textAlign: 'center' }}>Category</th>
                                    <th>When</th>
                                    <th />
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(h => {
                                    const hc = getCategory(h.score);
                                    return (
                                        <tr key={h.id} onClick={() => loadEntry(h)} style={{ cursor: 'pointer' }}>
                                            <td>
                                                <div style={{ width: 26, height: 26, borderRadius: 6, background: `${hc.color.replace('var', '')}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 10, color: hc.color }}>
                                                    {h.form.name?.[0]?.toUpperCase() || '?'}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{h.form.name}</div>
                                                <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>{h.form.userId}</div>
                                            </td>
                                            <td style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontWeight: 700, color: hc.color }}>{Math.round(h.score * 100)}%</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className={`risk-badge ${hc.cls}`} style={{ fontSize: 9.5 }}>{hc.label}</span>
                                            </td>
                                            <td style={{ fontSize: 11, color: 'var(--t3)' }}>{h.timestamp}</td>
                                            <td>
                                                <button onClick={e => deleteEntry(h.id, e)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: 4, transition: 'color 0.15s' }}
                                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}

function SHAPBar({ label, val, bench, color, max = 100 }) {
    const pVal = (val / max) * 100;
    const pBench = (bench / max) * 100;
    const diff = val - bench;

    return (
        <div style={{ fontSize: 11 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--t2)' }}>{label}</span>
                <span style={{ color: diff > 0 ? 'var(--red)' : 'var(--green)', fontWeight: 700 }}>
                    {diff > 0 ? '+' : ''}{diff}%
                </span>
            </div>
            <div style={{ height: 6, background: 'var(--s3)', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pVal}%`, background: color, borderRadius: 3 }} />
                <div style={{ position: 'absolute', top: 0, left: `${pBench}%`, width: 1.5, height: '100%', background: 'white', opacity: 0.5 }} />
            </div>
        </div>
    );
}
