import { useEffect, useRef, useState } from 'react';

function getStyle(score) {
    if (score >= 0.70) return { color: '#ff3366', glow: 'glow-hi' };
    if (score >= 0.45) return { color: '#ff8c00', glow: 'glow-med' };
    return { color: '#00d97e', glow: 'glow-lo' };
}

export default function RiskGauge({ score = 0.73 }) {
    const [displayed, setDisplayed] = useState(0);
    const animRef = useRef(null);

    useEffect(() => {
        let start = null;
        const dur = 1600;
        const step = ts => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / dur, 1);
            setDisplayed((1 - Math.pow(1 - p, 3)) * score);
            if (p < 1) animRef.current = requestAnimationFrame(step);
        };
        animRef.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animRef.current);
    }, [score]);

    const { color, glow } = getStyle(score);
    const size = 200, cx = 100, cy = 100, r = 80, sw = 11;
    const circ = 2 * Math.PI * r;
    const arc = circ * 0.75;
    const offset = arc - displayed * arc;
    const pct = Math.round(displayed * 100);
    const catLabel = score >= 0.70 ? 'HIGH RISK' : score >= 0.45 ? 'MODERATE' : 'STABLE';

    return (
        <div className="gauge-wrap" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-225deg)', filter: `drop-shadow(0 0 12px ${color}66)` }}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw}
                    strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" />
                <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw}
                    strokeDasharray={`${arc} ${circ}`} strokeDashoffset={offset} strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
            </svg>
            <div className="gauge-center">
                <div className="gauge-pct" style={{ color, animation: `${glow} 2.5s ease-in-out infinite` }}>
                    {pct}%
                </div>
                <div className="gauge-sub">Risk Score</div>
                <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: `${color}1a`, color, border: `1px solid ${color}44`, letterSpacing: '0.8px' }}>
                    {catLabel}
                </div>
            </div>
        </div>
    );
}
