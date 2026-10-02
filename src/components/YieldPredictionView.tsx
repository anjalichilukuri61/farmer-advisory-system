// src/components/YieldPredictionView.tsx
import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart2, Info, AlertCircle, Sparkles, Sprout } from 'lucide-react';
import { Farm, WeatherData } from '../types/index.js';
import { Language, translations, getTranslatedCropName } from '../i18n/translations.js';
import { localizeText, localizeStatus } from '../i18n/localize.js';
import { ConfirmedSoilBanner } from './ConfirmedSoilBanner.js';
import { VoiceButton } from './VoiceButton.js';
import { api } from '../services/api.js';

interface YieldPredictionViewProps {
  farm: Farm | null;
  weather: WeatherData | null;
  lang: Language;
  onOpenUpload: () => void;
}

export const YieldPredictionView: React.FC<YieldPredictionViewProps> = ({
  farm,
  weather,
  lang,
  onOpenUpload,
}) => {
  const t = translations[lang];
  const profile = farm?.profile;

  const [selectedCrop, setSelectedCrop] = useState<string>('Rice');
  const [areaHectares, setAreaHectares] = useState<number>(farm?.area_hectares || 2.0);
  const [loading, setLoading] = useState<boolean>(false);
  const [yieldResult, setYieldResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateYield = async () => {
    if (!profile) {
      onOpenUpload();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.predictYield({
        farm_id: farm?.id,
        crop: selectedCrop,
        area_hectares: Number(areaHectares),
        nitrogen: profile.nitrogen ?? 78,
        phosphorus: profile.phosphorus ?? 45,
        potassium: profile.potassium ?? 42,
        ph: profile.ph ?? 6.6,
        temperature: weather?.current.temperature ?? 28,
        rainfall: (weather?.current.rainfallMm ?? 10) > 0 ? (weather?.current.rainfallMm ?? 10) * 10 : 120,
        soil_type: profile.soil_type || 'Clay Loam',
        irrigation_type: profile.irrigation_type || 'Drip',
      });

      setYieldResult(res.result);
    } catch (err: any) {
      setError(err.message || 'Failed to estimate yield.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && !yieldResult) {
      calculateYield();
    }
  }, [farm, selectedCrop]);

  const getSpokenText = () => {
    if (!yieldResult) return '';
    const cropName = getTranslatedCropName(yieldResult.cropName, lang);
    if (lang === 'te') {
      return `దిగుబడి అంచనా ఫలితం: ${cropName} పంటకు అంచనా వేసిన దిగుబడి హెక్టారుకు ${yieldResult.yieldPerHectare} టన్నులు. మీ ${areaHectares} హెక్టార్ల పొలంలో మొత్తం పంట దాదాపు ${yieldResult.totalEstimatedYield} టన్నులు వచ్చే అవకాశం ఉంది. 90 శాతం ఖచ్చితత్వ పరిధి హెక్టారుకు ${yieldResult.confidenceInterval90.minPerHectare} నుండి ${yieldResult.confidenceInterval90.maxPerHectare} టన్నులు.`;
    }
    return `Crop yield estimation: Predicted yield for ${yieldResult.cropName} is ${yieldResult.yieldPerHectare} tonnes per hectare. Expected total harvest for your ${areaHectares} hectare farm is ${yieldResult.totalEstimatedYield} tonnes. The 90 percent prediction interval is ${yieldResult.confidenceInterval90.minPerHectare} to ${yieldResult.confidenceInterval90.maxPerHectare} tonnes per hectare.`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0 border border-teal-200">
              <TrendingUp className="w-6 h-6 text-teal-700" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                  {t.yieldPage.title}
                </h1>
                {yieldResult && (
                  <VoiceButton
                    id="yield_title_voice"
                    textToSpeak={getSpokenText()}
                    lang={lang}
                    variant="compact"
                    ariaLabel={lang === 'te' ? 'దిగుబడిని వినండి' : 'Listen to yield estimation'}
                  />
                )}
              </div>
              <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
                {t.yieldPage.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Confirmed Soil Banner */}
        <div className="mt-4">
          <ConfirmedSoilBanner farm={farm} lang={lang} onOpenUpload={onOpenUpload} />
        </div>

        {/* Crop Selection & Area Control Bar */}
        <div className="mt-4 p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                {t.yieldPage.selectCrop}
              </label>
              <select
                value={selectedCrop}
                onChange={e => setSelectedCrop(e.target.value)}
                className="px-3.5 py-2 bg-white rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="Rice">{t.crops.rice || 'Rice (వరి)'}</option>
                <option value="Maize">{t.crops.maize || 'Maize (మొక్కజొన్న)'}</option>
                <option value="Cotton">{t.crops.cotton || 'Cotton (ప్రత్తి)'}</option>
                <option value="Wheat">{t.crops.wheat || 'Wheat (గోధుమ)'}</option>
                <option value="Pigeonpeas">{t.crops.pigeonpeas || 'Pigeonpeas (కందులు)'}</option>
                <option value="Coffee">{t.crops.coffee || 'Coffee (కాఫీ)'}</option>
                <option value="Banana">{t.crops.banana || 'Banana (అరటి)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                {t.yieldPage.areaLabel}
              </label>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={areaHectares}
                  onChange={e => setAreaHectares(Number(e.target.value))}
                  className="w-24 px-3 py-2 bg-white rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-xs text-stone-500 font-medium">
                  {lang === 'te' ? 'హెక్టార్లు' : 'ha'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={calculateYield}
            className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-teal-200" />
            <span>{loading ? t.yieldPage.calculating : t.yieldPage.btnCalculate}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Yield Results Display */}
      {yieldResult ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                {getTranslatedCropName(yieldResult.cropName, lang)} • {areaHectares} {t.common.hectares}
              </span>
              <h2 className="text-2xl font-black text-stone-900 mt-0.5">
                {t.yieldPage.yieldPerHectare}
              </h2>
            </div>

            <VoiceButton
              id="yield_card_voice"
              textToSpeak={getSpokenText()}
              lang={lang}
              variant="pill"
              className="bg-teal-700 hover:bg-teal-800 text-white"
            />
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-teal-50/70 rounded-2xl border border-teal-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                  {t.yieldPage.yieldPerHectare}
                </p>
                <p className="text-3xl sm:text-4xl font-black text-teal-950 mt-1">
                  {yieldResult.yieldPerHectare} <span className="text-sm font-normal text-teal-700">{t.yieldPage.tonnesPerHa}</span>
                </p>
              </div>
              <div className="p-3 bg-white rounded-2xl shadow-xs border border-teal-100">
                <TrendingUp className="w-8 h-8 text-teal-600" />
              </div>
            </div>

            <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  {t.yieldPage.totalFarmYield}
                </p>
                <p className="text-3xl sm:text-4xl font-black text-emerald-950 mt-1">
                  {yieldResult.totalEstimatedYield} <span className="text-sm font-normal text-emerald-700">{t.yieldPage.totalTonnes}</span>
                </p>
              </div>
              <div className="p-3 bg-white rounded-2xl shadow-xs border border-emerald-100">
                <BarChart2 className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* 90% Statistical Interval */}
          {yieldResult.confidenceInterval90 && (
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
              <span className="text-xs font-bold text-stone-700 block mb-1">
                {t.yieldPage.confidenceInterval}:
              </span>
              <p className="text-sm font-extrabold text-stone-900">
                {yieldResult.confidenceInterval90.minPerHectare} — {yieldResult.confidenceInterval90.maxPerHectare} {lang === 'te' ? 'టన్నులు / హెక్టారుకు' : 'tonnes / hectare'}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {lang === 'te'
                  ? `మొత్తం సాగు విస్తీర్ణంలో అంచనా: ${yieldResult.confidenceInterval90.minTotal} నుండి ${yieldResult.confidenceInterval90.maxTotal} టన్నులు`
                  : `Total parcel estimation: ${yieldResult.confidenceInterval90.minTotal} to ${yieldResult.confidenceInterval90.maxTotal} tonnes`}
              </p>
            </div>
          )}

          {/* Influencing Agronomic Factors */}
          {yieldResult.importantFactors && yieldResult.importantFactors.length > 0 && (
            <div>
              <p className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
                {t.yieldPage.influencingFactors}:
              </p>
              <div className="space-y-2">
                {yieldResult.importantFactors.map((factor: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 flex items-start space-x-2.5 text-xs"
                  >
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                        factor.impact === 'POSITIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : factor.impact === 'NEGATIVE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-200 text-stone-800'
                      }`}
                    >
                      {localizeStatus(factor.impact, lang)}
                    </span>
                    <div>
                      <span className="font-bold text-stone-900">{localizeText(factor.factor, lang)}: </span>
                      <span className="text-stone-600 leading-relaxed">{localizeText(factor.description, lang)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-stone-100 text-[11px] text-stone-500">
            {t.yieldPage.modelTelemetry}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-500 space-y-3">
          <TrendingUp className="w-12 h-12 text-stone-300 mx-auto" />
          <p className="text-sm font-bold text-stone-700">{t.yieldPage.emptyPrompt}</p>
        </div>
      )}
    </div>
  );
};
