import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, Info, Activity, ShieldAlert, Clock } from 'lucide-react';
import { getAnomalies, getTrendExplanation } from '../api/api';

const AIRiskInsights = ({ city }) => {
    const [anomalyData, setAnomalyData] = useState(null);
    const [trendData, setTrendData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [anomalies, trend] = await Promise.all([
                getAnomalies(city),
                getTrendExplanation(city)
            ]);
            setAnomalyData(anomalies.data);
            setTrendData(trend.data);
        } catch (error) {
            console.error('Error fetching AI insights:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 300000); // Refresh every 5 mins
        return () => clearInterval(interval);
    }, [city]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
                <div className="h-64 bg-slate-100 rounded-3xl"></div>
                <div className="h-64 bg-slate-100 rounded-3xl"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. ANOMALY ALERTS SECTION */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-rose-50 p-2 rounded-xl text-rose-500">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900">Anomaly Alerts</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Isolation Forest Engine</p>
                        </div>
                    </div>
                    {anomalyData?.alerts?.length > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-full animate-pulse">
                            {anomalyData.alerts.length} NEW
                        </span>
                    )}
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {anomalyData?.alerts?.length > 0 ? (
                        anomalyData.alerts.map((alert, idx) => (
                            <div 
                                key={idx}
                                className={`p-4 rounded-2xl border transition-all ${
                                    alert.severity === 'High' 
                                        ? 'bg-rose-50 border-rose-100' 
                                        : 'bg-amber-50 border-amber-100'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`mt-0.5 ${alert.severity === 'High' ? 'text-rose-600' : 'text-amber-600'}`}>
                                        <AlertTriangle size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`text-sm font-black uppercase tracking-tight ${
                                                alert.severity === 'High' ? 'text-rose-700' : 'text-amber-700'
                                            }`}>
                                                {alert.message}
                                            </h4>
                                            <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                                                <Clock size={10} /> {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 mb-2 leading-relaxed">
                                            {alert.explanation}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${
                                                alert.severity === 'High' ? 'bg-rose-200 text-rose-700' : 'bg-amber-200 text-amber-700'
                                            }`}>
                                                {alert.severity} Severity
                                            </span>
                                            <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                                                {alert.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Activity className="mx-auto text-slate-200 mb-3" size={40} />
                            <p className="text-slate-400 text-sm font-medium italic">No anomalies detected in the current cycle.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. TREND EXPLANATION SECTION */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-50 p-2 rounded-xl text-indigo-500">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900">Trend Explanation</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">LSTM Explainability</p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                        trendData?.trend === 'Worsening' 
                            ? 'bg-rose-50 border-rose-100 text-rose-600' 
                            : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                    }`}>
                        <span className="text-sm">{trendData?.icon}</span>
                        <span className="text-xs font-black uppercase tracking-widest">{trendData?.trend}</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-sm text-slate-700 font-medium mb-4 leading-relaxed italic">
                            AQI in <span className="text-slate-900 font-bold">{city}</span> is currently 
                            <span className={`mx-1 font-bold ${trendData?.trend === 'Worsening' ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {trendData?.trend.toLowerCase()}
                            </span> 
                            due to the following factors:
                        </p>
                        <ul className="space-y-3">
                            {trendData?.reasons?.map((reason, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <div className="mt-1 text-slate-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                    </div>
                                    <span 
                                        className="text-sm text-slate-600"
                                        dangerouslySetInnerHTML={{ __html: reason.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                                    ></span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-4">
                        <div className="text-indigo-500 mt-0.5">
                            <Info size={18} />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-indigo-700 uppercase tracking-widest mb-1">AI Methodology</h4>
                            <p className="text-[10px] text-indigo-600 font-medium leading-relaxed">
                                Explanations are derived through a combination of LSTM trend forecasting and feature importance calculation relative to historical meteorological benchmarks.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIRiskInsights;
