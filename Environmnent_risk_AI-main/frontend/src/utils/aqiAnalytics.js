/**
 * AI risk calculation based on pollutant concentrations.
 */
export function getRiskLevel(pm25, pm10, no2) {
    if (pm25 > 200 || pm10 > 300 || no2 > 200) return "CRITICAL";
    if (pm25 > 150 || pm10 > 200 || no2 > 150) return "HIGH";
    if (pm25 > 100 || pm10 > 150 || no2 > 100) return "MODERATE";
    return "SAFE";
}

/**
 * Calculates personalized risk level based on user profile.
 */
export function getPersonalizedRisk(baseRisk, profile) {
    let score = 0;
    
    // Base risk mapping
    const riskMap = { "SAFE": 1, "MODERATE": 2, "HIGH": 3, "CRITICAL": 4 };
    score += riskMap[baseRisk] || 1;

    // Profile adjustments
    if (profile.age > 50) score += 1;
    if (profile.asthma) score += 2;
    if (profile.outdoor === "high") score += 2;
    if (profile.outdoor === "medium") score += 1;

    if (score >= 7) return "EXTREME";
    if (score >= 5) return "VERY HIGH";
    if (score >= 3) return "HIGH";
    return "MODERATE";
}

/**
 * Generates dynamic recommendations based on pollutant levels.
 */
export function getRecommendations(pm25, pm10, no2) {
    const recs = [];
    if (pm25 > 150) recs.push({ id: 1, title: "Avoid outdoor activity", desc: "Fine particles can penetrate deep into lungs.", type: "danger" });
    if (pm10 > 100) recs.push({ id: 2, title: "Keep windows closed", desc: "Coarse dust particles are high in your area.", type: "warning" });
    if (no2 > 50) recs.push({ id: 3, title: "Avoid traffic areas", desc: "Nitrogen dioxide levels are elevated near roads.", type: "warning" });
    
    // Default recs if none triggered
    if (recs.length === 0) {
        recs.push({ id: 4, title: "Normal Activity", desc: "Air quality is within acceptable limits.", type: "success" });
    }
    
    return recs;
}

/**
 * Calculates Health Impact Score (0-100).
 * Formula: score = (pm25 * 0.6) + (pm10 * 0.4) normalized to 100.
 * Assuming max PM2.5 = 500, max PM10 = 500 for normalization.
 */
export function calculateHealthImpact(pm25, pm10) {
    const rawScore = (pm25 * 0.6) + (pm10 * 0.4);
    const normalized = Math.min(100, (rawScore / 300) * 100);
    return Math.round(normalized);
}

/**
 * Calculates safe outdoor exposure time in minutes.
 */
export function getSafeExposure(pm25) {
    if (pm25 > 250) return 15;
    if (pm25 > 150) return 30;
    if (pm25 > 100) return 60;
    if (pm25 > 50) return 120;
    return 480; // 8 hours
}

/**
 * Mock data for charts
 */
export const getMockTrendData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: Math.floor(Math.random() * 50) + 100,
        forecast: null
    }));
    
    const forecast = Array.from({ length: 3 }, (_, i) => ({
        time: `Day ${i + 1}`,
        value: null,
        forecast: Math.floor(Math.random() * 60) + 110
    }));

    return [...hours, ...forecast];
};

export const getMockSourceData = () => [
    { name: 'Vehicles', value: 45, color: '#ef4444' },
    { name: 'Dust', value: 30, color: '#f59e0b' },
    { name: 'Industry', value: 25, color: '#3b82f6' },
];

export const getHotspots = () => [
    { name: 'Industrial Zone A', aqi: 185, distance: '2.4km' },
    { name: 'Downtown Center', aqi: 162, distance: '4.1km' },
    { name: 'Construction Site B', aqi: 210, distance: '1.8km' },
];
