import { useState } from 'react';
import { Shield, TrendingUp, Zap, Database, ArrowLeft, UserPlus } from 'lucide-react';

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

export default function RegisterPage({ onRegister, onGoLogin }) {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Research Analyst' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem('bris_users') || '[]');
            users.push(form);
            localStorage.setItem('bris_users', JSON.stringify(users));
            onRegister(form);
        }, 800);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
            {/* Left Panel */}
            <div style={{ width: 420, flexShrink: 0, background: 'var(--s1)', borderRight: '1px solid var(--border)', padding: 60, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 60 }}>
                    <BrisLogo />
                    <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.02em' }}>BRIS</span>
                </div>

                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--t1)', lineHeight: 1.2, marginBottom: 24 }}>
                        Join the next <br />generation of <br /><span style={{ color: 'var(--accent)' }}>risk analytics.</span>
                    </h1>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 40 }}>
                        {[
                            { icon: TrendingUp, title: 'Behavioral Scoring', desc: 'Predictive modeling beyond credit scores.' },
                            { icon: Database, title: 'Data Sovereignty', desc: 'All data remains encrypted in your browser.' },
                            { icon: Zap, title: 'Instant Insights', desc: 'Analyze subjects in seconds, not hours.' },
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
                    By registering, you agree to our research terms. <br /> BRIS is for evaluation and portfolio use only.
                </div>
            </div>

            {/* Right Panel */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                <div style={{ width: '100%', maxWidth: 360 }}>
                    <button onClick={onGoLogin} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--t3)', fontSize: 14, cursor: 'pointer', marginBottom: 32, padding: 0 }}>
                        <ArrowLeft size={16} /> Back to Sign In
                    </button>

                    <div style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--t1)', marginBottom: 8 }}>Create Account</h2>
                        <p style={{ color: 'var(--t3)' }}>Set up your local analyst profile.</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div className="form-row">
                            <label className="form-label">Full Name</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="John Doe"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <label className="form-label">Email Address</label>
                            <input
                                className="form-input"
                                type="email"
                                placeholder="name@organization.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <label className="form-label">Temporary Password</label>
                            <input
                                className="form-input"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <label className="form-label">Professional Role</label>
                            <select
                                className="form-input"
                                value={form.role}
                                onChange={e => setForm({ ...form, role: e.target.value })}
                                style={{ appearance: 'none' }}
                            >
                                <option>Research Analyst</option>
                                <option>Risk Manager</option>
                                <option>Data Scientist</option>
                                <option>Portfolio Auditor</option>
                            </select>
                        </div>

                        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', height: 44, marginTop: 12 }}>
                            {loading ? 'Creating Profile...' : <>Create Profile <UserPlus size={16} /></>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
