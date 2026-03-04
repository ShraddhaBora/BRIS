import BehavioralDriftChart from '../components/BehavioralDriftChart';
import { DRIFT_EVENTS } from '../data/mockData';
import { Info, AlertTriangle, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const SEVER = {
    high: { color: 'var(--red)', Icon: AlertTriangle, bg: 'var(--red-dim)', border: 'rgba(244, 63, 94, 0.2)' },
    medium: { color: 'var(--amber)', Icon: AlertCircle, bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.2)' },
    low: { color: 'var(--green)', Icon: CheckCircle, bg: 'var(--green-dim)', border: 'rgba(16, 185, 129, 0.2)' },
    info: { color: 'var(--accent)', Icon: Info, bg: 'var(--accent-dim)', border: 'rgba(59, 130, 246, 0.2)' },
};

export default function BehavioralDriftPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="fadein">
            {/* Header Info */}
            <div className="card" style={{ background: 'var(--accent-lo)', border: 'none', display: 'flex', gap: 12, padding: '16px 20px' }}>
                <Info size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--t1)' }}>Portfolio Drift Analysis.</strong> This page monitors shifts in behavioral patterns across your entire subject portfolio over a 24-month horizon. Drift signals often precede credit default by 60–90 days.
                </div>
            </div>

            <div className="card">
                <BehavioralDriftChart />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
                {/* Understanding Drift */}
                <div className="card">
                    <div className="sec-head">
                        <div className="sec-dot" />
                        <span className="sec-title">Methodology</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                            {
                                title: 'Definition',
                                body: 'Statistical shifts in financial transaction patterns vs established baselines.',
                            },
                            {
                                title: 'Detection',
                                body: 'Rolling z-scores over 90-day windows. Flagged at 2σ deviation.',
                            },
                            {
                                title: 'Key Signals',
                                body: 'Utilization velocity, payment delay trends, and spending volatility.',
                            },
                        ].map(c => (
                            <div key={c.title}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>{c.title}</div>
                                <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.5 }}>{c.body}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Event log */}
                <div className="card">
                    <div className="sec-head">
                        <div className="sec-dot" />
                        <span className="sec-title">Recent Drift Alerts</span>
                        <div className="sec-actions">
                            <span className="tag tag-default" style={{ background: 'var(--s2)' }}>Live Stream</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {DRIFT_EVENTS.map((ev, i) => {
                            const { color, Icon, bg, border } = SEVER[ev.severity] || SEVER.info;
                            return (
                                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px', background: bg, border: `1px solid ${border}`, borderRadius: 8 }}>
                                    <Icon size={14} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{ev.title}</span>
                                            <span style={{ fontSize: 11, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>{ev.date}</span>
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5 }}>{ev.desc}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
