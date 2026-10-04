// src/components/DiseaseRiskView.tsx
import React, { useState, useEffect } from 'react';
import { Bug, AlertTriangle, ShieldCheck, Sparkles, AlertCircle, Eye, Info } from 'lucide-react';
import { Farm, WeatherData } from '../types/index.js';
import { Language, translations, getTranslatedCropName } from '../i18n/translations.js';
import { VoiceButton } from './VoiceButton.js';
import { api } from '../services/api.js';

interface DiseaseRiskViewProps {
  farm: Farm | null;
  weather: WeatherData | null;
  lang: Language;
}

export const DiseaseRiskView: React.FC<DiseaseRiskViewProps> = ({
  farm,
  weather,
  lang,
}) => {
  const t = translations[lang];

  const [selectedCrop, setSelectedCrop] = useState<string>('Rice');
  const [loading, setLoading] = useState<boolean>(false);
  const [diseaseResult, setDiseaseResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const assessRisk = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.predictDisease({
        farm_id: farm?.id,
        crop: selectedCrop,
        temperature: weather?.current.temperature ?? 28,
        humidity: weather?.current.humidity ?? 75,
        rainfall: weather?.current.rainfallMm ?? 20,
      });

      setDiseaseResult(res.result);
    } catch (err: any) {
      setError(err.message || 'Failed to assess disease risk.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (farm?.profile) {
      assessRisk();
    } else {
      setDiseaseResult(null);
    }
  }, [farm?.profile, selectedCrop]);

  const getSpokenText = () => {
    if (!diseaseResult) return '';
    const cropName = getTranslatedCropName(diseaseResult.cropName, lang);
    const diseases = diseaseResult.potentialDiseases
      .map((d: any) => d.diseaseName)
      .join(', ');

    if (lang === 'te') {
      return `తెగుళ్ల ప్రమాద అంచనా: ${cropName} పంటకు ప్రస్తుత వాతావరణంలో తెగుళ్ల ప్రమాద స్థాయి ${diseaseResult.riskLevel}. తీవ్రత స్కోరు 100 కి ${diseaseResult.severityScore}. వచ్చే అవకాశమున్న తెగుళ్లు: ${diseases}. సిఫార్సు చేసిన సమగ్ర సస్యరక్షణ నివారణ చర్యలు: ${diseaseResult.recommendedPreventiveActions.join(', ')}.`;
    }
    return `Disease risk assessment: Pathogen risk level for ${diseaseResult.cropName} is ${diseaseResult.riskLevel} with a severity score of ${diseaseResult.severityScore} out of 100. Watchlist diseases include: ${diseases}. Recommended preventive steps: ${diseaseResult.recommendedPreventiveActions.join(', ')}.`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 border border-rose-200">
              <Bug className="w-6 h-6 text-rose-700" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                  {t.diseasePage.title}
                </h1>
                {diseaseResult && (
                  <VoiceButton
                    id="disease_title_voice"
                    textToSpeak={getSpokenText()}
                    lang={lang}
                    variant="compact"
                    ariaLabel={lang === 'te' ? 'తెగుళ్ల వివరాలను వినండి' : 'Listen to disease assessment'}
                  />
                )}
              </div>
              <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
                {t.diseasePage.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Crop Selection Bar */}
        <div className="mt-4 p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
              {t.diseasePage.targetCrop}
            </label>
            <select
              value={selectedCrop}
              onChange={e => setSelectedCrop(e.target.value)}
              className="px-3.5 py-2 bg-white rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer"
            >
              <option value="Rice">{t.crops.rice || 'Rice (వరి)'}</option>
              <option value="Maize">{t.crops.maize || 'Maize (మొక్కజొన్న)'}</option>
              <option value="Cotton">{t.crops.cotton || 'Cotton (ప్రత్తి)'}</option>
              <option value="Wheat">{t.crops.wheat || 'Wheat (గోధుమ)'}</option>
              <option value="Coffee">{t.crops.coffee || 'Coffee (కాఫీ)'}</option>
              <option value="Banana">{t.crops.banana || 'Banana (అరటి)'}</option>
            </select>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={assessRisk}
            className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-rose-200" />
            <span>{loading ? t.diseasePage.calculating : t.diseasePage.btnCalculate}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Disease Risk Result */}
      {diseaseResult ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                {getTranslatedCropName(diseaseResult.cropName, lang)} • {t.diseasePage.riskLevel}
              </span>
              <h2 className="text-2xl font-black text-stone-900 mt-0.5">
                {diseaseResult.riskLevel} RISK
              </h2>
            </div>

            <VoiceButton
              id="disease_card_voice"
              textToSpeak={getSpokenText()}
              lang={lang}
              variant="pill"
              className="bg-rose-700 hover:bg-rose-800 text-white"
            />
          </div>

          {/* Severity Banner */}
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              diseaseResult.riskLevel === 'HIGH'
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : diseaseResult.riskLevel === 'MEDIUM'
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}
          >
            <div>
              <span className="text-xs font-bold uppercase tracking-wider">
                {t.diseasePage.severityScore}
              </span>
              <p className="text-3xl font-black mt-1">
                {diseaseResult.severityScore} <span className="text-sm font-normal">/ 100</span>
              </p>
              <p className="text-xs mt-1 font-medium opacity-90">
                Ambient microclimatic conditions: {weather?.current.temperature ?? 28}°C, {weather?.current.humidity ?? 75}% humidity
              </p>
            </div>
            <div className="text-3xl">
              {diseaseResult.riskLevel === 'HIGH' ? '⚠️' : diseaseResult.riskLevel === 'MEDIUM' ? '⚡' : '🛡️'}
            </div>
          </div>

          {/* Watchlist Pathogens */}
          {diseaseResult.potentialDiseases && diseaseResult.potentialDiseases.length > 0 && (
            <div>
              <p className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
                {t.diseasePage.watchlistDiseases}:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {diseaseResult.potentialDiseases.map((d: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-sm text-stone-900">{d.diseaseName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-200 text-stone-800">
                        {d.pathogenType}
                      </span>
                    </div>
                    <p className="text-stone-700">
                      <span className="font-bold">{t.diseasePage.earlySymptoms}: </span>
                      {d.earlySymptomsToMonitor}
                    </p>
                    <p className="text-[11px] text-stone-500">{d.favorableConditions}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* IPM Preventive Steps */}
          {diseaseResult.recommendedPreventiveActions && diseaseResult.recommendedPreventiveActions.length > 0 && (
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
              <p className="font-bold text-stone-800 mb-2">
                {t.diseasePage.preventiveSteps}:
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-stone-600">
                {diseaseResult.recommendedPreventiveActions.map((step: string, i: number) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Scientific Disclaimer */}
          <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-[11px] text-stone-600 flex items-start space-x-2">
            <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
            <p>{t.diseasePage.scientificNotice}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-500 space-y-3">
          <Bug className="w-12 h-12 text-stone-300 mx-auto" />
          <p className="text-sm font-bold text-stone-700">{t.diseasePage.emptyPrompt}</p>
        </div>
      )}
    </div>
  );
};
