// src/components/IrrigationRecommendationView.tsx
import React, { useState, useEffect } from 'react';
import { Droplets, AlertCircle, Info, Sparkles, CloudRain, ShieldCheck } from 'lucide-react';
import { Farm, WeatherData } from '../types/index.js';
import { Language, translations, getTranslatedCropName } from '../i18n/translations.js';
import { ConfirmedSoilBanner } from './ConfirmedSoilBanner.js';
import { VoiceButton } from './VoiceButton.js';
import { api } from '../services/api.js';

interface IrrigationRecommendationViewProps {
  farm: Farm | null;
  weather: WeatherData | null;
  lang: Language;
  onOpenUpload: () => void;
}

export const IrrigationRecommendationView: React.FC<IrrigationRecommendationViewProps> = ({
  farm,
  weather,
  lang,
  onOpenUpload,
}) => {
  const t = translations[lang];
  const profile = farm?.profile;

  const [selectedCrop, setSelectedCrop] = useState<string>('Rice');
  const [moisture, setMoisture] = useState<number>(profile?.soil_moisture ?? 42);
  const [loading, setLoading] = useState<boolean>(false);
  const [irrigationResult, setIrrigationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateIrrigation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.predictIrrigation({
        farm_id: farm?.id,
        crop: selectedCrop,
        soil_moisture_percentage: Number(moisture),
        temperature: weather?.current.temperature ?? 28,
        humidity: weather?.current.humidity ?? 65,
        forecast_rainfall_next_48h_mm: weather?.forecast?.[0]?.precipitationMm ?? 0,
      });

      setIrrigationResult(res.result);
    } catch (err: any) {
      setError(err.message || 'Failed to evaluate irrigation needs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      calculateIrrigation();
    } else {
      setIrrigationResult(null);
    }
  }, [profile, selectedCrop]);

  const getSpokenText = () => {
    if (!irrigationResult) return '';
    const statusText = irrigationResult.isIrrigationNeeded
      ? (lang === 'te' ? 'ప్రస్తుతం నీరు పెట్టడం అవసరం' : 'Irrigation is currently needed')
      : (lang === 'te' ? 'ప్రస్తుతం నీటిపారుదల అవసరం లేదు, వాయిదా వేయవచ్చు' : 'Irrigation is not immediately required');

    if (lang === 'te') {
      return `నీటిపారుదల నిర్ణయ సలహా: ${statusText}. సమయం: ${irrigationResult.suggestedTiming}. ${irrigationResult.reasoning}. వాతావరణ సమాచారం: ${irrigationResult.weatherConsideration}.`;
    }
    return `Irrigation advisory: ${statusText}. Suggested timing: ${irrigationResult.suggestedTiming}. ${irrigationResult.reasoning}. Weather consideration: ${irrigationResult.weatherConsideration}.`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 border border-blue-200">
              <Droplets className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                  {t.irrigationPage.title}
                </h1>
                {irrigationResult && (
                  <VoiceButton
                    id="irrigation_title_voice"
                    textToSpeak={getSpokenText()}
                    lang={lang}
                    variant="compact"
                    ariaLabel={lang === 'te' ? 'నీటిపారుదల నిర్ణయాన్ని వినండి' : 'Listen to irrigation advisory'}
                  />
                )}
              </div>
              <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
                {t.irrigationPage.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Confirmed Soil Banner */}
        <div className="mt-4">
          <ConfirmedSoilBanner farm={farm} lang={lang} onOpenUpload={onOpenUpload} />
        </div>

        {/* Controls Bar: Crop & Soil Moisture Adjustment */}
        <div className="mt-4 p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                {t.irrigationPage.targetCrop}
              </label>
              <select
                value={selectedCrop}
                onChange={e => setSelectedCrop(e.target.value)}
                className="px-3.5 py-2 bg-white rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="Rice">{t.crops.rice || 'Rice (వరి)'}</option>
                <option value="Maize">{t.crops.maize || 'Maize (మొక్కజొన్న)'}</option>
                <option value="Cotton">{t.crops.cotton || 'Cotton (ప్రత్తి)'}</option>
                <option value="Wheat">{t.crops.wheat || 'Wheat (గోధుమ)'}</option>
                <option value="Banana">{t.crops.banana || 'Banana (అరటి)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                {t.irrigationPage.soilMoistureLabel}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={moisture}
                  onChange={e => setMoisture(Number(e.target.value))}
                  className="w-24 px-3 py-2 bg-white rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-xs text-stone-500 font-medium">%</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={calculateIrrigation}
            className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>{loading ? t.irrigationPage.calculating : t.irrigationPage.btnCalculate}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Decision Display */}
      {irrigationResult ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                {getTranslatedCropName(irrigationResult.cropName, lang)} • {t.irrigationPage.decisionStatus}
              </span>
              <h2 className="text-2xl font-black text-stone-900 mt-0.5">
                {irrigationResult.isIrrigationNeeded
                  ? t.irrigationPage.needed
                  : t.irrigationPage.notNeeded}
              </h2>
            </div>

            <VoiceButton
              id="irrig_card_voice"
              textToSpeak={getSpokenText()}
              lang={lang}
              variant="pill"
              className="bg-blue-700 hover:bg-blue-800 text-white"
            />
          </div>

          {/* Decision Status Banner */}
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              irrigationResult.isIrrigationNeeded
                ? 'bg-blue-50/80 border-blue-200 text-blue-950'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            }`}
          >
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-full uppercase ${
                    irrigationResult.urgency === 'CRITICAL' || irrigationResult.urgency === 'HIGH'
                      ? 'bg-red-200 text-red-900'
                      : irrigationResult.urgency === 'MEDIUM'
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-emerald-200 text-emerald-900'
                  }`}
                >
                  {t.irrigationPage.urgency}: {irrigationResult.urgency}
                </span>
                {irrigationResult.recommendedWaterDepthMm && (
                  <span className="text-xs font-bold text-blue-800">
                    Depth: ~{irrigationResult.recommendedWaterDepthMm} mm
                  </span>
                )}
              </div>
              <p className="text-base font-bold mt-2">
                {irrigationResult.suggestedTiming}
              </p>
            </div>
          </div>

          {/* Reasoning & Weather Consideration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1.5 text-xs">
              <p className="font-bold text-stone-800 flex items-center space-x-1.5">
                <Droplets className="w-4 h-4 text-blue-600" />
                <span>{t.irrigationPage.reasoning}:</span>
              </p>
              <p className="text-stone-600 leading-relaxed font-medium">
                {irrigationResult.reasoning}
              </p>
            </div>

            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-1.5 text-xs">
              <p className="font-bold text-blue-900 flex items-center space-x-1.5">
                <CloudRain className="w-4 h-4 text-blue-600" />
                <span>{t.irrigationPage.weatherConsideration}:</span>
              </p>
              <p className="text-blue-950 leading-relaxed font-medium">
                {irrigationResult.weatherConsideration}
              </p>
            </div>
          </div>

          {/* Water Saving Guidelines */}
          {irrigationResult.waterSavingTips && irrigationResult.waterSavingTips.length > 0 && (
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
              <p className="font-bold text-stone-800 mb-2">
                {t.irrigationPage.waterSavingTips}:
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-stone-600">
                {irrigationResult.waterSavingTips.map((tip: string, i: number) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 text-[11px] text-stone-500">
            Model: FAO-56 Penman-Monteith Evapotranspiration (ETc) & Soil Water Balance
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-500 space-y-3">
          <Droplets className="w-12 h-12 text-stone-300 mx-auto" />
          <p className="text-sm font-bold text-stone-700">{t.irrigationPage.emptyPrompt}</p>
        </div>
      )}
    </div>
  );
};
