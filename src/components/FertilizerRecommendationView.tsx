// src/components/FertilizerRecommendationView.tsx
import React, { useState, useEffect } from 'react';
import { FlaskConical, ShieldCheck, AlertCircle, Sparkles, CheckCircle2, Info } from 'lucide-react';
import { Farm } from '../types/index.js';
import { Language, translations, getTranslatedCropName } from '../i18n/translations.js';
import { ConfirmedSoilBanner } from './ConfirmedSoilBanner.js';
import { VoiceButton } from './VoiceButton.js';
import { api } from '../services/api.js';

interface FertilizerRecommendationViewProps {
  farm: Farm | null;
  lang: Language;
  onOpenUpload: () => void;
}

export const FertilizerRecommendationView: React.FC<FertilizerRecommendationViewProps> = ({
  farm,
  lang,
  onOpenUpload,
}) => {
  const t = translations[lang];
  const profile = farm?.profile;

  const [selectedCrop, setSelectedCrop] = useState<string>('Rice');
  const [loading, setLoading] = useState<boolean>(false);
  const [fertilizerResult, setFertilizerResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateFertilizer = async () => {
    if (!profile) {
      onOpenUpload();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.predictFertilizer({
        farm_id: farm?.id,
        crop: selectedCrop,
        nitrogen: profile.nitrogen ?? 78,
        phosphorus: profile.phosphorus ?? 45,
        potassium: profile.potassium ?? 42,
        ph: profile.ph ?? 6.6,
        area_hectares: farm?.area_hectares || 2.0,
      });

      setFertilizerResult(res.result);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate fertilizer recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      calculateFertilizer();
    } else {
      setFertilizerResult(null);
    }
  }, [profile, selectedCrop]);

  const getSpokenText = () => {
    if (!fertilizerResult) return '';
    const doses = fertilizerResult.recommendedFertilizers
      .map((f: any) => `${f.fertilizerName}: ${f.quantityPerHectareKg} kg/ha`)
      .join(', ');

    if (lang === 'te') {
      return `ఎరువుల సిఫార్సు: మీ నేలలో నత్రజని ${fertilizerResult.soilHealthStatus.nitrogenStatus}, భాస్వరం ${fertilizerResult.soilHealthStatus.phosphorusStatus}, పొటాషియం ${fertilizerResult.soilHealthStatus.potassiumStatus}. సిఫార్సు చేసిన ఎరువుల మోతాదులు: ${doses}. రసాయన ఎరువులు వాడే ముందు వ్యవసాయ నిపుణులను సంప్రదించండి.`;
    }
    return `Fertilizer advisory: Soil nitrogen is ${fertilizerResult.soilHealthStatus.nitrogenStatus}, phosphorus is ${fertilizerResult.soilHealthStatus.phosphorusStatus}, and potassium is ${fertilizerResult.soilHealthStatus.potassiumStatus}. Prescribed fertilizers: ${doses}. Safety notice: Always verify dosages with your local agricultural officer.`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
              <FlaskConical className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                  {t.fertilizerPage.title}
                </h1>
                {fertilizerResult && (
                  <VoiceButton
                    id="fertilizer_title_voice"
                    textToSpeak={getSpokenText()}
                    lang={lang}
                    variant="compact"
                    ariaLabel={lang === 'te' ? 'ఎరువుల సలహాను వినండి' : 'Listen to fertilizer advisory'}
                  />
                )}
              </div>
              <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
                {t.fertilizerPage.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Confirmed Soil Banner */}
        <div className="mt-4">
          <ConfirmedSoilBanner farm={farm} lang={lang} onOpenUpload={onOpenUpload} />
        </div>

        {/* Crop Selection Bar */}
        <div className="mt-4 p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
              {t.fertilizerPage.targetCrop}
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
            </select>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={calculateFertilizer}
            className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>{loading ? t.fertilizerPage.calculating : t.fertilizerPage.btnCalculate}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Display */}
      {fertilizerResult ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                {getTranslatedCropName(fertilizerResult.cropName, lang)} • {t.fertilizerPage.nutrientStatus}
              </span>
              <h2 className="text-2xl font-black text-stone-900 mt-0.5">
                {t.fertilizerPage.prescriptions}
              </h2>
            </div>

            <VoiceButton
              id="fert_card_voice"
              textToSpeak={getSpokenText()}
              lang={lang}
              variant="pill"
              className="bg-amber-700 hover:bg-amber-800 text-white"
            />
          </div>

          {/* Macronutrient Health Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] text-stone-500 font-bold block">{t.fertilizerPage.nitrogen}</span>
              <span
                className={`text-xs font-black block mt-0.5 ${
                  fertilizerResult.soilHealthStatus.nitrogenStatus === 'DEFICIENT'
                    ? 'text-red-700'
                    : 'text-emerald-700'
                }`}
              >
                {fertilizerResult.soilHealthStatus.nitrogenStatus}
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] text-stone-500 font-bold block">{t.fertilizerPage.phosphorus}</span>
              <span
                className={`text-xs font-black block mt-0.5 ${
                  fertilizerResult.soilHealthStatus.phosphorusStatus === 'DEFICIENT'
                    ? 'text-red-700'
                    : 'text-emerald-700'
                }`}
              >
                {fertilizerResult.soilHealthStatus.phosphorusStatus}
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] text-stone-500 font-bold block">{t.fertilizerPage.potassium}</span>
              <span
                className={`text-xs font-black block mt-0.5 ${
                  fertilizerResult.soilHealthStatus.potassiumStatus === 'DEFICIENT'
                    ? 'text-red-700'
                    : 'text-emerald-700'
                }`}
              >
                {fertilizerResult.soilHealthStatus.potassiumStatus}
              </span>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] text-stone-500 font-bold block">{t.fertilizerPage.ph}</span>
              <span className="text-xs font-black text-stone-900 block mt-0.5">
                {fertilizerResult.soilHealthStatus.phAssessment}
              </span>
            </div>
          </div>

          {/* Prescribed Fertilizers List */}
          <div className="space-y-3">
            {fertilizerResult.recommendedFertilizers.map((p: any, idx: number) => (
              <div
                key={idx}
                className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200 text-xs space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-extrabold text-sm text-stone-900">{p.fertilizerName}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg">
                      {p.quantityPerHectareKg} kg/ha
                    </span>
                    <span className="font-bold text-stone-700 bg-stone-200 px-2.5 py-1 rounded-lg">
                      {p.totalQuantityKg} kg total
                    </span>
                  </div>
                </div>
                <p className="text-stone-700 font-medium">
                  <span className="font-bold">{t.fertilizerPage.applicationTiming}: </span>
                  {p.applicationTiming}
                </p>
                <p className="text-[11px] text-stone-500">{p.reason}</p>
              </div>
            ))}
          </div>

          {/* Soil Amendments */}
          {fertilizerResult.soilAmendments && fertilizerResult.soilAmendments.length > 0 && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950">
              <p className="font-bold mb-1">{t.fertilizerPage.soilAmendments}:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {fertilizerResult.soilAmendments.map((a: string, i: number) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Transparent Rule Notice & Prominent Safety Disclaimer */}
          <div className="space-y-2 pt-2">
            <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-[11px] text-stone-600 flex items-start space-x-2">
              <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <p>{t.fertilizerPage.ruleNotice}</p>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-950 flex items-start space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{t.fertilizerPage.safetyNotice}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-500 space-y-3">
          <FlaskConical className="w-12 h-12 text-stone-300 mx-auto" />
          <p className="text-sm font-bold text-stone-700">{t.fertilizerPage.emptyPrompt}</p>
        </div>
      )}
    </div>
  );
};
