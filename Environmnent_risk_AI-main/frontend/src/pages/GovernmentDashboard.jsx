import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getForecast, getRisk, getAnomalies, getHotspots, getEconomicImpact } from '../api/api';
import CitySelector from '../components/CitySelector';
import RiskCard from '../components/RiskCard';
import ForecastChart from '../components/ForecastChart';
import HotspotMap from '../components/HotspotMap';
import AnomalyPanel from '../components/AnomalyPanel';
import GovernmentAnalyticsPanel from '../components/GovernmentAnalyticsPanel';
import ClusterTable from '../components/ClusterTable';
import ViolationMonitoring from '../components/ViolationMonitoring';
import PolicySimulator from '../components/PolicySimulator';
import EscalationTimeline from '../components/EscalationTimeline';
import EconomicImpactPanel from '../components/EconomicImpactPanel';
import EnvironmentalHealthIndex from '../components/EnvironmentalHealthIndex';
import StatusHeader from '../components/StatusHeader';
import LiveAlertMarquee from '../components/LiveAlertMarquee';
import SituationSummary from '../components/SituationSummary';
import RecommendedActions from '../components/RecommendedActions';
import { Shield, RefreshCw, AlertCircle, TrendingUp, Activity, MapPin, DollarSign, ClipboardList } from 'lucide-react';

