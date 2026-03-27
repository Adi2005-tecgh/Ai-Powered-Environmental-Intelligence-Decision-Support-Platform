import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, Wind, Activity, Info, Flame, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const CitizenHero = ({ aqi = 0, city = "", pollutants = {}, weather = {}, loading = false }) => {
    const [count, setCount] = useState(0);

    // AQI Count-up animation
    useEffect(() => {
        if (loading) return;
        let start = 0;
        const end = Math.round(aqi);
        if (start === end) return;

        let totalDuration = 1000;
        let increment = end / (totalDuration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [aqi, loading]);

    const getAQICategory = (val) => {
        if (val <= 50) return { label: "Good", desc: "Air quality is ideal for all.", theme: "from-emerald-500 to-teal-600", color: "text-emerald-500", shadow: "shadow-emerald-500/20" };
        if (val <= 100) return { label: "Satisfactory", desc: "Air quality is acceptable.", theme: "from-green-400 to-emerald-500", color: "text-green-500", shadow: "shadow-green-500/20" };
        if (val <= 200) return { label: "Moderate", desc: "Unhealthy for sensitive groups.", theme: "from-orange-400 to-amber-600", color: "text-orange-500", shadow: "shadow-orange-500/20" };
        if (val <= 300) return { label: "Severe", desc: "Health alert: everyone may experience effects.", theme: "from-rose-500 to-red-700", color: "text-rose-600", shadow: "shadow-rose-600/20" };
        return { label: "Hazardous", desc: "Health warnings of emergency conditions.", theme: "from-purple-600 to-indigo-900", color: "text-purple-600", shadow: "shadow-purple-600/20" };
    };

    const category = getAQICategory(aqi);

    const getScalePosition = (val) => {
        const capped = Math.min(val, 400);
        return (capped / 400) * 100;
    };

    if (loading) {
        return <div className="h-80 bg-slate-100 rounded-[2.5rem] animate-pulse"></div>;
    }

    const POLLUTANT_STATS = [
        { label: "PM2.5", value: pollutants?.pm25, unit: "µg/m³", icon: Wind, type: 'pm25' },
        { label: "PM10", value: pollutants?.pm10, unit: "µg/m³", icon: Wind, type: 'pm10' },
        { label: "NO2", value: pollutants?.no2, unit: "ppb", icon: Activity, type: 'no2' },
        { label: "SO2", value: pollutants?.so2, unit: "ppb", icon: Flame, type: 'so2' },
        { label: "O3", value: pollutants?.o3, unit: "ppb", icon: Zap, type: 'o3' },
        { label: "CO", value: pollutants?.co, unit: "mg/m³", icon: Info, type: 'co' }
    ];

    const ENV_STATS = [
        { label: "Temp", value: weather?.temperature, unit: "°C", icon: Thermometer },
        { label: "Humidity", value: weather?.humidity, unit: "%", icon: Droplets }
    ];

    return (
        <div className={`relative overflow-hidden p-8 md:p-12 rounded-[3rem] bg-gradient-to-br ${category.theme} text-white shadow-2xl transition-all duration-1000 border border-white/10`}>
            {/* Minimal Gloss Overlay */}
            <div className="absolute top-0 right-0 w-full h-full bg-white/5 pointer-events-none"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left: AQI */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]"></div>
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-80 italic">Sovereign Grid Sync • {city}</span>
                    </div>

                    <div className="flex items-center gap-10">
                        <div className="relative">
                            <h2 className="text-9xl font-black tracking-tighter leading-none pr-4 drop-shadow-xl">{count}</h2>
                            <div className="absolute -top-6 -right-2 text-xs font-black uppercase tracking-widest opacity-40">Index</div>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <span className="text-2xl font-black opacity-90 uppercase tracking-tighter leading-none">Diagnostic Result</span>
                            <div className="flex items-center gap-3 bg-white/20 border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-xl shadow-lg mt-1 w-fit">
                                <span className="text-[11px] font-black uppercase tracking-[0.2em]">{category.label}</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-xl font-bold opacity-90 max-w-md leading-tight italic border-l-4 border-white/30 pl-8">
                        "{category.desc}"
                    </p>

                    <div className="relative pt-4">
                        <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden flex relative border border-white/10 shadow-inner">
                            <div className="h-full bg-emerald-400/90" style={{ width: '25%' }}></div>
                            <div className="h-full bg-orange-400/90" style={{ width: '25%' }}></div>
                            <div className="h-full bg-rose-500/90" style={{ width: '25%' }}></div>
                            <div className="h-full bg-purple-700/90" style={{ width: '25%' }}></div>

                            <div
                                className="absolute top-1/2 -mt-2 w-4 h-4 bg-white rounded-full border-2 border-slate-900 shadow-[0_0_15px_white] transition-all duration-1000 ease-out z-20"
                                style={{ left: `${getScalePosition(aqi)}%`, transform: 'translateX(-50%)' }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Right: Modern Stats Grid */}
                <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Environment Stats (Top Row) */}
                    {ENV_STATS.map((stat, i) => (
                        <div 
                            key={`env-${i}`} 
                            className="bg-black/10 border border-white/10 p-5 rounded-2xl flex flex-col justify-between h-[110px]"
                        >
                            <div className="flex items-center gap-3 mb-1">
                                <stat.icon size={16} className="opacity-70 text-blue-300" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{stat.label}</span>
                            </div>
                            <div className="flex items-baseline gap-1 mt-auto">
                                <span className="text-3xl font-black tracking-tighter">{stat.value || '--'}</span>
                                <span className="text-xs font-black opacity-50">{stat.unit}</span>
                            </div>
                        </div>
                    ))}

                    {/* Pollutant Stats (Interactive) */}
                    {POLLUTANT_STATS.map((stat, i) => (
                        <Link 
                            key={`poll-${i}`} 
                            to={`/pollutant/${stat.type}?value=${stat.value !== undefined ? stat.value : ''}&city=${encodeURIComponent(city || '')}`}
                            className="group bg-white/10 border border-white/5 p-5 rounded-2xl transition-all hover:bg-white/20 hover:scale-[1.05] hover:shadow-2xl hover:shadow-black/20 flex flex-col justify-between h-[110px] relative overflow-hidden"
                        >
                            <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors" />
                            <div className="flex items-center gap-3 mb-1 relative z-10">
                                <stat.icon size={16} className="opacity-70 text-yellow-300 group-hover:rotate-12 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{stat.label}</span>
                            </div>
                            <div className="relative z-10 flex flex-col mt-auto">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black tracking-tighter">{stat.value || '--'}</span>
                                    <span className="text-xs font-black opacity-50">{stat.unit}</span>
                                </div>
                                <div className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 mt-1 pointer-events-none group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    Diagnostic <div className="w-6 h-px bg-white/40" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CitizenHero;
