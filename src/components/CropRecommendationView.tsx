// src/components/CropRecommendationView.tsx
import React, { useState, useEffect } from 'react';
import { Sprout, HelpCircle, CheckCircle2, ChevronDown, ChevronUp, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Farm, WeatherData } from '../types/index.js';
import { Language, translations, getTranslatedCropName } from '../i18n/translations.js';
import { localizeText, localizeStatus } from '../i18n/localize.js';
import { ConfirmedSoilBanner } from './ConfirmedSoilBanner.js';
import { VoiceButton } from './VoiceButton.js';
import { api } from '../services/api.js';

interface CropRecommendationViewProps {
  farm: Farm | null;
  weather: WeatherData | null;
  lang: Language;
  onOpenUpload: () => void;
}

export const CropRecommendationView: React.FC<CropRecommendationViewProps> = ({
  farm,
  weather,
  lang,
  onOpenUpload,
}) => {
  const t = translations[lang];
  const profile = farm?.profile;

  const [loading, setLoading] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [explanation, setExplanation] = useState<any>(null);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (!profile) {
      onOpenUpload();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        farm_id: farm?.id,
        nitrogen: profile.nitrogen ?? 78,
        phosphorus: profile.phosphorus ?? 45,
        potassium: profile.potassium ?? 42,
        ph: profile.ph ?? 6.6,
        temperature: weather?.current.temperature ?? 28,
        humidity: weather?.current.humidity ?? 65,
        rainfall: (weather?.current.rainfallMm ?? 10) > 0 ? (weather?.current.rainfallMm ?? 10) * 10 : 120,
      };
      console.log('Crop Prediction Payload:', payload);
      const res = await api.predictCrop(payload);

      setRecommendation(res.result);
      setExplanation(res.explanation);
    } catch (err: any) {
      setError(`Crop prediction could not be generated.\n\nReason: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Run automatically when profile changes (e.g. after a new soil report upload)
  useEffect(() => {
    if (profile) {
      runAnalysis();
    } else {
      setRecommendation(null);
      setExplanation(null);
    }
  }, [profile]);

  const getSpokenText = () => {
    if (!recommendation) return '';
    const primaryName = getTranslatedCropName(recommendation.primaryCrop.cropName, lang);
    const altNames = recommendation.alternativeCrops
      ? recommendation.alternativeCrops.map((a: any) => getTranslatedCropName(a.cropName, lang)).join(', ')
      : '';

    if (lang === 'te') {
      const teFactors = recommendation.primaryCrop.keyFactors.map((f: string) => localizeText(f, 'te')).join(', ');
      return `పంట సిఫార్సు ఫలితం: మీ నేల పోషకాలు మరియు ప్రస్తుత వాతావరణ పరిస్థితుల ఆధారంగా అత్యంత అనుకూలమైన పంట ${primaryName}. అనుకూలత సంభావ్యత ${recommendation.primaryCrop.percentageString}. ముఖ్య అనుకూల అంశాలు: ${teFactors}. ఇతర ప్రత్యామ్నాయ పంటలు: ${altNames || 'లేవు'}.`;
    }
    return `Crop recommendation result: Based on your confirmed soil and microclimate, the model recommends ${recommendation.primaryCrop.cropName} with a calibrated suitability likelihood of ${recommendation.primaryCrop.percentageString}. Key compatible factors include: ${recommendation.primaryCrop.keyFactors.join(', ')}. Alternative viable crops: ${altNames || 'None'}.`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title & Subtitle */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
              <Sprout className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
                  {t.cropPage.title}
                </h1>
                {recommendation && (
                  <VoiceButton
                    id="crop_rec_title_voice"
                    textToSpeak={getSpokenText()}
                    lang={lang}
                    variant="compact"
                    ariaLabel={lang === 'te' ? 'సిఫార్సును వినండి' : 'Listen to recommendation'}
                  />
                )}
              </div>
              <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
                {t.cropPage.subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={runAnalysis}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>{loading ? t.cropPage.calculating : t.cropPage.btnCalculate}</span>
          </button>
        </div>

        {/* Confirmed Soil Banner */}
        <div className="mt-4">
          <ConfirmedSoilBanner farm={farm} lang={lang} onOpenUpload={onOpenUpload} />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Crop Card */}
      {recommendation ? (
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
                  <Sprout className="w-9 h-9 text-emerald-300" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold block">
                    {t.cropPage.recommendedCrop}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white mt-0.5">
                    {getTranslatedCropName(recommendation.primaryCrop.cropName, lang)}
                  </h2>
                </div>
              </div>

              <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-xs px-5 py-3 rounded-2xl border border-white/20">
                <div className="text-right">
                  <span className="text-[11px] text-emerald-200 block font-semibold">
                    {t.cropPage.calibratedConfidence}
                  </span>
                  <span className="text-3xl font-black text-emerald-300">
                    {recommendation.primaryCrop.percentageString}
                  </span>
                </div>
                <VoiceButton
                  id="crop_card_voice"
                  textToSpeak={getSpokenText()}
                  lang={lang}
                  variant="pill"
                  className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold border-0"
                />
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Key Compatibility Factors */}
            <div>
              <p className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
                {t.cropPage.keyFactors}:
              </p>
              <div className="flex flex-wrap gap-2">
                {recommendation.primaryCrop.keyFactors.map((f: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{localizeText(f, lang)}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Alternative Crops */}
            {recommendation.alternativeCrops && recommendation.alternativeCrops.length > 0 && (
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200">
                <p className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
                  {t.cropPage.alternatives}:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recommendation.alternativeCrops.map((alt: any) => (
                    <div
                      key={alt.cropKey}
                      className="bg-white p-3.5 rounded-xl border border-stone-200 flex justify-between items-center shadow-2xs"
                    >
                      <div>
                        <p className="text-sm font-bold text-stone-900">
                          {getTranslatedCropName(alt.cropName, lang)}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          {localizeStatus(alt.suitability, lang)} {t.cropPage.suitability}
                        </p>
                      </div>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                        {alt.percentageString}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explainability Accordion */}
            {explanation && (
              <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="px-5 py-4 bg-stone-100/70 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-emerald-700" />
                    <span className="text-sm font-bold text-stone-900">
                      {t.cropPage.whyThisCrop}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="p-1 text-stone-500 hover:text-stone-800 cursor-pointer"
                  >
                    {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {showBreakdown && (
                  <div className="p-5 bg-white border-t border-stone-200 space-y-4">
                    <p className="text-xs text-stone-700 font-medium leading-relaxed">
                      {localizeText(explanation.headline, lang)}
                    </p>

                    {/* Breakdown Table */}
                    {explanation.factorBreakdown && (
                      <div className="overflow-x-auto rounded-xl border border-stone-200">
                        <table className="min-w-full text-xs divide-y divide-stone-200">
                          <thead className="bg-stone-50 text-stone-600 font-bold">
                            <tr>
                              <th className="px-3.5 py-2.5 text-left">{t.cropPage.parameterCol}</th>
                              <th className="px-3.5 py-2.5 text-left">{t.cropPage.yourValueCol}</th>
                              <th className="px-3.5 py-2.5 text-left">{t.cropPage.optimalRangeCol}</th>
                              <th className="px-3.5 py-2.5 text-left">{t.cropPage.statusCol}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100 text-stone-800">
                            {explanation.factorBreakdown.map((f: any, idx: number) => (
                              <tr key={idx} className="hover:bg-stone-50/50">
                                <td className="px-3.5 py-2.5 font-semibold">{localizeText(f.factor, lang)}</td>
                                <td className="px-3.5 py-2.5 font-black text-stone-900">{f.actualValue}</td>
                                <td className="px-3.5 py-2.5 text-stone-600">{f.idealRange}</td>
                                <td className="px-3.5 py-2.5">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      f.status === 'OPTIMAL'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : f.status === 'FAVORABLE'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {localizeStatus(f.status, lang)}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-500 space-y-3">
          <Sprout className="w-12 h-12 text-stone-300 mx-auto" />
          <p className="text-sm font-bold text-stone-700">{t.cropPage.emptyPrompt}</p>
        </div>
      )}
    </div>
  );
};
