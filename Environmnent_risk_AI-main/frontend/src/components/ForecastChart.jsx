import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Area } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const ForecastChart = ({ data, loading, mini = false }) => {
    if (loading) return <div className="h-40 bg-slate-50 rounded-lg animate-pulse border border-slate-100" />;
    if (!data || !Array.isArray(data.forecast) || data.forecast.length === 0) return null;

    const chartData = data.forecast
        .slice(0, 7)
        .map((item, idx) => {
            const parsed = Number(item?.aqi);
            if (!Number.isFinite(parsed)) return null;
            const aqi = Math.round(parsed);
            const riskLevel = aqi < 80 ? 'Low' : aqi < 120 ? 'Moderate' : 'High';

            return {
                day: `Day ${item?.day ?? idx + 1}`,
                aqi,
                riskLevel
            };
        })
        .filter(Boolean);

    if (!chartData.length) return null;
    const minAQI = Math.min(...chartData.map((d) => d.aqi));
    const maxAQI = Math.max(...chartData.map((d) => d.aqi));
    const bestConditionIndex = chartData.findIndex((d) => d.aqi === minAQI);
    const peakRiskIndex = chartData.findIndex((d) => d.aqi === maxAQI);

    const getColor = (aqi) => {
        if (aqi < 80) return '#10b981';
        if (aqi <= 120) return '#facc15';
        if (aqi <= 180) return '#f97316';
        return '#e11d48';
    };

    const avgAqi = chartData.reduce((acc, curr) => acc + curr.aqi, 0) / chartData.length;
    const currentAqi = chartData[0]?.aqi ?? 100;
    const percentChange = ((avgAqi - currentAqi) / currentAqi) * 100;

    const getTrend = () => {
        if (percentChange > 5) return { label: 'Worsening', color: 'text-rose-500', icon: TrendingUp };
        if (percentChange < -5) return { label: 'Improving', color: 'text-emerald-500', icon: TrendingDown };
        return { label: 'Stable', color: 'text-amber-500', icon: Minus };
    };

    const trend = getTrend();
    const TrendIcon = trend.icon;

    return (
        <div className={`h-full flex flex-col ${mini ? '' : 'bg-white p-5 rounded-xl border border-slate-200'}`}>
            {!mini && (
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projection</h3>
                    <div className="flex items-center gap-1.5">
                        <TrendIcon size={12} className={trend.color} />
                        <span className={`text-[10px] font-black uppercase tracking-tight ${trend.color}`}>{trend.label}</span>
                    </div>
                </div>
            )}

            <div className="flex-grow h-[180px] w-full">
                {(() => {
                    const sevenDayData = chartData;
                    const sevenDayAvg = sevenDayData.reduce((acc, curr) => acc + curr.aqi, 0) / sevenDayData.length;
                    const renderDot = (props) => {
                        const { cx, cy, index } = props;
                        const isPeak = index === peakRiskIndex;
                        const isBest = index === bestConditionIndex;
                        if (typeof cx !== 'number' || typeof cy !== 'number') return null;

                        return (
                            <g>
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r={isPeak || isBest ? 5 : 3}
                                    fill={isPeak ? '#ef4444' : isBest ? '#10b981' : '#ffffff'}
                                    stroke={isPeak || isBest ? '#0f172a' : getColor(sevenDayAvg)}
                                    strokeWidth={isPeak || isBest ? 2 : 1.5}
                                />
                                {isPeak && (
                                    <text x={cx} y={cy - 12} textAnchor="middle" fontSize="9" fontWeight="900" fill="#ef4444">
                                        Peak Risk
                                    </text>
                                )}
                                {isBest && (
                                    <text x={cx} y={cy + 16} textAnchor="middle" fontSize="9" fontWeight="900" fill="#10b981">
                                        Best Condition
                                    </text>
                                )}
                            </g>
                        );
                    };

                    return (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sevenDayData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAqiMini" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={getColor(sevenDayAvg)} stopOpacity={0.15} />
                                        <stop offset="95%" stopColor={getColor(sevenDayAvg)} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="#e2e8f0" opacity={0.8} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }} dy={5} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }} tickFormatter={(v) => Math.round(Number(v))} />
                                <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="4 4" strokeOpacity={0.7} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '10px', border: '1px solid #1e293b', boxShadow: '0 8px 20px -4px rgb(15 23 42 / 0.55)', padding: '10px', backgroundColor: '#0f172a' }}
                                    itemStyle={{ fontWeight: 900, fontSize: '12px', color: '#e2e8f0' }}
                                    labelStyle={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', marginBottom: '2px', fontWeight: 900 }}
                                    labelFormatter={(label) => label}
                                    formatter={(value, _name, props) => [`AQI: ${Math.round(Number(value))} | Risk: ${props?.payload?.riskLevel || 'Unknown'}`, '']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="aqi"
                                    stroke="none"
                                    fillOpacity={1}
                                    fill="url(#colorAqiMini)"
                                    isAnimationActive={true}
                                    animationDuration={900}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="aqi"
                                    stroke={getColor(sevenDayAvg)}
                                    strokeWidth={3}
                                    dot={renderDot}
                                    activeDot={{ r: 5 }}
                                    style={{ filter: `drop-shadow(0 0 8px ${getColor(sevenDayAvg)}66)` }}
                                    isAnimationActive={true}
                                    animationDuration={900}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    );
                })()}
            </div>
        </div>
    );
};

export default ForecastChart;
