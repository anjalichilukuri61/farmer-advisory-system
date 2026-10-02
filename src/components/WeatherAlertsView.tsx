// src/components/WeatherAlertsView.tsx
import React from 'react';
import { Sun, Cloud, CloudRain, Wind, Droplets, AlertTriangle, ShieldAlert, Radio } from 'lucide-react';
import { WeatherData } from '../types/index.js';
import { Language, translations } from '../i18n/translations.js';
import { VoiceButton } from './VoiceButton.js';

interface WeatherAlertsViewProps {
  weather: WeatherData | null;
  loading: boolean;
  lang: Language;
}

export const WeatherAlertsView: React.FC<WeatherAlertsViewProps> = ({
  weather,
  loading,
  lang,
}) => {
  const t = translations[lang];

  if (loading && !weather) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 animate-pulse space-y-4">
        <div className="h-8 w-64 bg-stone-200 rounded-xl"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-28 bg-stone-100 rounded-2xl"></div>
          <div className="h-28 bg-stone-100 rounded-2xl"></div>
          <div className="h-28 bg-stone-100 rounded-2xl"></div>
          <div className="h-28 bg-stone-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!weather) return null;

  const current = weather.current;

  const getWeatherIcon = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
      return <CloudRain className="w-8 h-8 text-blue-500" />;
    }
    if (c.includes('cloud') || c.includes('overcast')) {
      return <Cloud className="w-8 h-8 text-stone-500" />;
    }
    return <Sun className="w-8 h-8 text-amber-500" />;
  };

  const getWeatherSpeechText = () => {
    if (lang === 'te') {
      return `వ్యవసాయ వాతావరణ నివేదిక: ప్రస్తుత ఉష్ణోగ్రత ${current.temperature} డిగ్రీల సెల్సియస్, వాతావరణం ${current.weatherCondition}. గాలిలో తేమ ${current.humidity} శాతం, గత 24 గంటల వర్షపాతం ${current.rainfallMm} మిల్లీమీటర్లు, గాలి వేగం గంటకు ${current.windSpeedKmh} కిలోమీటర్లు.`;
    }
    return `Agricultural weather telemetry: Current temperature is ${current.temperature} degrees Celsius with ${current.weatherCondition}. Relative humidity is ${current.humidity} percent, rainfall is ${current.rainfallMm} millimeters, and wind speed is ${current.windSpeedKmh} kilometers per hour.`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
              <Sun className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                  {t.weatherPage.title}
                </h1>
                <VoiceButton
                  id="weather_page_title_voice"
                  textToSpeak={getWeatherSpeechText()}
                  lang={lang}
                  variant="compact"
                  ariaLabel={lang === 'te' ? 'వాతావరణ సమాచారాన్ని వినండి' : 'Listen to weather'}
                />
              </div>
              <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
                {t.weatherPage.subtitle} • {current.locationName}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
              {weather.isLive ? t.weatherPage.liveTelemetry : t.weatherPage.offlineMode}
            </span>
          </div>
        </div>

        {/* Current Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {/* Temperature */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-500 font-bold block">{t.weatherPage.temperature}</span>
              <span className="text-3xl font-black text-stone-900 mt-1 block">{current.temperature}°C</span>
              <span className="text-xs text-stone-600 font-semibold mt-0.5 block">{current.weatherCondition}</span>
            </div>
            <div className="p-3 bg-white rounded-2xl shadow-xs border border-stone-100">
              {getWeatherIcon(current.weatherCondition)}
            </div>
          </div>

          {/* Humidity */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-500 font-bold block">{t.weatherPage.humidity}</span>
              <span className="text-3xl font-black text-stone-900 mt-1 block">{current.humidity}%</span>
              <span className="text-xs text-stone-600 font-semibold mt-0.5 block">
                {current.humidity > 80 ? 'High Dewpoint' : 'Optimal'}
              </span>
            </div>
            <div className="p-3 bg-white rounded-2xl shadow-xs border border-stone-100">
              <Droplets className="w-7 h-7 text-blue-500" />
            </div>
          </div>

          {/* Rainfall */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-500 font-bold block">{t.weatherPage.rainfall}</span>
              <span className="text-3xl font-black text-stone-900 mt-1 block">{current.rainfallMm} mm</span>
              <span className="text-xs text-stone-600 font-semibold mt-0.5 block">
                {current.rainfallMm > 10 ? 'Significant Rain' : 'Dry / Normal'}
              </span>
            </div>
            <div className="p-3 bg-white rounded-2xl shadow-xs border border-stone-100">
              <CloudRain className="w-7 h-7 text-indigo-500" />
            </div>
          </div>

          {/* Wind Speed */}
          <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-500 font-bold block">{t.weatherPage.windSpeed}</span>
              <span className="text-3xl font-black text-stone-900 mt-1 block">{current.windSpeedKmh} km/h</span>
              <span className="text-xs text-stone-600 font-semibold mt-0.5 block">
                {current.windSpeedKmh > 20 ? 'High Wind' : 'Gentle Breeze'}
              </span>
            </div>
            <div className="p-3 bg-white rounded-2xl shadow-xs border border-stone-100">
              <Wind className="w-7 h-7 text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Agricultural Weather Alerts */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <h2 className="text-lg font-bold text-stone-900 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <span>{t.weatherPage.alertsTitle}</span>
        </h2>

        {weather.alerts && weather.alerts.length > 0 ? (
          <div className="space-y-3">
            {weather.alerts.map((alt, idx) => {
              const isHigh = alt.severity === 'HIGH' || alt.severity === 'CRITICAL';
              const alertSpeech = `${alt.title}. ${alt.message}`;

              return (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isHigh
                      ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                      : 'bg-blue-50/90 border-blue-200 text-blue-950'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5 shrink-0">
                      {isHigh ? (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      ) : (
                        <ShieldAlert className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm">{alt.title}</span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                            isHigh ? 'bg-amber-200 text-amber-900' : 'bg-blue-200 text-blue-900'
                          }`}
                        >
                          {alt.severity}
                        </span>
                      </div>
                      <p className="text-xs mt-1 leading-relaxed opacity-95">{alt.message}</p>
                    </div>
                  </div>

                  <VoiceButton
                    id={`weather_alert_${idx}`}
                    textToSpeak={alertSpeech}
                    lang={lang}
                    variant="inline"
                    className="shrink-0"
                    ariaLabel={lang === 'te' ? `హెచ్చరికను వినండి: ${alt.title}` : `Listen to alert: ${alt.title}`}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t.weatherPage.noAlerts}</span>
          </div>
        )}
      </div>

      {/* 5-Day Forecast */}
      {weather.forecast && weather.forecast.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200">
          <h2 className="text-base font-bold text-stone-900 uppercase tracking-wider mb-4">
            {t.weatherPage.fiveDayForecast}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {weather.forecast.map((day, i) => (
              <div
                key={i}
                className="bg-stone-50 rounded-2xl p-4 text-center border border-stone-200 shadow-2xs space-y-1.5"
              >
                <p className="text-xs font-bold text-stone-700">
                  {new Date(day.date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <div className="flex justify-center py-1">{getWeatherIcon(day.condition)}</div>
                <p className="text-sm font-extrabold text-stone-900">
                  {day.maxTemp}° / <span className="text-stone-500 font-normal">{day.minTemp}°</span>
                </p>
                <p className="text-[11px] font-semibold text-blue-600">
                  {day.precipitationMm > 0 ? `${day.precipitationMm} mm rain` : 'Dry'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
