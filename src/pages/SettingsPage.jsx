import { useState, useEffect } from 'react';
import { Shield, Database, User, Bell, Info, SlidersHorizontal, Check } from 'lucide-react';
import { getPrefs, savePrefs } from '../utils/risk';

function Toggle({ on, onChange, id }) {
    return (
        <div
            id={id}
            className={`toggle${on ? ' on' : ''}`}
            onClick={() => onChange(!on)}
            role="switch"
            aria-checked={on}
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && onChange(!on)}
        >
            <div className="toggle-knob" />
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div className="card">
            <div className="sec-head">
                <div className="sec-dot" />
                <span className="sec-title">{title}</span>
            </div>
            {children}
        </div>
    );
}

export default function SettingsPage({ user }) {
    const [prefs, setPrefs] = useState(getPrefs);
    const [saved, setSaved] = useState(false);

    // Keep in sync if another tab changes prefs
    useEffect(() => {
        const h = () => setPrefs(getPrefs());
        window.addEventListener('bris-prefs-change', h);
        return () => window.removeEventListener('bris-prefs-change', h);
    }, []);

    const update = (key, val) => {
        const next = { ...prefs, [key]: val };
        // Ensure high > mod + at least 5pt gap
        if (key === 'modThreshold' && val >= next.highThreshold - 5) {
            next.highThreshold = Math.min(val + 5, 90);
        }
        if (key === 'highThreshold' && val <= next.modThreshold + 5) {
            next.modThreshold = Math.max(val - 5, 10);
        }
        setPrefs(next);
        savePrefs(next);
        setSaved(true);
        clearTimeout(window._brisSaveTimer);
        window._brisSaveTimer = setTimeout(() => setSaved(false), 2000);
    };

    const clearHistory = () => {
        if (!confirm('Delete all analysis history for this account? This cannot be undone.')) return;
        localStorage.removeItem(`bris_history_${user?.email || ''}`);
        window.dispatchEvent(new Event('bris-refresh'));
    };

    const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Save confirmation banner */}
            {saved && (
                <div style={{ padding: '7px 13px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.14)', borderRadius: 6, fontSize: 11.5, color: 'var(--t2)', display: 'flex', gap: 7, alignItems: 'center' }}>
                    <Check size={12} color="var(--green)" />
                    Settings saved — changes apply immediately across all pages.
                </div>
            )}

            {/* Profile */}
            <Section title="Profile">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 48, height: 48, background: '#1a2d47', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: '#a8c4e0', flexShrink: 0 }}>
                        {initials}
                    </div>
                    <div>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--t1)' }}>{user?.name || 'Unknown'}</div>
                        <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 2 }}>{user?.email}</div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{user?.role}</div>
                    </div>
                </div>
                <div style={{ padding: '9px 12px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 5, fontSize: 11.5, color: 'var(--t2)', display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                    <Info size={12} color="var(--t3)" style={{ flexShrink: 0, marginTop: 1 }} />
                    Profile data and analysis history are stored in your browser's{' '}
                    <code style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--t1)', background: 'rgba(255,255,255,0.06)', padding: '1px 4px', borderRadius: 3 }}>localStorage</code>.
                    No data is sent to a server.
                </div>
            </Section>

            <div className="grid-2" style={{ alignItems: 'start' }}>
                {/* Preferences */}
                <Section title="Preferences">
                    {[
                        {
                            key: 'notifications',
                            label: 'High-risk alerts',
                            sub: 'Show a warning when an analysis returns a high-risk score',
                        },
                        {
                            key: 'autoSave',
                            label: 'Auto-save to history',
                            sub: 'Save every analysis run automatically (turn off to run without saving)',
                        },
                        {
                            key: 'compact',
                            label: 'Compact layout',
                            sub: 'Reduce padding and section spacing for denser information display',
                        },
                        {
                            key: 'mc500',
                            label: 'MC Dropout (n = 500)',
                            sub: 'Monte Carlo uncertainty sampling — disabling uses n = 100 for speed',
                        },
                    ].map(p => (
                        <div key={p.key} className="setting-row">
                            <div>
                                <div style={{ fontSize: 12.5, color: 'var(--t1)', fontWeight: 500 }}>{p.label}</div>
                                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{p.sub}</div>
                            </div>
                            <Toggle
                                id={`setting-${p.key}`}
                                on={prefs[p.key]}
                                onChange={v => update(p.key, v)}
                            />
                        </div>
                    ))}
                </Section>

                {/* Data management */}
                <Section title="Data Management">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 16 }}>
                        {[
                            { icon: Database, label: 'Storage backend', val: 'Browser localStorage' },
                            { icon: Shield, label: 'Auth method', val: 'Client-side only' },
                            { icon: User, label: 'Data scope', val: 'Per-account isolation' },
                            { icon: Bell, label: 'Session expires', val: 'On manual sign-out' },
                        ].map(r => {
                            const Icon = r.icon;
                            return (
                                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border-lo)' }}>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <Icon size={13} color="var(--t3)" />
                                        <span style={{ fontSize: 12, color: 'var(--t2)' }}>{r.label}</span>
                                    </div>
                                    <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--t1)', fontWeight: 500 }}>{r.val}</span>
                                </div>
                            );
                        })}
                    </div>
                    <button
                        className="btn"
                        onClick={clearHistory}
                        style={{ width: '100%', justifyContent: 'center', background: 'rgba(239,68,68,0.07)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.18)', fontSize: 12.5, padding: '8px' }}
                    >
                        Clear analysis history
                    </button>
                </Section>
            </div>

            {/* Risk Thresholds */}
            <Section title="Risk Thresholds">
                <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.75, marginBottom: 18 }}>
                    <SlidersHorizontal size={11} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Configure at what score subjects are categorised as <strong style={{ color: 'var(--amber)' }}>Moderate</strong> or <strong style={{ color: 'var(--red)' }}>High Risk</strong>. Changes apply immediately to all pages — existing history entries are re-categorised dynamically.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    {/* Moderate threshold */}
                    <div className="sl-row">
                        <div className="sl-head">
                            <div>
                                <span className="sl-label">Moderate risk threshold</span>
                                <div className="sl-desc">Scores at or above this are flagged Moderate</div>
                            </div>
                            <span className="sl-val" style={{ color: 'var(--amber)' }}>{prefs.modThreshold}%</span>
                        </div>
                        <input type="range" min={20} max={65}
                            value={prefs.modThreshold}
                            onChange={e => update('modThreshold', Number(e.target.value))}
                            style={{ background: `linear-gradient(to right, var(--amber) ${((prefs.modThreshold - 20) / 45 * 100)}%, var(--s3) ${((prefs.modThreshold - 20) / 45 * 100)}%)` }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>
                            <span>20%</span><span>65%</span>
                        </div>
                    </div>

                    {/* High threshold */}
                    <div className="sl-row">
                        <div className="sl-head">
                            <div>
                                <span className="sl-label">High risk threshold</span>
                                <div className="sl-desc">Scores at or above this are flagged High Risk</div>
                            </div>
                            <span className="sl-val" style={{ color: 'var(--red)' }}>{prefs.highThreshold}%</span>
                        </div>
                        <input type="range" min={50} max={90}
                            value={prefs.highThreshold}
                            onChange={e => update('highThreshold', Number(e.target.value))}
                            style={{ background: `linear-gradient(to right, var(--red) ${((prefs.highThreshold - 50) / 40 * 100)}%, var(--s3) ${((prefs.highThreshold - 50) / 40 * 100)}%)` }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>
                            <span>50%</span><span>90%</span>
                        </div>
                    </div>
                </div>

                {/* Visual threshold indicator */}
                <div style={{ marginTop: 20, padding: '12px 14px', background: 'var(--s2)', border: '1px solid var(--border-lo)', borderRadius: 7 }}>
                    <div style={{ fontSize: 9.5, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10, fontWeight: 600 }}>Current Classification Bands</div>
                    <div style={{ height: 8, borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
                        <div style={{ flex: prefs.modThreshold, background: 'var(--green)', opacity: 0.6 }} />
                        <div style={{ flex: prefs.highThreshold - prefs.modThreshold, background: 'var(--amber)', opacity: 0.7 }} />
                        <div style={{ flex: 100 - prefs.highThreshold, background: 'var(--red)', opacity: 0.75 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, marginTop: 6, color: 'var(--t2)', fontFamily: 'var(--mono)' }}>
                        <span style={{ color: 'var(--green)' }}>Stable &lt; {prefs.modThreshold}%</span>
                        <span style={{ color: 'var(--amber)' }}>{prefs.modThreshold}–{prefs.highThreshold - 1}%</span>
                        <span style={{ color: 'var(--red)' }}>High ≥ {prefs.highThreshold}%</span>
                    </div>
                </div>
            </Section>

            {/* About */}
            <Section title="About BRIS">
                <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 20 }}>
                    BRIS is a research-grade behavioral risk intelligence platform designed to monitor transaction sequences and identify subtle patterns of financial drift. It utilizes an ensemble of calibrated models to provide transparency and early-warning signals for risk management.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    {[
                        { label: 'Platform Version', val: 'v2.4.1' },
                        { label: 'Ensemble Version', val: 'v3.2.0' },
                        { label: 'Model Framework', val: 'XGB + LGBM + LSTM' },
                        { label: 'Explainability', val: 'SHAP (approx)' },
                        { label: 'Uncertainty', val: `MC Dropout n=${prefs.mc500 ? 500 : 100}` },
                        { label: 'Deployment', val: 'Browser-only (Vite)' },
                    ].map(s => (
                        <div key={s.label} style={{ padding: '10px 12px', background: 'var(--s2)', border: '1px solid var(--border-lo)', borderRadius: 6 }}>
                            <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 3 }}>{s.label}</div>
                            <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--t1)' }}>{s.val}</div>
                        </div>
                    ))}
                </div>
            </Section>
        </div>
    );
}
