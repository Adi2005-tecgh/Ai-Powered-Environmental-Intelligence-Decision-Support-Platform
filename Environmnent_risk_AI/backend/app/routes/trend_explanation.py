from flask import Blueprint, jsonify
import numpy as np
import pandas as pd
import os
from datetime import datetime
from services.live_aqi_service import get_live_aqi_service
from .predict import predict_aqi # We can reuse the prediction logic or just call the endpoint internally if needed, but let's just use the service.

trend_bp = Blueprint('trend_explanation', __name__)

@trend_bp.route('/trend-explanation/<city>', methods=['GET'])
def get_trend_explanation(city):
    """
    Explain the AQI trend (increasing/decreasing) based on feature changes.
    """
    try:
        service = get_live_aqi_service()
        
        # 1. Get Live Data
        pollution_reading, source = service.fetch_and_buffer(city)
        if not pollution_reading:
            return jsonify({'error': 'No live data available for trend calculation'}), 404
            
        current_aqi = pollution_reading.get('aqi', 0)
        
        # 2. Get Forecast (Simplistic: comparing current to day 1 forecast or using previous readings)
        # For trend explanation, we look at the DELTA between current and predicted/historical
        buffer = service.get_buffer(city)
        
        reasons = []
        trend = "Stable"
        icon = "➡️"
        
        if len(buffer) >= 2:
            prev_reading = buffer[-2]
            curr_reading = buffer[-1]
            
            prev_aqi = prev_reading.get('aqi', 0)
            curr_aqi = curr_reading.get('aqi', 0)
            
            diff = curr_aqi - prev_aqi
            
            if diff > 5:
                trend = "Worsening"
                icon = "⬆️"
            elif diff < -5:
                trend = "Improving"
                icon = "⬇️"
                
            # Factors
            # PM2.5
            p_pm25 = prev_reading.get('pm25') or 0
            c_pm25 = curr_reading.get('pm25') or 0
            if c_pm25 > p_pm25 * 1.1:
                reasons.append(f"Rising **PM2.5 concentration** (+{round(c_pm25-p_pm25, 1)})")
            elif c_pm25 < p_pm25 * 0.9:
                reasons.append(f"Drop in **PM2.5 levels** aiding air quality")
                
            # Wind Speed
            p_ws = prev_reading.get('wind_speed') or 2.0
            c_ws = curr_reading.get('wind_speed') or 2.0
            if c_ws < 1.0:
                reasons.append("Low **wind speed** causing pollutant buildup")
            elif c_ws > p_ws * 1.5:
                reasons.append("Improved **wind speed** aiding dispersion")
                
            # Dominant Pollutant check
            dom = curr_reading.get('dominantpol', 'N/A').upper()
            if trend == "Worsening":
                reasons.append(f"Increased concentration of **{dom}**")
            
        # Fallback if no buffer history
        if not reasons:
            if current_aqi > 200:
                trend = "Worsening"
                icon = "⬆️"
                reasons = [
                    "High localized particulate matter concentration",
                    "Stagnant atmospheric conditions",
                    "Industrial emissions in the vicinity"
                ]
            else:
                trend = "Improving"
                icon = "⬇️"
                reasons = [
                    "Active atmospheric dispersion",
                    "Reduced pollutant source activity",
                    "Favorable meteorological parameters"
                ]

        return jsonify({
            'city': city,
            'status': 'success',
            'current_aqi': current_aqi,
            'trend': trend,
            'icon': icon,
            'reasons': reasons[:3]
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
