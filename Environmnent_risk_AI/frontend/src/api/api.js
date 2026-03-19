import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getSupportedCities = () => api.get('/api/supported-cities');
export const getForecast = (city) => api.get(`/api/predict/${city}`);
export const getForecastByGeo = (lat, lon) => api.get(`/api/predict/geo/${lat}/${lon}`);
export const getRisk = (city) => api.get(`/api/risk/${city}`);
export const getAnomalies = (city) => api.get(`/api/anomalies/${city}`);
export const getHotspots = (city) => api.get(`/api/hotspots/${city}`);
export const getEconomicImpact = (city) => api.get(`/api/government/economic-impact/${city}`);

export const getTransparencyHistory = () => api.get('/api/transparency/history');
export const getTrendExplanation = (city) => api.get(`/api/trend-explanation/${city}`);


export default api;
