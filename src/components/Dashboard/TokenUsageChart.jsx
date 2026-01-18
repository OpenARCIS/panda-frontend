import { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '../../components/ui';
import './TokenUsageChart.css';

const COLORS = [
    '#7c3aed',
    '#06b6d4',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#14b8a6',
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="chart-tooltip">
                <p className="chart-tooltip-label">{label}</p>
                <p className="chart-tooltip-value">
                    {payload[0].value.toLocaleString()} tokens
                </p>
                <p className="chart-tooltip-requests">
                    {payload[0].payload.request_count} requests
                </p>
            </div>
        );
    }
    return null;
};

export default function TokenUsageChart({ stats = [], loading }) {
    const [view, setView] = useState('total'); // 'total', 'prompt', 'completion'

    const chartData = stats.map((s, i) => ({
        name: s.agent_name?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || `Agent ${i + 1}`,
        total: s.total_tokens || 0,
        prompt: s.total_prompt_tokens || 0,
        completion: s.total_completion_tokens || 0,
        request_count: s.request_count || 0,
    }));

    const dataKey = view === 'total' ? 'total' : view === 'prompt' ? 'prompt' : 'completion';

    return (
        <Card className="token-chart-card">
            <CardHeader
                action={
                    <div className="chart-view-toggle">
                        <button
                            className={`chart-view-btn ${view === 'total' ? 'active' : ''}`}
                            onClick={() => setView('total')}
                        >
                            Total
                        </button>
                        <button
                            className={`chart-view-btn ${view === 'prompt' ? 'active' : ''}`}
                            onClick={() => setView('prompt')}
                        >
                            Prompt
                        </button>
                        <button
                            className={`chart-view-btn ${view === 'completion' ? 'active' : ''}`}
                            onClick={() => setView('completion')}
                        >
                            Completion
                        </button>
                    </div>
                }
            >
                <CardTitle subtitle="Token consumption by agent">
                    Token Usage
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="chart-skeleton">
                        <Skeleton width="100%" height={300} radius="lg" />
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="chart-empty">
                        <p>No token usage data available yet.</p>
                        <span>Start using the AI assistant to see usage statistics.</span>
                    </div>
                ) : (
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
                                barSize={40}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="var(--border-subtle)"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="name"
                                    tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                                    tickLine={{ stroke: 'var(--border-subtle)' }}
                                    axisLine={{ stroke: 'var(--border-subtle)' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis
                                    tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                                    tickLine={{ stroke: 'var(--border-subtle)' }}
                                    axisLine={{ stroke: 'var(--border-subtle)' }}
                                    tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124, 58, 237, 0.1)' }} />
                                <Bar
                                    dataKey={dataKey}
                                    radius={[6, 6, 0, 0]}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
