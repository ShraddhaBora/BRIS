import { useState, useEffect, useRef } from 'react';
import { Search, Bell, RefreshCw, Download, ChevronDown, LogOut, Clock, CalendarDays, Check } from 'lucide-react';

/* ── Page labels ─────────────────────────────────────────── */
const PAGE_LABELS = {
    'analyzer': { name: 'User Analyzer', path: 'BRIS / Analyze' },
    'dashboard': { name: 'Dashboard', path: 'BRIS / Overview' },
    'risk-monitor': { name: 'Risk Monitor', path: 'BRIS / Monitoring' },
    'behavioral-drift': { name: 'Behavioral Drift', path: 'BRIS / Analytics / Drift' },
    'model-insights': { name: 'Model Insights', path: 'BRIS / Analytics / Models' },
    'stress-simulator': { name: 'Stress Simulator', path: 'BRIS / Tools / Simulator' },
    'methodology': { name: 'Methodology', path: 'BRIS / Research / Methodology' },
    'settings': { name: 'Settings', path: 'BRIS / Configuration' },
};

/* ── Preset ranges ───────────────────────────────────────── */
const PRESETS = [
    { id: '6m', label: '6 months', months: 6 },
    { id: '12m', label: '12 months', months: 12 },
    { id: '24m', label: '24 months', months: 24 },
    { id: '36m', label: '36 months', months: 36 },
];

/* ── Helpers ─────────────────────────────────────────────── */
function toISO(d) { return d.toISOString().slice(0, 10); }

function addMonths(date, n) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + n);
    return d;
}

function subtractMonths(date, n) {
    const d = new Date(date);
    d.setMonth(d.getMonth() - n);
    return d;
}

