import { useState, useEffect } from 'react';
import BehavioralDriftChart from '../components/BehavioralDriftChart';
import SHAPExplainability from '../components/SHAPExplainability';
import StressSimulator from '../components/StressSimulator';
import { TrendingUp, Shield, BarChart3, ArrowRight, Info, Users, Activity } from 'lucide-react';
import { getCategory } from '../utils/risk';

function getHistory(email) {
    try { return JSON.parse(localStorage.getItem(`bris_history_${email}`) || '[]'); }
    catch { return []; }
}

function Gauge({ score }) {
    const size = 160, r = 62, sw = 8;
    const circ = 2 * Math.PI * r;
    const arc = circ * 0.75;
    const offset = arc - score * arc;
    const { color } = getCategory(score);
    return (
        <div className="gauge-wrap" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-225deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke="rgba(255,255,255,0.04)" strokeWidth={sw}
                    strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke={color} strokeWidth={sw}
                    strokeDasharray={`${arc} ${circ}`} strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.4,0,0.2,1)' }} />
            </svg>
            <div className="gauge-center">
                <div className="gauge-pct" style={{ color, fontSize: 32 }}>{Math.round(score * 100)}%</div>
                <div className="gauge-sub">Risk Score</div>
            </div>
        </div>
    );
}

function StatCard({ label, value, sub, color }) {
    return (
        <div className="card">
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>{label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: color || 'var(--t1)', fontFamily: 'var(--mono)', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 8 }}>{sub}</div>
        </div>
    );
}

function EmptyDashboard({ onNavigate }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="grid-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {[
                    { icon: <Users size={20} />, step: '1', title: 'Add a Subject', body: 'Navigate to User Analyzer and fill in a subject\'s profile.' },
                    { icon: <Activity size={20} />, step: '2', title: 'Run Analysis', body: 'Run the ensemble model to compute risk scores.' },
                    { icon: <BarChart3 size={20} />, step: '3', title: 'Review Results', body: 'Scores and trends appear here once analyzed.' },
                ].map(c => (
                    <div key={c.step} className="card">
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>{c.icon}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>{c.title}</div>
                        <div style={{ fontSize: 14, color: 'var(--t2)', lineHeight: 1.6 }}>{c.body}</div>
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <button className="btn btn-primary" onClick={() => onNavigate?.('analyzer')}>
                    Launch Analyzer <ArrowRight size={16} />
                </button>
            </div>

            <div style={{ padding: '16px', background: 'var(--accent-lo)', border: '1px solid var(--accent-dim)', borderRadius: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                <Info size={18} color="var(--accent)" />
                <span style={{ fontSize: 14, color: 'var(--t2)' }}>Run your first analysis to see live portfolio metrics. Sample data shown below.</span>
            </div>

            <BehavioralDriftChart />
            <SHAPExplainability />
            <StressSimulator />
        </div>
    );
}

export default function DashboardPage({ user, onNavigate }) {
    const [history, setHistory] = useState(() => getHistory(user?.email || ''));

    useEffect(() => {
        const update = () => setHistory(getHistory(user?.email || ''));
        window.addEventListener('bris-refresh', update);
        const poll = setInterval(update, 4000);
        return () => { window.removeEventListener('bris-refresh', update); clearInterval(poll); };
    }, [user]);

    if (history.length === 0) return <EmptyDashboard onNavigate={onNavigate} />;

    const latest = history[0];
    const cat = getCategory(latest.score);
    const highRisk = history.filter(h => h.score >= 0.70).length;
    const avgScore = history.reduce((a, h) => a + h.score, 0) / history.length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div className="sec-title" style={{ marginBottom: 20 }}>Latest Assessment</div>
                    <Gauge score={latest.score} />
                    <div style={{ marginTop: 20 }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)' }}>{latest.form.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--t3)', fontFamily: 'var(--mono)', marginTop: 4 }}>ID: {latest.form.userId}</div>
                    </div>
                    <div className={`risk-badge ${cat.cls}`} style={{ marginTop: 16 }}>{cat.label}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
                    <StatCard label="Portfolio Avg" value={`${Math.round(avgScore * 100)}%`} sub="Mean risk across all subjects" color={getCategory(avgScore).color} />
                    <StatCard label="Critical Flags" value={highRisk} sub="Subjects requiring immediate review" color={highRisk > 0 ? 'var(--red)' : 'var(--green)'} />

                    <div className="card" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--accent-lo)', borderColor: 'var(--accent-dim)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <Activity size={24} color="var(--accent)" />
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>Real-time Behavioral Monitoring</div>
                                <div style={{ fontSize: 13, color: 'var(--t3)' }}>ML ensemble active. Processing features at 40ms latency.</div>
                            </div>
                        </div>
                        <button onClick={() => onNavigate('model-insights')} className="btn btn-outline">
                            Model Specs <TrendingUp size={14} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid-2">
                <BehavioralDriftChart />
                <SHAPExplainability />
            </div>

            <StressSimulator />
        </div>
    );
}
