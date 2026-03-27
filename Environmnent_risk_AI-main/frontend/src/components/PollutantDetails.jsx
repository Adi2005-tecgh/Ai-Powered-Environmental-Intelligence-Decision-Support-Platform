import React from 'react';
import { motion } from 'framer-motion';
import { 
  Info, 
  Car, 
  Factory, 
  Wind, 
  Flame, 
  Activity, 
  ShieldCheck, 
  Heart,
  Droplets,
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  Microscope
} from 'lucide-react';

import heroBanner from '../assets/hero_banner.png';
import diagram from '../assets/diagram.png';

const PollutantDetails = ({ pollutant = 'pm25', value = 0 }) => {
  // Severity logic
  const getSeverity = (val) => {
    if (val <= 50) return { label: 'Good', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    if (val <= 100) return { label: 'Moderate', color: 'text-amber-500', bg: 'bg-amber-500/10' };
    if (val <= 200) return { label: 'Unhealthy', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    return { label: 'Severe', color: 'text-rose-500', bg: 'bg-rose-500/10' };
  };

  const severity = getSeverity(value);
  const pollutantLabel = pollutant?.toUpperCase() || 'Pollutant';

  // Section 2 Metadata
  const EXPLANATIONS = {
    pm25: "PM 2.5 refers to fine particulate matter smaller than 2.5 microns, primarily from industrial and vehicular combustion.",
    pm10: "PM 10 includes dust, pollen, and larger mold particles often associated with construction and nature.",
    no2: "Nitrogen Dioxide is a gaseous pollutant primarily produced by vehicle engines and power plants.",
    co: "Carbon Monoxide is a toxic, colorless gas formed by the incomplete combustion of fossil fuels.",
    so2: "Sulfur Dioxide is produced from coal and oil combustion, leading to acid rain and lung issues.",
    o3: "Ground-level Ozone is created by chemical reactions between NOx and VOCs in sunlight."
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <motion.div 
        {...fadeIn}
        className="mt-12 space-y-16 bg-white overflow-hidden rounded-[2.5rem] shadow-2xl border border-slate-100"
    >
      {/* 1. HERO VISUAL SECTION */}
      <div className="relative h-[250px] w-full overflow-hidden">
        <img 
          src={heroBanner} 
          alt="Pollution background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col justify-center px-12 space-y-3">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-[2px] bg-blue-500" />
            <span className="text-blue-400 font-black text-[10px] uppercase tracking-[0.4em]">Intelligence Report</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tighter"
          >
            Understanding <span className="text-blue-500">{pollutantLabel}</span> Pollution
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-slate-400 font-bold text-sm max-w-xl"
          >
            A comprehensive look at origin, health impacts, and essential safety protocols for your neighborhood.
          </motion.p>
        </div>
      </div>

      <div className="px-12 pb-16 space-y-16">
        {/* 2. TITLE + SEVERITY BAR */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 border-b border-slate-100 pb-12">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 rounded-lg text-white"><Microscope size={18} /></div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{pollutantLabel} Live Diagnostic</h2>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-7xl font-black text-slate-900 tabular-nums tracking-tighter">
                        {value} <span className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] ml-2">µg/m³</span>
                    </div>
                    <div className={`px-6 py-3 rounded-2xl border-2 ${severity.bg} ${severity.color} border-current flex items-center gap-3 shadow-xl`}>
                        <div className="w-2 h-2 rounded-full bg-current animate-ping" />
                        <span className="text-[14px] font-black uppercase tracking-[0.2em]">{severity.label}</span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-6 lg:min-w-[340px]">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600"><TrendingDown size={24} /></div>
                <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stability Anchor</p>
                     <p className="text-sm font-bold text-slate-700 italic">"Level is currently trending within 5% of previous sensor sync."</p>
                </div>
            </div>
        </div>

        {/* 3. ILLUSTRATION SECTION (Particle Comparison) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-100">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img 
                    src={diagram} 
                    alt="Particle comparison size diagram" 
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Info size={18} /></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Educational Visual</span>
                </div>
                <h4 className="text-3xl font-black text-slate-900 leading-tight">Seeing the Invisible</h4>
                <p className="text-lg font-bold text-slate-600 leading-relaxed italic border-l-4 border-blue-500 pl-6">
                    {EXPLANATIONS[pollutant] || EXPLANATIONS.pm25}
                </p>
                <div className="p-6 bg-white rounded-2xl shadow-sm space-y-2">
                    <p className="text-xs font-black text-slate-900 uppercase">Size Comparison Tip:</p>
                    <p className="text-sm font-bold text-slate-500 italic leading-relaxed">
                        A human hair is 70 microns in diameter. PM2.5 is 1/30th the size, making it small enough to directly enter the bloodstream via the lungs.
                    </p>
                </div>
            </div>
        </div>

        {/* 4. UPGRADE SOURCE CARDS (Glassmorphism) */}
        <div className="space-y-8">
            <div className="flex items-center gap-6">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] shrink-0 italic">Primary Exposure Paths</h4>
                <div className="h-px w-full bg-slate-100" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { id: 1, title: 'Motor Vehicles', desc: 'Internal combustion engines and brake wear.', icon: <Car size={24} />, color: 'blue' },
                    { id: 2, title: 'Energy Industry', desc: 'Coal-fired power and heavy manufacturing.', icon: <Factory size={24} />, color: 'slate' },
                    { id: 3, title: 'Particulate Dust', desc: 'Unpaved roads and major site construction.', icon: <Wind size={24} />, color: 'emerald' },
                    { id: 4, title: 'Biomass Fires', desc: 'Agricultural burning and waste incineration.', icon: <Flame size={24} />, color: 'rose' }
                ].map((source, i) => (
                    <motion.div 
                        key={source.id} 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05, y: -8 }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative p-8 rounded-[2rem] border border-slate-100 bg-white shadow-lg hover:shadow-2xl transition-all cursor-default overflow-hidden"
                    >
                        {/* Interactive BG Glow */}
                        <div className="absolute -right-4 -top-4 w-20 h-20 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-colors duration-500" />
                        
                        <div className="relative z-10 space-y-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform">
                                {source.icon}
                            </div>
                            <div className="space-y-2">
                                <h5 className="text-lg font-black text-slate-900 tracking-tight">{source.title}</h5>
                                <p className="text-xs font-bold text-slate-500 leading-relaxed italic">{source.desc}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* 5. UPGRADE HEALTH & PRECAUTION CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
            {/* Health Effects - Red Tint */}
            <motion.div 
                {...fadeIn}
                className="group relative p-10 bg-rose-50 rounded-[3rem] border border-rose-100/50 space-y-8 overflow-hidden"
            >
                <div className="absolute right-0 top-0 p-8 opacity-5 text-rose-500"><Heart size={120} /></div>
                
                <div className="flex items-center gap-5 relative z-10">
                    <div className="p-4 bg-rose-500 text-white rounded-[1.25rem] shadow-xl shadow-rose-500/20"><Activity size={24} /></div>
                    <div>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tighter">Medical Impact Index</h4>
                        <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em]">Critical Physiological Risks</p>
                    </div>
                </div>

                <div className="space-y-4 relative z-10">
                    {['Pulmonary Inflammation', 'Asthma Aggravation', 'Systemic Oxygen Deficit', 'Cardiovascular Strain'].map((effect, i) => (
                        <div 
                            key={i} 
                            className="flex items-center justify-between p-5 bg-white rounded-2xl border border-rose-100 group-hover:border-rose-300 transition-all hover:translate-x-3"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full bg-rose-500" />
                                <span className="text-[13px] font-black text-slate-700 tracking-tight uppercase italic">{effect}</span>
                            </div>
                            <Heart size={14} className="text-rose-200" />
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Precautions - Green Tint */}
            <motion.div 
                {...fadeIn}
                className="group relative p-10 bg-emerald-50 rounded-[3rem] border border-emerald-100/50 space-y-8 overflow-hidden"
            >
                <div className="absolute right-0 top-0 p-8 opacity-5 text-emerald-500"><ShieldCheck size={120} /></div>

                <div className="flex items-center gap-5 relative z-10">
                    <div className="p-4 bg-emerald-500 text-white rounded-[1.25rem] shadow-xl shadow-emerald-500/20"><ShieldCheck size={24} /></div>
                    <div>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tighter">Protective Protocols</h4>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em]">Sovereign Safety Guidelines</p>
                    </div>
                </div>

                <div className="space-y-4 relative z-10">
                    {['Deploy N95 / FFP2 Masks', 'Seal Domestic Environments', 'Engage HEPA Purifiers', 'Throttle Outdoor Exposure'].map((prec, i) => (
                        <div 
                            key={i} 
                            className="flex items-center justify-between p-5 bg-white rounded-2xl border border-emerald-100 group-hover:border-emerald-300 transition-all hover:translate-x-3"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><ChevronRight size={14} /></div>
                                <span className="text-[13px] font-black text-slate-700 tracking-tight uppercase italic">{prec}</span>
                            </div>
                            <ShieldCheck size={14} className="text-emerald-200" />
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>

        {/* 6. FINAL CALL TO ACTION / INFO */}
        <div className="bg-slate-900 text-white p-12 rounded-[2.5rem] relative overflow-hidden">
             <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="space-y-4 text-center md:text-left">
                    <h5 className="text-3xl font-black tracking-tighter leading-none">Citizens Oversight Sync</h5>
                    <p className="text-slate-400 font-bold text-sm max-w-lg leading-relaxed italic border-l-2 border-blue-500 pl-6">
                        "Your safety is a collective responsibility. Use the diagnostics above to inform your daily travel and domestic air filtration strategies."
                    </p>
                </div>
                <button className="px-10 py-5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-blue-500 transition-all hover:shadow-2xl hover:shadow-blue-500/40 whitespace-nowrap">
                    Download Health PDF
                </button>
             </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PollutantDetails;
