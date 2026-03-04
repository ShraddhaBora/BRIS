import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MOCK_SERIES } from '../data/mockData';
import { Info } from 'lucide-react';

const SERIES = [
    { key: 'Risk Score (%)', color: 'var(--accent)', width: 2.5 },
    { key: 'Credit Util. (%)', color: 'var(--red)', width: 1.5 },
    { key: 'Volatility (%)', color: 'var(--purple)', width: 1.5 },
    { key: 'Pmt Delay (days)', color: 'var(--amber)', width: 1.5 },
];

const TOOLTIP_STYLE = {
    background: 'var(--s1)',
    border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 12, color: 'var(--t1)',
};

export default function BehavioralDriftChart() {
    const data = MOCK_SERIES.map(d => ({
        month: d.month,
        'Risk Score (%)': parseFloat((d.riskScore * 100).toFixed(1)),
        'Credit Util. (%)': parseFloat((d.creditUtilization * 100).toFixed(1)),
        'Volatility (%)': parseFloat((d.spendingVolatility * 100).toFixed(1)),
        'Pmt Delay (days)': parseFloat(d.paymentDelay.toFixed(1)),
    }));

    return (
        <div className="card">
            <div className="sec-head">
                <div className="sec-dot" />
                <span className="sec-title">Portfolio Drift Metrics</span>
                <div className="sec-actions">
                    <span className="tag tag-blue">Live Ensemble Feed</span>
                </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--accent-lo)', borderRadius: 8, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
                <Info size={16} color="var(--accent)" />
                <span style={{ fontSize: 13, color: 'var(--t2)' }}>Historical analysis of behavioral convergence across the last 24 months.</span>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-lo)" vertical={false} />
                    <XAxis
                        dataKey="month"
                        interval={3}
                        tick={{ fontSize: 11, fill: 'var(--t3)' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: 'var(--t3)' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: 10, fontSize: 12, color: 'var(--t2)' }} />
                    <ReferenceLine
                        x="M19"
                        stroke="var(--red)"
                        strokeDasharray="4 4"
                        label={{ value: 'M19 Event', fill: 'var(--t3)', fontSize: 10, position: 'insideTopLeft' }}
                    />
                    {SERIES.map(s => (
                        <Line
                            key={s.key}
                            type="monotone"
                            dataKey={s.key}
                            stroke={s.color}
                            strokeWidth={s.width}
                            dot={false}
                            activeDot={{ r: 5, strokeWidth: 0 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
