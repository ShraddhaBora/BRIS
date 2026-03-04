import StressSimulator from '../components/StressSimulator';
import { Info } from 'lucide-react';

export default function StressSimulatorPage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ padding: '9px 13px', background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, color: 'var(--t2)', lineHeight: 1.7, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Info size={13} color="var(--t3)" style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                    The Stress Simulator lets you manually adjust behavioral parameters and observe the effect on the ensemble risk score in real time. Use this to explore "what-if" scenarios — e.g., how much does the score change if credit utilization jumps from 50% to 90%? All computation is local and transparent. The formula and weights are shown in the panel below.
                </span>
            </div>
            <StressSimulator />
        </div>
    );
}
