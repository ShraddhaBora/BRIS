import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, AlertCircle, Shield, TrendingUp, Zap, Database } from 'lucide-react';

function BrisLogo({ size = 24 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <rect x="1" y="1" width="18" height="18" rx="5" fill="var(--accent-lo)" stroke="var(--accent)" strokeWidth="1" />
            <rect x="4" y="12" width="2" height="4" rx="1" fill="var(--accent)" opacity="0.4" />
            <rect x="8" y="8" width="2" height="8" rx="1" fill="var(--accent)" opacity="0.7" />
            <rect x="12" y="4" width="2" height="12" rx="1" fill="var(--accent)" />
        </svg>
    );
}

export default function LoginPage({ onLogin, onGoRegister }) {
    const [form, setForm] = useState({ email: '', password: '' });
    const [show, setShow] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!form.email || !form.password) { setError('Please enter your credentials.'); return; }
        setLoading(true);
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('bris_users') || '[]');
            const match = users.find(u => u.email.toLowerCase() === form.email.toLowerCase() && u.password === form.password);
            if (!match) { setError('Invalid email or password.'); setLoading(false); return; }
            localStorage.setItem('bris_session', JSON.stringify({ ...match, loginTime: Date.now() }));
            onLogin(match);
        }, 600);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
            {/* Left Panel: Brand & Value Prop */}
            <div style={{ width: 420, flexShrink: 0, background: 'var(--s1)', borderRight: '1px solid var(--border)', padding: 60, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 60 }}>
                    <BrisLogo />
                    <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.02em' }}>BRIS</span>
                </div>

                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--t1)', lineHeight: 1.2, marginBottom: 24 }}>
                        Predictive risk <br />intelligence for <br /><span style={{ color: 'var(--accent)' }}>behavioral drift.</span>
                    </h1>
                    <p style={{ fontSize: 15, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 40 }}>
                        BRIS monitors real-time transaction patterns to detect financial stress before it results in default.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {[
                            { icon: TrendingUp, title: 'Behavioral Scoring', desc: 'XGBoost + LSTM ensemble modeling.' },
                            { icon: Zap, title: 'Real-time Drift', desc: 'Detect anomalies in spending patterns.' },
                            { icon: Shield, title: 'Explainable AI', desc: 'SHAP-based feature attribution.' },
                            { icon: Database, title: 'Privacy First', desc: 'No data ever leaves your device.' },
                        ].map((f, i) => (
                            <div key={i} style={{ display: 'flex', gap: 16 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--s2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <f.icon size={18} color="var(--accent)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{f.title}</div>
                                    <div style={{ fontSize: 13, color: 'var(--t3)' }}>{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ fontSize: 12, color: 'var(--t3)', borderTop: '1px solid var(--border)', paddingTop: 24 }}>
                    &copy; 2024 BRIS Behavioral Analytics. <br /> Research-grade prototype for evaluation.
                </div>
            </div>

            {/* Right Panel: Login Form */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                <div style={{ width: '100%', maxWidth: 360 }}>
                    <div style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>Sign In</h2>
                        <p style={{ color: 'var(--t3)' }}>Enter your analyst credentials to continue.</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="form-row">
                            <label className="form-label">Email Address</label>
                            <input
                                className="form-input"
                                type="email"
                                placeholder="name@company.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                            />
                        </div>

                        <div className="form-row">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="form-input"
                                    type={show ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    style={{ paddingRight: 40 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShow(!show)}
                                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)' }}
                                >
                                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--red-dim)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 8, color: 'var(--red)', fontSize: 13 }}>
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', height: 44 }}>
                            {loading ? 'Authenticating...' : <>Sign In <ArrowRight size={16} /></>}
                        </button>
                    </form>

                    <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14 }}>
                        <span style={{ color: 'var(--t3)' }}>Don't have an account?</span>{' '}
                        <button onClick={onGoRegister} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Create account</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
