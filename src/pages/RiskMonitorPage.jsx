import { useState, useEffect } from 'react';
import { ShieldAlert, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getCategory } from '../utils/risk';

function getHistory(email) {
    try { return JSON.parse(localStorage.getItem(`bris_history_${email}`) || '[]'); }
    catch { return []; }
}

const TOOLTIP_STYLE = {
    background: '#1a2333', border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 6, fontSize: 11, color: '#d1d9e6',
};

export default function RiskMonitorPage({ user }) {
    const [history, setHistory] = useState(() => getHistory(user?.email || ''));

    useEffect(() => {
        const refresh = () => setHistory(getHistory(user?.email || ''));
        window.addEventListener('bris-refresh', refresh);
        const poll = setInterval(refresh, 4000);
        return () => { window.removeEventListener('bris-refresh', refresh); clearInterval(poll); };
    }, [user]);

    const hasData = history.length > 0;
    const highRisk = history.filter(h => h.score >= 0.70);
    const moderate = history.filter(h => h.score >= 0.45 && h.score < 0.70);
    const stable = history.filter(h => h.score < 0.45);

    const chartData = history.slice().reverse().map((h, i) => ({
        label: h.form.userId || `#${i + 1}`,
        risk: parseFloat((h.score * 100).toFixed(1)),
        color: h.score >= 0.70 ? '#ef4444' : h.score >= 0.45 ? '#f59e0b' : '#22c55e',
    }));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: '8px 13px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 11.5, color: 'var(--t2)', display: 'flex', gap: 7, alignItems: 'center' }}>
                <Info size={12} color="var(--t3)" style={{ flexShrink: 0 }} />
                Shows all analyses submitted by <strong style={{ color: 'var(--t1)' }}>{user?.name}</strong> in this browser session.
                {!hasData && <span style={{ color: 'var(--amber)' }}> — No data yet. Run an analysis first.</span>}
            </div>

            {hasData ? (
                <>
                    <div className="grid-2">
                        {/* Bar chart */}
                        <div className="card">
                            <div className="sec-head">
                                <div className="sec-dot" />
                                <span className="sec-title">Risk Score per Subject</span>
                            </div>
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--t3)' }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 10, fill: 'var(--t3)' }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Risk Score']} />
                                    <Bar dataKey="risk" radius={[3, 3, 0, 0]}>
                                        {chartData.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.8} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Summary */}
                        <div className="card">
                            <div className="sec-head">
                                <div className="sec-dot" />
                                <span className="sec-title">Case Summary</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { label: 'High Risk', count: highRisk.length, color: '#ef4444', desc: 'Score ≥ 70% · immediate review' },
                                    { label: 'Moderate Risk', count: moderate.length, color: '#f59e0b', desc: 'Score 45–69% · increased monitoring' },
                                    { label: 'Stable', count: stable.length, color: '#22c55e', desc: 'Score < 45% · standard cadence' },
                                    { label: 'Total', count: history.length, color: '#3b82f6', desc: 'All analyses in session' },
                                ].map(a => (
                                    <div key={a.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: `${a.color}07`, border: `1px solid ${a.color}18`, borderRadius: 6 }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <ShieldAlert size={12} color={a.color} />
                                                <span style={{ fontSize: 12.5, color: 'var(--t1)', fontWeight: 600 }}>{a.label}</span>
                                            </div>
                                            <div style={{ fontSize: 10.5, color: 'var(--t3)', marginTop: 2 }}>{a.desc}</div>
                                        </div>
                                        <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--mono)', color: a.count > 0 ? a.color : 'var(--t3)' }}>{a.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Full table */}
                    <div className="card">
                        <div className="sec-head">
                            <div className="sec-dot" />
                            <span className="sec-title">All Subjects ({history.length})</span>
                            <div className="sec-actions">
                                {highRisk.length > 0 && <span className="tag tag-red">{highRisk.length} High Risk</span>}
                            </div>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 36 }} />
                                    <th>Subject</th>
                                    <th style={{ textAlign: 'center' }}>Score</th>
                                    <th style={{ textAlign: 'center' }}>Credit Util.</th>
                                    <th style={{ textAlign: 'center' }}>Pmt. Delay</th>
                                    <th style={{ textAlign: 'center' }}>Volatility</th>
                                    <th style={{ textAlign: 'center' }}>Category</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(h => {
                                    const hcat = getCategory(h.score);
                                    return (
                                        <tr key={h.id}>
                                            <td>
                                                <div style={{ width: 28, height: 28, borderRadius: 6, background: `${hcat.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 10, color: hcat.color }}>
                                                    {h.form.name?.[0]?.toUpperCase() || '?'}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600 }}>{h.form.name || '—'}</div>
                                                <div style={{ fontSize: 10.5, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>{h.form.userId}</div>
                                            </td>
                                            <td style={{ textAlign: 'center', fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 16, color: hcat.color }}>
                                                {Math.round(h.score * 100)}%
                                            </td>
                                            <td style={{ textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--t1)' }}>
                                                {h.form.creditUtil}%
                                                {h.form.creditUtil > 60 && <span style={{ marginLeft: 4, fontSize: 9, color: '#ef4444' }}>▲</span>}
                                            </td>
                                            <td style={{ textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--t1)' }}>
                                                {h.form.paymentDelay}d
                                                {h.form.paymentDelay > 15 && <span style={{ marginLeft: 4, fontSize: 9, color: '#ef4444' }}>▲</span>}
                                            </td>
                                            <td style={{ textAlign: 'center', fontFamily: 'var(--mono)', color: 'var(--t1)' }}>
                                                {h.form.volatility}%
                                                {h.form.volatility > 50 && <span style={{ marginLeft: 4, fontSize: 9, color: '#ef4444' }}>▲</span>}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className={`risk-badge ${hcat.cls}`} style={{ fontSize: 9.5 }}>{hcat.label}</span>
                                            </td>
                                            <td style={{ fontSize: 11, color: 'var(--t3)' }}>{h.timestamp.split(',')[0]}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon"><ShieldAlert size={20} color="var(--t3)" /></div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--t1)' }}>No subjects monitored yet</div>
                        <div style={{ fontSize: 12, color: 'var(--t2)', maxWidth: 320, lineHeight: 1.7 }}>
                            Each subject you analyze in the User Analyzer appears here with their full risk profile, category, and computed metrics.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
