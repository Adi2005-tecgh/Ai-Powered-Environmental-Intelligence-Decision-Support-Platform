import React, { useMemo } from "react";
import { Sliders } from "lucide-react";

const PolicySimulator = ({ forecast = [] }) => {
  const forecastData = useMemo(() => {
    return (forecast ?? [])
      .map((item, idx) => {
        const aqi = Math.round(Number(item?.aqi));
        if (!Number.isFinite(aqi)) return null;
        return {
          day: `Day ${idx + 1}`,
          aqi
        };
      })
      .filter(Boolean);
  }, [forecast]);

  const maxForecast = useMemo(() => {
    if (!forecastData.length) return { day: "Day 1", aqi: 0 };
    return forecastData.reduce((max, item) => (item.aqi > max.aqi ? item : max), forecastData[0]);
  }, [forecastData]);

  const recommendations = useMemo(() => {
    if (maxForecast.aqi > 130) {
      return [
        { icon: "⚡", title: "Deploy monitoring units", text: "Position rapid-response air quality units in high-density zones." },
        { icon: "⚠️", title: "Restrict industrial emissions", text: "Activate temporary compliance restrictions for heavy emitters." },
        { icon: "⚠️", title: "Issue health advisory", text: "Alert vulnerable groups to limit outdoor exposure in peak periods." }
      ];
    }
    if (maxForecast.aqi >= 80) {
      return [
        { icon: "⚡", title: "Increase monitoring frequency", text: "Run denser sampling cycles to track short-term AQI drift." },
        { icon: "⚠️", title: "Alert local authorities", text: "Notify ward-level teams for preventive enforcement readiness." }
      ];
    }
    return [
      { icon: "✅", title: "Maintain normal operations", text: "Keep baseline controls active with no emergency escalation." },
      { icon: "✅", title: "Continue passive monitoring", text: "Preserve routine surveillance and trend validation checks." }
    ];
  }, [maxForecast.aqi]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="mb-6">
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
            AI Risk Action Center
          </h3>
          <div className="flex items-center space-x-2">
            <Sliders size={16} className="text-slate-600" />
            <span className="text-sm font-black text-slate-800 uppercase tracking-tight">
              AI Recommended Actions
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 font-bold italic">
            Recommendation engine aligned with the same 7-day forecast used in risk projection.
          </p>
        </div>
      </div>

      <div className="bg-slate-50 border rounded-xl p-4 mb-6">
        <p className="text-xs font-black text-slate-500 mb-3">Action Queue</p>
        <div className="space-y-3">
          {recommendations.map((action) => (
            <div key={action.title} className="bg-white border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-base leading-none mt-0.5">{action.icon}</span>
                <div>
                  <p className="text-xs font-black text-slate-900">{action.title}</p>
                  <p className="text-[11px] text-slate-600 mt-1">{action.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">AI Insight</p>
        <p className="text-sm font-black text-blue-900">
          Peak pollution expected on {maxForecast.day} (AQI {maxForecast.aqi}). Preventive action recommended within next 48 hours.
        </p>
        <p className="text-[10px] text-blue-700 font-bold mt-3 italic">
          Insight generated from the same 7-day forecast sequence used in escalation cards and charting.
        </p>
      </div>
    </div>
  );
};

export default PolicySimulator;