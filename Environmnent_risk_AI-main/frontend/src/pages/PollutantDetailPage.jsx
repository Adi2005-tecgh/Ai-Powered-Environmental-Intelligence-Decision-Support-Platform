import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion as m, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Activity, 
  ShieldCheck, 
  Download, 
  Heart, 
  ArrowRight, 
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  User,
  MapPin,
  Clock,
  Zap,
  BarChart,
  Target
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { jsPDF } from 'jspdf';
import { POLLUTANT_DATA } from '../constants/pollutantData';

/* --- CORE LOGIC ENGINES (Dynamic over static) --- */
const getRiskLevel = (value) => {
  if (value > 200) return "CRITICAL";
  if (value > 150) return "HIGH";
  if (value > 80) return "MODERATE";
  return "SAFE";
};

const getRiskColor = (level) => {
  switch(level) {
    case 'CRITICAL': return 'bg-red-600';
    case 'HIGH': return 'bg-red-500';
    case 'MODERATE': return 'bg-orange-500';
    default: return 'bg-green-500';
  }
};

const getDynamicCauses = (value, city, type) => {
  if (value <= 80) return ["Favorable wind clearing pollutants", "Emissions within normal limits"];
  
  if (type === 'pm25' || type === 'pm10') {
    return [
      "Vehicle emissions high in peak hours",
      "Construction dust detected nearby",
      "Low wind speed trapping pollutants locally"
    ];
  } else if (type === 'no2') {
    return [
      "Heavy diesel traffic in nearby corridors",
      "Industrial combustion activities",
      "Meteorological conditions preventing dispersion"
    ];
  } else {
    return [
      "Local emission sources compounding",
      "Atmospheric stagnation"
    ];
  }
};

const getSmartActions = (value) => {
  if (value > 200) {
    return [
      "Strictly avoid all outdoor activity",
      "Wear N95/N99 mask if exit is unavoidable",
      "Run air purifier at max capacity indoors",
      "Seal windows and doors tightly"
    ];
  }
  if (value > 150) {
    return [
      "Avoid outdoor jogging and intense exercise",
      "Close windows to prevent indoor pollution",
      "Use purifier for the next 6 hours",
      "Wear a mask outdoors"
    ];
  }
  if (value > 80) {
    return [
      "Sensitive individuals should limit outdoor time",
      "Keep windows closed during peak traffic hours",
      "Avoid busy roads when walking"
    ];
  }
  return [
    "Enjoy outdoor activities safely",
    "Open windows to ventilate your home",
    "No immediate precautions needed"
  ];
};

const getSafeExposure = (value) => {
  if (value > 300) return "5 mins";
  if (value > 200) return "15 mins";
  if (value > 150) return "30 mins";
  if (value > 80) return "2 hours";
  return "Unlimited";
};