const GovernmentDashboard = () => {
    const [selectedCity, setSelectedCity] = useState('Delhi');
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState({ forecast: null, risk: null, anomalies: null, hotspots: null, economicImpact: null });
    const [loading, setLoading] = useState({ forecast: true, risk: true, anomalies: true, hotspots: true, economicImpact: true });

    const fetchData = useCallback(async (city) => {
        setLoading({ forecast: true, risk: true, anomalies: true, hotspots: true, economicImpact: true });

        const fetchers = [
            { key: 'forecast', fn: getForecast },
            { key: 'risk', fn: getRisk },
            { key: 'anomalies', fn: getAnomalies },
            { key: 'hotspots', fn: getHotspots },
            { key: 'economicImpact', fn: getEconomicImpact }
        ];

        fetchers.forEach(async ({ key, fn }) => {
            try {
                const response = await fn(city);
                setData(prev => ({ ...prev, [key]: response.data }));
            } catch (err) {
                console.error(`Gov Data Fetch Error [${key}]:`, err);
                setData(prev => ({ ...prev, [key]: null }));
            } finally {
                setLoading(prev => ({ ...prev, [key]: false }));
            }
        });
    }, []);

    useEffect(() => {
        fetchData(selectedCity);
    }, [selectedCity, fetchData]);

    const baseProb = 5;
    let escalationProbability = baseProb;
    const aqiVal = data.risk?.latest_aqi || 100;
    if (aqiVal > 200) escalationProbability += 40;
    else if (aqiVal > 150) escalationProbability += 20;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'risk', label: 'Risk & Forecast', icon: TrendingUp },
        { id: 'hotspots', label: 'Hotspot Intelligence', icon: MapPin },
        { id: 'economic', label: 'Economic Impact', icon: DollarSign },
        { id: 'violations', label: 'Violation Monitoring', icon: ClipboardList }
    ];

    const originalForecastArray = data?.forecast?.forecast ?? [];
    const forecastData = useMemo(() => {
        const mapped = originalForecastArray.map((item, index) => {
            const aqi = Math.round(Number(item?.aqi));
            return {
                ...item,
                day: `Day ${index + 1}`,
                aqi,
                risk: aqi < 80 ? 'Low' : aqi < 120 ? 'Moderate' : aqi < 180 ? 'High' : 'Critical'
            };
        }).filter((item) => Number.isFinite(item.aqi));

        const filled = Array.from({ length: 7 }, (_, idx) => {
            const source = mapped[idx];
            const previous = idx > 0 ? mapped[idx - 1] : null;
            const baseline = Math.round(Number(data?.risk?.latest_aqi));
            const fallbackAqi = Number.isFinite(previous?.aqi) ? previous.aqi : (Number.isFinite(baseline) ? baseline : 100);
            const aqi = Number.isFinite(source?.aqi) ? source.aqi : fallbackAqi;
            return {
                ...(source || {}),
                day: `Day ${idx + 1}`,
                aqi,
                risk: aqi < 80 ? 'Low' : aqi < 120 ? 'Moderate' : aqi < 180 ? 'High' : 'Critical'
            };
        });

        console.log('FINAL DATA:', filled);
        return filled;
    }, [originalForecastArray, data?.risk?.latest_aqi]);

    const hotspotNodes = useMemo(() => {
        const list = Array.isArray(data?.hotspots?.hotspots) ? data.hotspots.hotspots : [];
        return list
            .map((spot, idx) => ({
                id: `${spot?.station || 'node'}-${idx}`,
                station: spot?.station || `Station ${idx + 1}`,
                aqi: Math.round(Number(spot?.pollution_score)),
                cluster: Number(spot?.cluster),
                severity: spot?.severity || 'Moderate'
            }))
            .filter((spot) => Number.isFinite(spot.aqi))
            .sort((a, b) => b.aqi - a.aqi);
    }, [data?.hotspots?.hotspots]);

    const hotspotResponseList = useMemo(() => hotspotNodes.slice(0, 5), [hotspotNodes]);

    const liveAlerts = useMemo(() => {
        const alerts = [];
        const top = hotspotNodes[0];
        const second = hotspotNodes[1];
        const avg = hotspotNodes.length
            ? hotspotNodes.reduce((sum, node) => sum + node.aqi, 0) / hotspotNodes.length
            : 0;

        if (top) {
            alerts.push({
                id: `high-${top.id}`,
                icon: AlertCircle,
                tone: 'text-rose-600 bg-rose-50 border-rose-100',
                text: `High AQI detected in ${top.station} (AQI ${top.aqi}).`
            });
        }

        const severeCluster = hotspotNodes.find((node) => Number.isFinite(node.cluster) && node.cluster >= 0 && node.severity === 'Extreme');
        if (severeCluster) {
            alerts.push({
                id: `cluster-${severeCluster.id}`,
                icon: MapPin,
                tone: 'text-orange-600 bg-orange-50 border-orange-100',
                text: `Cluster C-${String(severeCluster.cluster).padStart(3, '0')} showing extreme severity.`
            });
        }

        if (top && Number.isFinite(avg) && top.aqi - avg >= 20) {
            alerts.push({
                id: `spike-${top.id}`,
                icon: TrendingUp,
                tone: 'text-amber-600 bg-amber-50 border-amber-100',
                text: `Rapid AQI spike detected near ${top.station}.`
            });
        }

        if (second) {
            alerts.push({
                id: `watch-${second.id}`,
                icon: Activity,
                tone: 'text-blue-600 bg-blue-50 border-blue-100',
                text: `Secondary hotspot watch active for ${second.station} (AQI ${second.aqi}).`
            });
        }

        return alerts.slice(0, 5);
    }, [hotspotNodes]);

    const SectionHeader = ({ title, description, aiInsight, icon: Icon }) => (
        <div className="mb-6">
            <div className="flex items-start gap-4">
                {Icon && (
                    <div className="bg-blue-600/10 p-2.5 rounded-xl text-blue-600 shrink-0 mt-1 shadow-sm">
                        <Icon size={24} />
                    </div>
                )}
                <div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-1 font-mono">
                        {title}
                    </h2>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{description}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8 space-y-6">
            {/* 1. Main Authority Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-lg ring-4 ring-slate-900/5">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                            Authority <span className="text-blue-600">Command</span> Hub
                        </h1>
                        <div className="flex items-center gap-2.5 mt-2">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-[9px] font-black text-emerald-600 border border-emerald-100 uppercase tracking-widest">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                                Live Sync
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grid Node: {selectedCity}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
                    <button
                        onClick={() => fetchData(selectedCity)}
                        className="p-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all shadow-md group"
                    >
                        <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                    </button>
                </div>
            </div>

            {/* 2. Global Alert Stream */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-12">
                    {!loading.risk && (
                        <LiveAlertMarquee
                            hotspots={data.hotspots?.hotspots || []}
                            riskLevel={data.risk?.risk_level || 'Low'}
                            currentAQI={data.risk?.latest_aqi || 100}
                        />
                    )}
                </div>
            </div>

            {/* 3. Navigation Controls (Sticky) */}
            <div className="sticky top-6 z-50 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl shadow-sm p-1.5 flex gap-1.5 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-3 px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all min-w-fit ${isActive
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <Icon size={14} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* 4. Dynamic Content Area */}
            <div className="mt-8 space-y-8">
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <SectionHeader
                            title="Operational Overview"
                            description="Global Environment Monitoring System"
                        />

                        {!loading.risk && (
                            <SituationSummary
                                forecast={data.forecast?.forecast || []}
                                currentAQI={data.risk?.latest_aqi || 100}
                                riskLevel={data.risk?.risk_level || 'Low'}
                                escalationProbability={escalationProbability}
                                pollutants={data.risk?.pollutants || {}}
                                city={selectedCity}
                                dominantSource={data?.hotspots?.city_pollution_source ?? 'Unknown'}
                                hotspotCoverage={(() => {
                                    const total = Number(data?.hotspots?.total_stations ?? 0);
                                    const hot = Number(data?.hotspots?.hotspot_stations_count ?? 0);
                                    return total > 0 ? Math.round((hot / total) * 100) : 0;
                                })()}
                            />
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <EnvironmentalHealthIndex
                                currentAQI={data.risk?.latest_aqi || 100}
                                hotspotCount={data.hotspots?.hotspot_stations_count || 0}
                                anomalyCount={data.anomalies?.anomaly_count || 0}
                                pollutants={data.risk?.pollutants || {}}
                            />
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-t-4 border-t-slate-900">
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="bg-slate-900 p-2 rounded-lg text-white">
                                        <Shield size={16} />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">System Infrastructure Health</h3>
                                </div>
                                <GovernmentAnalyticsPanel data={data} loading={loading.hotspots} />

                                <div className="mt-8 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">AI Integrity Status</span>
                                        <span className="text-[10px] font-black text-emerald-600">94.2%</span>
                                    </div>
                                    <div className="w-full bg-emerald-100 rounded-full h-1">
                                        <div className="bg-emerald-500 h-1 rounded-full w-[94%]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'risk' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <SectionHeader title="Risk Intelligence" description="Predictive Forecasting & Modeling" />
                        <div className="w-full">
                            <ForecastChart data={{ ...(data.forecast || {}), forecast: forecastData }} loading={loading.forecast} showMetadata={true} />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <EscalationTimeline forecast={forecastData} currentAQI={data.risk?.latest_aqi || 100} />
                            <PolicySimulator forecast={forecastData} />
                        </div>
                    </div>
                )}

                {activeTab === 'hotspots' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <SectionHeader title="Hotspot Intelligence" description="Regional Pollution Cluster Analysis" />
                        <div className="min-h-[500px] bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <HotspotMap
                                data={data.hotspots}
                                loading={loading.hotspots}
                                mode="cluster"
                                riskData={data.risk}
                                riskLoading={loading.risk}
                                cityName={selectedCity}
                            />
                        </div>
                        <div className="rounded-xl border border-white/30 bg-white/60 backdrop-blur-md shadow-sm px-5 py-4 flex flex-wrap items-center gap-4">
                            <div className="min-w-[150px]">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Hotspots</p>
                                <p className="text-xl font-black text-slate-900">{hotspotNodes.length}</p>
                            </div>
                            <div className="w-px h-8 bg-slate-200 hidden sm:block" />
                            <div className="min-w-[150px]">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">High Risk Zones</p>
                                <p className="text-xl font-black text-rose-600">{hotspotNodes.filter((n) => n.aqi > 130).length}</p>
                            </div>
                            <div className="w-px h-8 bg-slate-200 hidden sm:block" />
                            <div className="min-w-[150px]">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Status</p>
                                <p className="text-xl font-black text-emerald-600 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    ON
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">HOTSPOT RESPONSE PLAN</h3>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4">Priority Response Nodes</p>
                                <div className="space-y-3">
                                    {hotspotResponseList.length > 0 ? hotspotResponseList.map((node) => {
                                        const risk = node.aqi > 130 ? 'High' : node.aqi >= 100 ? 'Moderate' : 'Low';
                                        const badgeClass = risk === 'High'
                                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                                            : risk === 'Moderate'
                                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                        const severity = node.aqi > 180 ? 'Severe' : risk;
                                        const cardTone = severity === 'Severe'
                                            ? 'bg-rose-50/70 border-l-4 border-l-rose-500'
                                            : risk === 'High'
                                                ? 'bg-orange-50/70 border-l-4 border-l-orange-500'
                                                : risk === 'Moderate'
                                                    ? 'bg-yellow-50/70 border-l-4 border-l-yellow-500'
                                                    : 'bg-emerald-50/70 border-l-4 border-l-emerald-500';
                                        const actions = node.aqi > 130
                                            ? ['Restrict heavy vehicles', 'Deploy dust suppression']
                                            : node.aqi >= 100
                                                ? ['Increase monitoring', 'Issue advisory']
                                                : ['Maintain observation'];

                                        return (
                                            <div key={node.id} className={`border border-slate-200 rounded-xl p-4 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-200 ${cardTone}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-xs font-black text-slate-900 flex items-center gap-2">
                                                        <span className="text-sm">📍</span>{node.station}
                                                    </p>
                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase border ${badgeClass}`}>{severity}</span>
                                                </div>
                                                <div className="flex items-end justify-between mb-3">
                                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">AQI</span>
                                                    <span className="text-2xl leading-none font-black text-slate-900">{node.aqi}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[10px] font-bold text-slate-600">Recommended Action</span>
                                                    <button className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide bg-white border border-slate-200 text-slate-700 shadow-sm">
                                                        {actions[0]}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/40">
                                            <p className="text-xs text-slate-500 font-bold">No hotspot response nodes available.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">LIVE ALERTS</h3>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4">Live Alert Feed</p>
                                <div className="space-y-3">
                                    {liveAlerts.length > 0 ? liveAlerts.map((alert, idx) => {
                                        const Icon = alert.icon;
                                        const segments = alert.text.split('. ');
                                        const title = segments[0]?.replace(/\.$/, '') || 'System alert';
                                        const description = segments.slice(1).join('. ') || 'Monitoring signal generated by hotspot intelligence.';
                                        return (
                                            <div key={alert.id} className={`border rounded-xl p-3 flex items-start gap-3 shadow-sm ${alert.tone} ${idx === 0 ? 'animate-pulse' : 'animate-in fade-in duration-500'}`} style={{ animationDelay: `${idx * 80}ms` }}>
                                                <div className="mt-0.5 flex items-center gap-1">
                                                    <span className="text-sm">{idx === 0 ? '⚠️' : idx % 2 === 0 ? '📡' : '📍'}</span>
                                                    <Icon size={14} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black leading-snug">{title}</p>
                                                    <p className="text-[11px] font-medium leading-relaxed opacity-90 mt-1">{description}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-wide mt-2 opacity-70">{idx + 1} min ago</p>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/40">
                                            <p className="text-xs text-slate-500 font-bold">No live alerts at this moment.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ClusterTable hotspots={Array.isArray(data?.hotspots?.hotspots) ? data.hotspots.hotspots : []} loading={loading.hotspots} />
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6">Regional Node Health</h3>
                                <GovernmentAnalyticsPanel data={data} loading={loading.hotspots} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'economic' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <SectionHeader title="Economic Burden" description="Financial Impact of Environmental States" />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <EconomicImpactPanel currentAQI={data.risk?.latest_aqi || 100} />
                            {!loading.risk && (
                                <RecommendedActions
                                    currentAQI={data.risk?.latest_aqi || 100}
                                    riskLevel={data.risk?.risk_level || 'Low'}
                                    hotspotCount={data.hotspots?.hotspot_stations_count || 0}
                                    anomalyCount={data.anomalies?.anomaly_count || 0}
                                    pollutants={data.risk?.pollutants || {}}
                                    hotspots={Array.isArray(data?.hotspots?.hotspots) ? data.hotspots.hotspots : []}
                                />
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'violations' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <SectionHeader title="Compliance Oversight" description="Citizen Reports & System Violations" />
                        <ViolationMonitoring />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <RiskCard data={data.risk} loading={loading.risk} isAdvanced={true} />
                            <AnomalyPanel data={data.anomalies} loading={loading.anomalies} detailLevel="advanced" />
                        </div>
                    </div>
                )}
            </div>

            <footer className="text-center pt-16 pb-8">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] opacity-50">
                    Sovereign Environmental Intelligence Network • Node Sync {new Date().toLocaleTimeString()}
                </p>
            </footer>
        </div>
    );
};

export default GovernmentDashboard;
