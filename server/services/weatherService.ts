// server/services/weatherService.ts
import { config } from '../config/index.js';

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  rainfallMm: number;
  weatherCondition: string;
  windSpeedKmh: number;
  recordedAt: string;
  source: string;
  locationName?: string;
}

export interface WeatherForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitationMm: number;
  condition: string;
}

export interface WeatherResponse {
  current: CurrentWeather;
  forecast: WeatherForecastDay[];
  alerts: {
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    title: string;
    message: string;
    category: 'WEATHER_ALERT' | 'SPRAYING_ADVISORY' | 'FROST_WARNING' | 'HEAT_STRESS';
  }[];
  isLive: boolean;
  cached: boolean;
}

// In-memory 15-minute cache to respect rate-limits and optimize response time
interface CacheEntry {
  data: WeatherResponse;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export class WeatherService {
  public static async getWeatherData(
    lat: number = 17.9689,
    lon: number = 79.5941,
    locationName: string = 'Warangal'
  ): Promise<WeatherResponse> {
    const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const now = Date.now();

    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return { ...cached.data, cached: true };
    }

    try {
      // 1. Fetch live Open-Meteo High Resolution Weather API
      // Open-Meteo provides accurate global real-time meteorological models with no key constraint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'AgriWise-Decision-Support/2.0' },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Open-Meteo API returned status ${response.status}`);
      }

      const json = await response.json();
      const current = json.current;
      const daily = json.daily;

      const weatherCondition = this.mapWmoCodeToCondition(current.weather_code);
      const temperature = Math.round(current.temperature_2m * 10) / 10;
      const humidity = Math.round(current.relative_humidity_2m);
      const rainfallMm = Math.round(current.precipitation * 10) / 10;
      const windSpeedKmh = Math.round(current.wind_speed_10m * 10) / 10;

      // 5-day daily forecast
      const forecast: WeatherForecastDay[] = [];
      if (daily && daily.time) {
        for (let i = 0; i < Math.min(5, daily.time.length); i++) {
          forecast.push({
            date: daily.time[i],
            maxTemp: Math.round(daily.temperature_2m_max[i]),
            minTemp: Math.round(daily.temperature_2m_min[i]),
            precipitationMm: Math.round(daily.precipitation_sum[i] * 10) / 10,
            condition: this.mapWmoCodeToCondition(daily.weather_code[i]),
          });
        }
      }

      // Generate objective, data-driven agricultural weather alerts
      const alerts = this.deriveWeatherAlerts(temperature, humidity, rainfallMm, windSpeedKmh, forecast);

      const weatherResult: WeatherResponse = {
        current: {
          temperature,
          humidity,
          rainfallMm,
          weatherCondition,
          windSpeedKmh,
          recordedAt: new Date().toISOString(),
          source: 'Open-Meteo High Resolution ECMWF/GFS',
          locationName,
        },
        forecast,
        alerts,
        isLive: true,
        cached: false,
      };

      cache.set(cacheKey, { data: weatherResult, timestamp: now });
      return weatherResult;
    } catch (error) {
      console.warn('Live weather fetch failed, serving safe baseline climate context with explicit non-live flag:', error);

      // Graceful fallback with clear honesty flag (isLive: false)
      const fallbackResult: WeatherResponse = {
        current: {
          temperature: 28.5,
          humidity: 65,
          rainfallMm: 0.0,
          weatherCondition: 'Partly Cloudy (Station Baseline)',
          windSpeedKmh: 12.0,
          recordedAt: new Date().toISOString(),
          source: 'Regional Climatological Station (Offline Fallback)',
          locationName,
        },
        forecast: [
          { date: new Date().toISOString().split('T')[0], maxTemp: 32, minTemp: 22, precipitationMm: 0, condition: 'Partly Cloudy' },
          { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], maxTemp: 31, minTemp: 21, precipitationMm: 2.5, condition: 'Light Showers' },
          { date: new Date(Date.now() + 172800000).toISOString().split('T')[0], maxTemp: 30, minTemp: 22, precipitationMm: 5.0, condition: 'Scattered Rain' },
        ],
        alerts: [
          {
            severity: 'LOW',
            title: 'Live Weather Station Offline',
            message: 'Unable to reach remote meteorological satellite feed. Using local district seasonal normals.',
            category: 'WEATHER_ALERT',
          },
        ],
        isLive: false,
        cached: false,
      };

      return fallbackResult;
    }
  }

  private static mapWmoCodeToCondition(code: number): string {
    if (code === 0) return 'Clear Sky';
    if (code === 1 || code === 2) return 'Mainly Clear';
    if (code === 3) return 'Overcast';
    if (code === 45 || code === 48) return 'Foggy';
    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code >= 61 && code <= 65) return 'Rain Showers';
    if (code >= 71 && code <= 77) return 'Snow / Hail';
    if (code >= 80 && code <= 82) return 'Heavy Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Partly Cloudy';
  }

  private static deriveWeatherAlerts(
    temp: number,
    humidity: number,
    rain: number,
    wind: number,
    forecast: WeatherForecastDay[]
  ): WeatherResponse['alerts'] {
    const alerts: WeatherResponse['alerts'] = [];

    // 1. Wind speed advisory for pesticide / foliar spraying
    if (wind > 20) {
      alerts.push({
        severity: wind > 30 ? 'HIGH' : 'MEDIUM',
        title: `High Wind Speed (${wind} km/h) — Spraying Warning`,
        message: 'Avoid pesticide, foliar nutrient, or herbicide spraying today. High winds cause droplet drift and environmental loss.',
        category: 'SPRAYING_ADVISORY',
      });
    }

    // 2. High Temperature / Heat Stress
    if (temp > 38) {
      alerts.push({
        severity: 'HIGH',
        title: `Extreme Heat Warning (${temp}°C)`,
        message: 'Severe canopy evapotranspiration expected. Ensure morning irrigation to protect flowering and grain-filling stages.',
        category: 'HEAT_STRESS',
      });
    } else if (temp < 6) {
      alerts.push({
        severity: 'HIGH',
        title: `Cold / Frost Hazard (${temp}°C)`,
        message: 'Risk of frost injury on tender crop shoots. Consider nocturnal irrigation or smoke mulching to conserve canopy heat.',
        category: 'FROST_WARNING',
      });
    }

    // 3. Heavy Rain Forecast in next 48h
    const upcomingRain = forecast.slice(0, 2).reduce((sum, d) => sum + d.precipitationMm, 0);
    if (upcomingRain >= 25 || rain >= 20) {
      alerts.push({
        severity: upcomingRain >= 45 ? 'CRITICAL' : 'HIGH',
        title: `Heavy Rain Alert (${upcomingRain.toFixed(1)} mm upcoming)`,
        message: 'Substantial downpour expected. Defer urea fertilizer application to prevent leaching. Clean field drainage channels.',
        category: 'WEATHER_ALERT',
      });
    }

    // 4. Fungal Microclimate Alert
    if (humidity > 85 && temp >= 20 && temp <= 30) {
      alerts.push({
        severity: 'MEDIUM',
        title: 'High Pathogen Humidity Alert',
        message: `Prolonged relative humidity (${humidity}%) at ${temp}°C elevates fungal spore germination risk. Monitor lower canopy.`,
        category: 'WEATHER_ALERT',
      });
    }

    return alerts;
  }
}