function fmt(iso) {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function loadRange() {
    try {
        const s = localStorage.getItem('bris_date_range');
        if (s) return JSON.parse(s);
    } catch { }
    // Default: 24 months ending today
    const now = new Date();
    return { preset: '24m', from: toISO(subtractMonths(now, 24)), to: toISO(now) };
}

function saveRange(r) {
    localStorage.setItem('bris_date_range', JSON.stringify(r));
}

function getHistory(email) {
    try { return JSON.parse(localStorage.getItem(`bris_history_${email}`) || '[]'); }
    catch { return []; }
}

function getRiskCat(s) {
    if (s >= 0.70) return { color: 'var(--red)' };
    if (s >= 0.45) return { color: 'var(--amber)' };
    return { color: 'var(--green)' };
}

function timeSince(ms) {
    const s = Math.floor((Date.now() - ms) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
}

/* ══════════════════════════════════════════════════════════ */
export default function Navbar({ active, user, onLogout }) {
    const [q, setQ] = useState('');
    const [showUser, setShowUser] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [showRange, setShowRange] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(Date.now());
    const [range, setRange] = useState(loadRange);
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [toast, setToast] = useState('');
    const rangeRef = useRef(null);

    const history = getHistory(user?.email || '');
    const info = PAGE_LABELS[active] || PAGE_LABELS['analyzer'];

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '??';

    // Close range picker on outside click
    useEffect(() => {
        const handler = (e) => {
            if (rangeRef.current && !rangeRef.current.contains(e.target)) {
                setShowRange(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // When opening picker, seed custom inputs from current range
    useEffect(() => {
        if (showRange) {
            setCustomFrom(range.from);
            setCustomTo(range.to);
        }
    }, [showRange]);

    const selectPreset = (p) => {
        const now = new Date();
        const newRange = { preset: p.id, from: toISO(subtractMonths(now, p.months)), to: toISO(now) };
        setRange(newRange);
        saveRange(newRange);
        setShowRange(false);
        window.dispatchEvent(new CustomEvent('bris-range-change', { detail: newRange }));
    };

    const applyCustom = () => {
        if (!customFrom || !customTo || customFrom >= customTo) return;
        const newRange = { preset: 'custom', from: customFrom, to: customTo };
        setRange(newRange);
        saveRange(newRange);
        setShowRange(false);
        window.dispatchEvent(new CustomEvent('bris-range-change', { detail: newRange }));
    };

    const chipLabel = `${fmt(range.from)} – ${fmt(range.to)}`;

    // Refresh
    const handleRefresh = () => {
        setLastRefresh(Date.now());
        window.dispatchEvent(new Event('bris-refresh'));
    };

    // Download CSV
    const handleDownload = () => {
        const data = getHistory(user?.email || '');
        if (data.length === 0) { alert('No analysis history to export.'); return; }
        const header = 'timestamp,userId,name,age,employment,creditUtil,paymentDelay,volatility,incomeStability,missedPayments,avgBalance,monthlyIncome,riskScore,category';
        const rows = data.map(h => {
            const f = h.form;
            const cat = h.score >= 0.70 ? 'High Risk' : h.score >= 0.45 ? 'Moderate Risk' : 'Stable';
            return [`"${h.timestamp}"`, f.userId, `"${f.name}"`, f.age, f.employmentStatus,
            f.creditUtil, f.paymentDelay, f.volatility, f.incomeStability,
            f.missedPayments, f.avgBalance, f.monthlyIncome,
            h.score.toFixed(4), `"${cat}"`].join(',');
        });
        const csv = [header, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bris_analysis_${user?.name?.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        // Toast
        const n = data.length;
        setToast(`Exported ${n} row${n !== 1 ? 's' : ''}`);
        clearTimeout(window._brisToastTimer);
        window._brisToastTimer = setTimeout(() => setToast(''), 2500);
    };

    return (
        <>
            <header className="navbar">

                <div className="nav-title">
                    <h1>{info.name}</h1>
                    <p>{info.path}</p>
                </div>

                <div className="search-box">
                    <Search size={13} className="search-icon" />
                    <input placeholder="Search…" value={q} onChange={e => setQ(e.target.value)} spellCheck={false} />
                </div>

                <div className="nav-actions">

                    {/* ── Date range picker ────────────────────────── */}
                    <div ref={rangeRef} style={{ position: 'relative' }}>
                        <button
                            className="date-chip"
                            onClick={() => { setShowRange(s => !s); setShowUser(false); setShowNotif(false); }}
                            title="Click to change analysis window"
                            style={{ cursor: 'pointer', gap: 6, userSelect: 'none' }}
                        >
                            <CalendarDays size={11} />
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2px' }}>{chipLabel}</span>
                            <ChevronDown size={10} style={{ color: 'var(--t3)', transition: 'transform 0.2s', transform: showRange ? 'rotate(180deg)' : 'none' }} />
                        </button>

                        {showRange && (
                            <>
                                <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setShowRange(false)} />
                                <div style={PICKER_STYLE}>
                                    <div style={{ padding: '10px 13px 8px', borderBottom: '1px solid var(--border-lo)', fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
                                        Analysis Window
                                    </div>

                                    {/* Presets */}
                                    <div style={{ padding: '8px 8px 4px' }}>
                                        <div style={{ fontSize: 9.5, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.7px', padding: '2px 6px 6px', fontWeight: 600 }}>Presets</div>
                                        {PRESETS.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => selectPreset(p)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    width: '100%', padding: '7px 10px', borderRadius: 5,
                                                    background: range.preset === p.id ? 'rgba(59,130,246,0.08)' : 'none',
                                                    border: range.preset === p.id ? '1px solid rgba(59,130,246,0.18)' : '1px solid transparent',
                                                    cursor: 'pointer', fontSize: 12.5, color: range.preset === p.id ? 'var(--accent)' : 'var(--t1)',
                                                    fontFamily: 'var(--font)', fontWeight: range.preset === p.id ? 600 : 400,
                                                    marginBottom: 2, transition: 'all 0.12s',
                                                }}
                                            >
                                                <span>{p.label}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ fontSize: 10.5, color: 'var(--t3)', fontFamily: 'var(--mono)' }}>
                                                        {fmt(toISO(subtractMonths(new Date(), p.months)))} – {fmt(toISO(new Date()))}
                                                    </span>
                                                    {range.preset === p.id && <Check size={11} color="var(--accent)" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom range */}
                                    <div style={{ padding: '4px 13px 13px', borderTop: '1px solid var(--border-lo)', marginTop: 4 }}>
                                        <div style={{ fontSize: 9.5, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.7px', padding: '8px 0 7px', fontWeight: 600 }}>Custom Range</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 9 }}>
                                            <div>
                                                <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 4 }}>From</div>
                                                <input
                                                    type="date"
                                                    value={customFrom}
                                                    onChange={e => setCustomFrom(e.target.value)}
                                                    max={customTo || toISO(new Date())}
                                                    style={DATE_INPUT_STYLE}
                                                />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 4 }}>To</div>
                                                <input
                                                    type="date"
                                                    value={customTo}
                                                    onChange={e => setCustomTo(e.target.value)}
                                                    min={customFrom}
                                                    max={toISO(new Date())}
                                                    style={DATE_INPUT_STYLE}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            onClick={applyCustom}
                                            disabled={!customFrom || !customTo || customFrom >= customTo}
                                            className="btn btn-primary"
                                            style={{ width: '100%', justifyContent: 'center', padding: '7px', fontSize: 12 }}
                                        >
                                            Apply Custom Range
                                        </button>
                                        {customFrom && customTo && customFrom >= customTo && (
                                            <div style={{ fontSize: 10.5, color: 'var(--red)', marginTop: 5 }}>
                                                End date must be after start date.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Refresh */}
                    <button className="icon-btn" title={`Refresh · Last: ${timeSince(lastRefresh)}`} onClick={handleRefresh}>
                        <RefreshCw size={13} />
                    </button>

                    {/* Notifications */}
                    <div style={{ position: 'relative' }}>
                        <button
                            className="icon-btn"
                            title="Recent analyses"
                            onClick={() => { setShowNotif(s => !s); setShowUser(false); setShowRange(false); }}
                            style={{ position: 'relative' }}
                        >
                            <Bell size={13} />
                            {history.length > 0 && <div className="notif-dot" />}
                        </button>

                        {showNotif && (
                            <>
                                <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setShowNotif(false)} />
                                <div style={MENU_STYLE}>
                                    <div style={{ padding: '9px 12px 7px', borderBottom: '1px solid var(--border-lo)', fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>
                                        Recent Analyses
                                    </div>
                                    {history.length === 0 ? (
                                        <div style={{ padding: '14px 12px', fontSize: 12, color: 'var(--t2)', textAlign: 'center' }}>No analyses yet</div>
                                    ) : (
                                        history.slice(0, 5).map(h => {
                                            const cat = getRiskCat(h.score);
                                            return (
                                                <div key={h.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-lo)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                                                    <div>
                                                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t1)' }}>{h.form.name}</div>
                                                        <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1, fontFamily: 'var(--mono)' }}>{h.form.userId}</div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--mono)', color: cat.color }}>{Math.round(h.score * 100)}%</div>
                                                        <div style={{ fontSize: 10, color: 'var(--t3)' }}>{timeSince(h.id)}</div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    {history.length > 5 && (
                                        <div style={{ padding: '7px 12px', fontSize: 11, color: 'var(--t3)', textAlign: 'center' }}>+{history.length - 5} more in History tab</div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Download */}
                    <button className="icon-btn" title="Export analysis history as CSV" onClick={handleDownload}>
                        <Download size={13} />
                    </button>

                    <div className="live-pill">
                        <div className="pulse-dot-muted" />
                        LIVE
                    </div>

                    {/* User dropdown */}
                    <div style={{ position: 'relative' }}>
                        <div
                            className="analyst-btn"
                            onClick={() => { setShowUser(s => !s); setShowNotif(false); setShowRange(false); }}
                            role="button" tabIndex={0}
                            onKeyDown={e => e.key === 'Enter' && setShowUser(s => !s)}
                        >
                            <div className="av">{initials}</div>
                            <div className="analyst-info">
                                <p>{user?.name || 'Unknown'}</p>
                                <p>{user?.role || 'Analyst'}</p>
                            </div>
                            <ChevronDown size={11} style={{ color: 'var(--t3)', marginLeft: 2 }} />
                        </div>

                        {showUser && (
                            <>
                                <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => setShowUser(false)} />
                                <div style={MENU_STYLE}>
                                    <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid var(--border-lo)' }}>
                                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--t1)' }}>{user?.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{user?.email}</div>
                                        <div style={{ fontSize: 10, color: 'var(--t2)', marginTop: 3 }}>{user?.role}</div>
                                    </div>
                                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-lo)', fontSize: 11, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <Clock size={11} />
                                        <span>Last refresh: {timeSince(lastRefresh)}</span>
                                    </div>
                                    <div style={{ padding: '6px' }}>
                                        <button
                                            onClick={() => { setShowUser(false); onLogout(); }}
                                            style={MENU_BTN_STYLE}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                        >
                                            <LogOut size={13} /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {toast && (
                <div style={{
                    position: 'fixed', bottom: 22, right: 22, zIndex: 9999,
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 16px',
                    background: 'var(--s1)',
                    border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: 8,
                    fontSize: 12.5, color: 'var(--t1)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                    animation: 'slideUp 0.18s ease',
                }}>
                    <Check size={13} color="var(--green)" />
                    {toast}
                </div>
            )}
        </>
    );
}

const PICKER_STYLE = {
    position: 'absolute', right: 0, top: 'calc(100% + 6px)',
    background: 'var(--s1)',
    border: '1px solid var(--border)',
    borderRadius: 8, width: 320,
    zIndex: 100,
    boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
};

const MENU_STYLE = {
    position: 'absolute', right: 0, top: 'calc(100% + 6px)',
    background: 'var(--s1)',
    border: '1px solid var(--border)',
    borderRadius: 8, minWidth: 210,
    zIndex: 100,
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
};

const DATE_INPUT_STYLE = {
    width: '100%',
    background: 'var(--s2)',
    border: '1px solid var(--border)',
    borderRadius: 5,
    padding: '6px 9px',
    color: 'var(--t1)',
    fontSize: 12,
    outline: 'none',
    fontFamily: 'var(--mono)',
    colorScheme: 'dark',
};

const MENU_BTN_STYLE = {
    display: 'flex', alignItems: 'center', gap: 8,
    width: '100%', padding: '8px 10px', borderRadius: 5,
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--red)', fontSize: 12.5, fontFamily: 'var(--font)',
    fontWeight: 500, transition: 'background 0.15s',
};
