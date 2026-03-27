import React, { useState, useEffect, useCallback } from 'react';
import { getForecastByGeo, getRisk, getAnomalies, getHotspots } from '../api/api';
import CitySelector from '../components/CitySelector';
import ForecastChart from '../components/ForecastChart';
import HotspotMap from '../components/HotspotMap';
import AnomalyPanel from '../components/AnomalyPanel';
import ViolationUpload from '../components/ViolationUpload';
import GovernmentTransparencyPanel from '../components/GovernmentTransparencyPanel';
import AcknowledgementsPanel from '../components/AcknowledgementsPanel';
import HealthAdvisoryPanel from '../components/HealthAdvisoryPanel';
import CitizenHero from '../components/CitizenHero';
import { Leaf, Zap, Globe } from 'lucide-react';

const NODE_COORDINATES = {
    'Delhi': [28.6139, 77.2090], 'Mumbai': [19.0760, 72.8777], 'Kolkata': [22.5726, 88.3639],
    'Chennai': [13.0827, 80.2707], 'Bengaluru': [12.9716, 77.5946], 'Hyderabad': [17.3850, 78.4867],
    'Ahmedabad': [23.0225, 72.5714], 'Pune': [18.5204, 73.8567], 'Jaipur': [26.9124, 75.7873], 'Lucknow': [26.8467, 80.9462]
};

const CitizenDashboard = () => {
    const [selectedCity, setSelectedCity] = useState('Delhi');
    const [coordinates, setCoordinates] = useState({ lat: 28.6139, lon: 77.2090 });
    const [data, setData] = useState({ forecast: null, risk: null, anomalies: null, hotspots: null });
    const [loading, setLoading] = useState({ forecast: true, risk: true, anomalies: true, hotspots: true });

    const fetchData = useCallback(async (city) => {
        setLoading({ forecast: true, risk: true, anomalies: true, hotspots: true });
        let lat, lon;
        if (NODE_COORDINATES[city]) {
            [lat, lon] = NODE_COORDINATES[city];
        } else {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ', India')}&limit=1`);
            const geoData = await geoRes.json();
            if (geoData?.[0]) { lat = parseFloat(geoData[0].lat); lon = parseFloat(geoData[0].lon); }
            else { lat = 28.6139; lon = 77.2090; }
        }
        setCoordinates({ lat, lon });

        const fetches = [
            { key: 'forecast', fn: () => getForecastByGeo(lat, lon) },
            { key: 'risk', fn: () => getRisk(city) },
            { key: 'anomalies', fn: () => getAnomalies(city) },
            { key: 'hotspots', fn: () => getHotspots(city) }
        ];

        fetches.forEach(async ({ key, fn }) => {
            try {
                const res = await fn();
                setData(prev => ({ ...prev, [key]: res.data }));
            } finally {
                setLoading(prev => ({ ...prev, [key]: false }));
            }
        });
    }, []);

    useEffect(() => { fetchData(selectedCity); }, [selectedCity, fetchData]);

    return (
        <div className="max-w-[1240px] mx-auto px-6 py-8 space-y-8 bg-slate-50/30">
            {/* Header */}
            <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-900 p-2.5 rounded-xl text-white shadow-xl"><Leaf size={20} /></div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase italic">Aero<span className="text-blue-600">Nova</span></h1>
                        <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-1">Sovereign Environmental Grid • {selectedCity}</p>
                    </div>
                </div>
                <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
            </div>

            {/* 1. Hero Summary (KEPT) */}
            <CitizenHero
                aqi={data.risk?.latest_aqi || 0}
                city={selectedCity}
                pollutants={data.risk?.pollutants}
                weather={data.risk?.environmental_context}
                loading={loading.risk}
            />

            {/* Air Quality Overview (Clean Block Replacement) */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-inner">
                        <Globe size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Air Quality Overview</h2>
                        <p className="text-sm font-bold text-slate-500 italic mt-1 leading-relaxed">
                            Monitor real-time air quality and stay informed about environmental conditions in {selectedCity}.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status: Live Sync</span>
                </div>
            </div>

            {/* 2. Map Section (KEPT) */}
            <div className="w-full">
                <HotspotMap
                    data={data.hotspots}
                    loading={loading.hotspots}
                    center={[coordinates.lat, coordinates.lon]}
                    cityName={selectedCity}
                    riskData={data.risk}
                    riskLoading={loading.risk}
                />
            </div>

            {/* 3. Analysis Grid (KEPT) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <HealthAdvisoryPanel aqi={data.risk?.latest_aqi || 0} loading={loading.risk} />
                <AnomalyPanel data={data.anomalies} loading={loading.anomalies} />
            </div>

            {/* 5. ACCOUNTABILITY & OVERSIGHT SECTION (KEPT) */}
            <div className="py-12 border-t border-slate-200">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative">
                    <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-200"></div>

                    <div className="space-y-8">
                        <GovernmentTransparencyPanel />
                        <AcknowledgementsPanel />
                    </div>

                    <div className="space-y-8">
                        <ViolationUpload />
                    </div>
                </div>
            </div>

            <footer className="text-center pt-12 border-t border-slate-100 pb-8">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-50">
                    Official Environmental Intelligence Sync • v2.1.0 • {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    );
};

export default CitizenDashboard;