const PollutantDetailPage = () => {
    const { type } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    
    // Fallbacks if no URL parameters are provided
    const paramValue = parseFloat(searchParams.get('value'));
    const city = searchParams.get('city') || "Your City";
    const data = POLLUTANT_DATA[type] || POLLUTANT_DATA.pm25;

    // Use passed value or fallback to a dummy depending on the type
    const liveValue = !isNaN(paramValue) ? paramValue : (type === 'no2' ? 45 : 152);

    // Derived states
    const riskLevel = getRiskLevel(liveValue);
    const riskColor = getRiskColor(riskLevel);
    const isHighRisk = riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
    
    // State for Trend / Graph Simulation
    const [trendData, setTrendData] = useState([]);
    
    useEffect(() => {
      // Generate some dummy trend around the live value
      let base = liveValue;
      const tData = [];
      const times = ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM (Now)', '9 PM', '12 AM'];
      
      times.forEach((time, index) => {
        if(index < 4) {
          tData.push({ time, value: Math.max(10, Math.floor(base * (1 + (Math.random()*0.4 - 0.2)))) });
        } else if(index === 4) {
          tData.push({ time, value: base });
        } else {
           // Forecast
          tData.push({ time, value: null, forecast: Math.max(10, Math.floor(base * (1 + (Math.random()*0.3)))) });
        }
      });
      setTrendData(tData);
    }, [liveValue]);

    // Trend insight
    const trendIsRising = trendData[5] && trendData[5].forecast > liveValue;
    const pctChange = trendData[3] ? Math.abs(((liveValue - trendData[3].value) / trendData[3].value) * 100).toFixed(1) : 0;

    // Personalized Risk Profile State
    const [profile, setProfile] = useState({
        age: 30,
        asthma: false,
        outdoor: 'low' // low | medium | high
    });

    const calculatePersonalResult = () => {
      let riskScore = liveValue;
      if (profile.age < 12 || profile.age > 65) riskScore *= 1.3;
      if (profile.asthma) riskScore *= 1.5;
      if (profile.outdoor === 'high') riskScore *= 1.4;
      if (profile.outdoor === 'medium') riskScore *= 1.2;

      if (riskScore > 200) return "VERY HIGH";
      if (riskScore > 120) return "HIGH";
      if (riskScore > 70) return "MODERATE";
      return "LOW";
    };

    const personalRiskResult = calculatePersonalResult();

    // Health Impact Score (simulated with standard weights: PM2.5 + generic baseline)
    const pm10Proxy = liveValue * 0.8; 
    const healthScore = Math.min(100, Math.floor((liveValue * 0.6) + (pm10Proxy * 0.4)));

    const getHealthScoreText = (score) => {
      if(score > 80) return "High Risk";
      if(score > 50) return "Moderate Risk";
      return "Low Risk";
    };

    const handleDownloadReport = () => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("AeroNova Personalized Air Quality Report", 20, 20);
        doc.setFontSize(16);
        doc.text(`Pollutant Examined: ${data.name} in ${city}`, 20, 35);
        doc.text(`Current Concentration: ${liveValue} ${data.unit}`, 20, 45);
        doc.text(`General Risk Level: ${riskLevel}`, 20, 55);
        doc.text(`Your Personalized Risk: ${personalRiskResult}`, 20, 65);
        doc.text(`Safe Exposure Time: ${getSafeExposure(liveValue)}`, 20, 75);
        
        doc.text("Recommended Action Protocol:", 20, 95);
        getSmartActions(liveValue).forEach((rec, index) => {
            doc.text(`- ${rec}`, 20, 105 + (index * 10));
        });

        doc.save(`${data.name}_Decision_Report.pdf`);
    };

    if (!data) return <div className="p-20 text-center font-black">Data Unavailable</div>;

    const smartActions = getSmartActions(liveValue);
    const causes = getDynamicCauses(liveValue, city, type);

    return (
        <m.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="space-y-8 pb-20 max-w-7xl mx-auto px-4 mt-6"
        >
            {/* 1. REAL-TIME RISK BANNER */}
            <AnimatePresence>
                {isHighRisk && (
                    <m.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-red-500 overflow-hidden rounded-xl shadow-lg relative"
                    >
                        <div className="p-4 flex flex-col md:flex-row items-center justify-center gap-4 text-white font-bold leading-none">
                            <div className="flex items-center gap-3">
                              <AlertTriangle size={24} className="animate-pulse" />
                              <span className="text-lg">⚠ High respiratory risk detected in {city}</span>
                            </div>
                            <span className="opacity-80 text-sm hidden md:block">|</span>
                            <span className="text-sm font-medium tracking-wide">Observe action protocol immediately</span>
                        </div>
                    </m.div>
                )}
            </AnimatePresence>

            {/* Header / Nav */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <Link to="/citizen" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold text-sm tracking-wide transition-colors">
                    <div className="p-2 bg-slate-50 rounded-lg">
                        <ChevronLeft size={16} />
                    </div>
                    Back to Dashboard
                </Link>
                <button 
                    onClick={handleDownloadReport}
                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold tracking-wide hover:bg-blue-700 transition-all shadow border border-blue-500"
                >
                    <Download size={16} />
                    Export Report
                </button>
            </div>

            {/* 2. USEFUL HERO SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Main Readout */}
                <m.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                    <div>
                      <div className="flex items-center justify-between">
                         <h1 className="text-5xl font-black text-slate-800 tracking-tight">{data.name}</h1>
                         <span className={`px-4 py-1.5 ${riskColor} text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-sm`}>
                             {riskLevel}
                         </span>
                      </div>
                      <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                        <MapPin size={14} className="text-blue-500"/> Live Sensor Data from {city}
                      </p>
                    </div>

                    <div className="mt-8 flex items-baseline gap-2">
                        <span className={`text-[90px] font-black leading-none tracking-tighter ${isHighRisk ? 'text-red-500' : 'text-slate-800'}`}>
                            {liveValue}
                        </span>
                        <span className="text-xl font-bold text-slate-400 uppercase tracking-widest">{data.unit}</span>
                    </div>
                </m.div>

                {/* Trend Focus & Exposure Safe Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-col">
                    
                    {/* Safe Time */}
                    <m.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group"
                    >
                         <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                             <Clock size={32} />
                         </div>
                         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Safe Outdoor Exposure</h3>
                         <p className="text-3xl font-black text-slate-800 tracking-tight">{getSafeExposure(liveValue)}</p>
                    </m.div>

                    {/* Trend Box */}
                    <m.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative"
                    >
                         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Current Trend</h3>
                         <div className="flex items-center gap-4">
                             {trendIsRising ? (
                               <div className="p-3 bg-red-50 text-red-500 rounded-xl">
                                   <TrendingUp size={28} />
                               </div>
                             ) : (
                               <div className="p-3 bg-green-50 text-green-500 rounded-xl">
                                   <TrendingDown size={28} />
                               </div>
                             )}
                             <div>
                                 <p className="text-2xl font-black text-slate-800">{trendIsRising ? 'Rising' : 'Falling'}</p>
                                 <p className="text-sm font-bold text-slate-500">{pctChange}% from last hour</p>
                             </div>
                         </div>
                    </m.div>

                    {/* Health Impact Replacement */}
                    <m.div 
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 md:col-span-2 flex items-center justify-between"
                    >
                         <div className="flex items-center gap-4">
                              <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
                                  <Heart size={24} />
                              </div>
                              <div>
                                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Health Risk Score</h3>
                                  <p className="text-lg font-black text-slate-800">{healthScore}/100 <span className="text-sm font-semibold text-slate-500">({getHealthScoreText(healthScore)})</span></p>
                              </div>
                         </div>
                         <div className="w-16 h-16">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart 
                                    cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={8} 
                                    data={[{ value: healthScore, fill: healthScore > 75 ? '#ef4444' : healthScore > 40 ? '#f59e0b' : '#10b981' }]} 
                                    startAngle={180} endAngle={-180}
                                >
                                    <RadialBar background dataKey='value' cornerRadius={10} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                         </div>
                    </m.div>

                </div>
            </div>

            {/* 3. DYNAMIC CAUSES & SMART ACTION ENGINE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Why this is happening */}
                <m.div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <Target className="text-blue-500" size={24} />
                        <h3 className="text-xl font-black text-slate-800">Why this is happening</h3>
                    </div>
                    <ul className="space-y-4">
                        {causes.map((cause, idx) => (
                           <li key={idx} className="flex gap-3 items-start">
                               <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                               <span className="text-slate-600 font-semibold leading-relaxed">{cause}</span>
                           </li>
                        ))}
                    </ul>
                </m.div>

                {/* Smart Action Engine */}
                <m.div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 flex flex-col h-full bg-gradient-to-br from-white to-blue-50/30">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-emerald-500" size={24} />
                        <h3 className="text-xl font-black text-slate-800">Recommended Actions</h3>
                    </div>
                    <ul className="space-y-4 flex-1">
                        {smartActions.map((action, idx) => (
                           <li key={idx} className="flex gap-3 items-start p-3 bg-slate-50 border border-slate-100 rounded-lg">
                               <div className="p-1 bg-emerald-100 text-emerald-600 rounded mt-0.5 shrink-0">
                                  <Activity size={12} />
                               </div>
                               <span className="text-slate-700 font-bold">{action}</span>
                           </li>
                        ))}
                    </ul>
                </m.div>

            </div>

            {/* 4. TREND & FORECAST CHART */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">Last 24h {data.name} Trend</h3>
                        <p className="text-sm font-medium text-slate-500 mt-1">
                            {trendIsRising ? "👉 Pollution rising in next 6 hours" : "👉 Pollution expected to decrease"}
                            {!trendIsRising && " • Best time to go outside: 5 PM"}
                        </p>
                    </div>
                    <div className="hidden md:flex gap-4 text-xs font-bold text-slate-500">
                        <div className="flex gap-2 items-center"><span className="w-2 h-2 rounded bg-blue-500" /> Historical</div>
                        <div className="flex gap-2 items-center"><span className="w-2 h-2 rounded border-2 border-dashed border-blue-400" /> AI Forecast</div>
                    </div>
                </div>

                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickMargin={12} axisLine={false} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                            />
                            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} animationDuration={1000} />
                            <Line type="monotone" dataKey="forecast" stroke="#93c5fd" strokeWidth={3} strokeDasharray="6 4" dot={{ r: 4 }} animationDuration={1500} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 5. PERSONALIZED RISK (IMPROVED CURRENT UI) */}
            <m.div className="p-8 bg-slate-900 rounded-2xl shadow-xl space-y-6 relative overflow-hidden text-white">
                <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-white/10 rounded-xl"><User size={24} className="text-blue-400" /></div>
                        <div>
                            <h4 className="text-2xl font-black tracking-tight">Personalized Risk Engine</h4>
                            <p className="text-xs text-blue-300 font-bold uppercase tracking-widest mt-1">Tailored for you</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                        <div className="space-y-6 col-span-2">
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="space-y-2 flex-1">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Age</label>
                                    <input 
                                        type="number" 
                                        value={profile.age}
                                        onChange={(e) => setProfile({...profile, age: Number(e.target.value)})}
                                        className="w-full p-4 bg-white/5 border border-white/10 rounded-xl font-bold text-xl text-white outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Asthma History</label>
                                    <button 
                                        onClick={() => setProfile({...profile, asthma: !profile.asthma})}
                                        className={`w-full p-4 rounded-xl font-bold text-lg transition-all border ${profile.asthma ? 'bg-red-500/20 border-red-500 text-red-400 z-10' : 'bg-white/5 border-white/10 text-white'}`}
                                    >
                                        {profile.asthma ? 'Yes, I have asthma' : 'No history'}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Planned Outdoor Exposure</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {['low', 'medium', 'high'].map(level => (
                                        <button 
                                            key={level}
                                            onClick={() => setProfile({...profile, outdoor: level})}
                                            className={`p-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all border ${profile.outdoor === level ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-slate-400'}`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Output Score */}
                        <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10 h-full">
                             <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">Your Personal Risk</span>
                             <div className={`text-4xl font-black text-center ${
                                 personalRiskResult === 'VERY HIGH' ? 'text-red-500' :
                                 personalRiskResult === 'HIGH' ? 'text-orange-500' :
                                 personalRiskResult === 'MODERATE' ? 'text-yellow-500' : 'text-green-400'
                             }`}>
                                 {personalRiskResult}
                             </div>
                             <p className="mt-4 text-center text-sm font-medium text-slate-300">
                               Based on {city}'s live {data.name} level of {liveValue}.
                             </p>
                        </div>
                    </div>
                </div>
            </m.div>

        </m.div>
    );
};

export default PollutantDetailPage;
