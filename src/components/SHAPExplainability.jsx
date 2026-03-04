import { useRef, useEffect } from 'react';
import { SHAP_FEATURES } from '../data/mockData';
import { Info } from 'lucide-react';

function Bar({ feature, maxVal, delay }) {
    const ref = useRef(null);
    const pct = Math.abs(feature.value) / maxVal * 100;
    useEffect(() => {
        const t = setTimeout(() => { if (ref.current) ref.current.style.width = `${pct}%`; }, delay);
        return () => clearTimeout(t);
    }, [pct, delay]);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ width: 140, fontSize: 12, color: 'var(--t2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={feature.name}>
                {feature.name}
            </div>
            <div style={{ flex: 1, height: 8, background: 'var(--s2)', borderRadius: 4, overflow: 'hidden' }}>
                <div
                    ref={ref}
                    style={{
                        height: '100%',
                        width: 0,
                        background: feature.positive ? 'var(--red)' : 'var(--accent)',
                        borderRadius: 4,
                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                />
            </div>
            <div style={{ width: 50, textAlign: 'right', fontSize: 12, fontWeight: 700, fontFamily: 'var(--mono)', color: feature.positive ? 'var(--red)' : 'var(--accent)' }}>
                {feature.positive ? '+' : ''}{feature.value.toFixed(3)}
            </div>
        </div>
    );
}

export default function SHAPExplainability() {
    const sorted = [...SHAP_FEATURES].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    const maxVal = Math.max(...sorted.map(f => Math.abs(f.value)));

    return (
        <div className="card">
            <div className="sec-head">
                <div className="sec-dot" />
                <span className="sec-title">Global Feature Importance (SHAP)</span>
                <div className="sec-actions">
                    <span className="tag tag-default">Model: ENSEMBLE-XGB3</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 16, marginBottom: 20, fontSize: 11, fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--red)' }} />
                    <span style={{ color: 'var(--t3)', textTransform: 'uppercase' }}>Risk Elevation</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)' }} />
                    <span style={{ color: 'var(--t3)', textTransform: 'uppercase' }}>Risk Mitigation</span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {sorted.map((f, i) => <Bar key={f.name} feature={f} maxVal={maxVal} delay={i * 50} />)}
            </div>

            <div style={{ marginTop: 20, padding: '12px', background: 'var(--s2)', borderRadius: 8, fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700, color: 'var(--t1)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Info size={14} color="var(--accent)" />
                    Model Insights
                </div>
                High credit utilization and increasing payment delays are the primary drivers of elevated risk scores in the current model iteration.
            </div>
        </div>
    );
}
