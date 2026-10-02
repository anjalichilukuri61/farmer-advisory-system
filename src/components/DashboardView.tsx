// src/components/DashboardView.tsx
import React from 'react';
import {
  Sprout,
  TrendingUp,
  FlaskConical,
  Droplets,
  Bug,
  Sun,
  FileText,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Check,
  Calendar,
} from 'lucide-react';
import { User, Farm, WeatherData } from '../types/index.js';
import { Language, translations } from '../i18n/translations.js';
import { VoiceButton } from './VoiceButton.js';

interface DashboardViewProps {
  user: User | null;
  farm: Farm | null;
  weather: WeatherData | null;
  lang: Language;
  onNavigate: (tab: 'crop' | 'yield' | 'fertilizer' | 'irrigation' | 'disease' | 'weather' | 'farms' | 'history') => void;
  onOpenUpload: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  farm,
  weather,
  lang,
  onNavigate,
  onOpenUpload,
}) => {
  const t = translations[lang];
  const profile = farm?.profile;
  const hasSoilReport = !!profile && profile.nitrogen !== undefined && profile.ph !== undefined;

  const getWelcomeSpeech = () => {
    const farmName = farm ? farm.name : 'మీ పొలం';
    const farmerName = user ? user.name : (lang === 'te' ? 'రైతు సోదరా' : 'Farmer');

    if (lang === 'te') {
      return `నమస్కారం ${farmerName}. ${farmName} వాతావరణం మరియు నేల పరీక్ష వివరాలు సిద్ధంగా ఉన్నాయి. క్రింది ఆరు వ్యవసాయ సాధనాలలో దేనినైనా ఎంచుకోండి: పంట సిఫార్సు, దిగుబడి అంచనా, ఎరువుల మోతాదు, నీటిపారుదల సలహా, తెగుళ్ల ప్రమాదం, లేదా వాతావరణ సమాచారం.`;
    }
    return `Welcome ${farmerName}. Live metrics for ${farmName} are synchronized. Select any of the six agricultural decision tools below: Crop Recommendation, Yield Prediction, Fertilizer Dosage, Irrigation Schedule, Disease Risk, or Weather and Alerts.`;
  };

  const getSoilSpeech = () => {
    if (hasSoilReport) {
      return lang === 'te'
        ? `నేల ప్రొఫైల్ స్థితి: నేల పరీక్ష నివేదిక అప్‌లోడ్ చేయబడింది మరియు విలువలు ధృవీకరించబడ్డాయి. నత్రజని ${profile?.nitrogen} కిలోలు, భాస్వరం ${profile?.phosphorus} కిలోలు, పొటాషియం ${profile?.potassium} కిలోలు, పి హెచ్ ${profile?.ph}.`
        : `Soil profile status: Soil report uploaded and values confirmed. Nitrogen is ${profile?.nitrogen} kg/ha, Phosphorus is ${profile?.phosphorus} kg/ha, Potassium is ${profile?.potassium} kg/ha, and pH is ${profile?.ph}.`;
    }
    return lang === 'te'
      ? 'నేల ప్రొఫైల్ స్థితి: నేల పరీక్ష నివేదిక ఇంకా అప్‌లోడ్ కాలేదు. దయచేసి నేల పరీక్ష నివేదికను అప్‌లోడ్ చేయండి.'
      : 'Soil profile status: Soil test report not uploaded yet. Click to upload your soil report.';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold border border-emerald-700/80">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              <span>{farm ? `${farm.name} • ${farm.location}` : 'AgriWise Farm Telemetry'}</span>
            </span>

            <VoiceButton
              id="dash_welcome_voice"
              textToSpeak={getWelcomeSpeech()}
              lang={lang}
              variant="compact"
              ariaLabel={lang === 'te' ? 'స్వాగత సందేశాన్ని వినండి' : 'Listen to welcome message'}
              className="bg-emerald-800/90 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/70"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t.dashboard.welcome}, {user ? user.name : (lang === 'te' ? 'రైతు సోదరా' : 'Farmer')} 👋
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-2 leading-relaxed opacity-95">
            {t.dashboard.welcomeSub}
          </p>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
          <Sprout className="w-72 h-72 text-emerald-100" />
        </div>
      </div>

      {/* SOIL REPORT STATUS CARD (As specified in requirement 14 & 15) */}
      <div className="bg-white rounded-3xl p-6 shadow-2xs border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-4">
          <div className="flex items-center space-x-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                hasSoilReport
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-stone-900">
                  {t.soilReport.statusCard}
                </h2>
                <VoiceButton
                  id="dash_soil_status_voice"
                  textToSpeak={getSoilSpeech()}
                  lang={lang}
                  variant="compact"
                  ariaLabel={lang === 'te' ? 'నేల స్థితిని వినండి' : 'Listen to soil status'}
                />
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {farm?.name || 'Selected Farm'}
              </p>
            </div>
          </div>

          {hasSoilReport ? (
            <button
              type="button"
              onClick={onOpenUpload}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto flex items-center space-x-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-stone-600" />
              <span>{t.soilReport.viewProfile}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenUpload}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto flex items-center space-x-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{t.soilReport.uploadReportNow}</span>
            </button>
          )}
        </div>

        {/* Status Body */}
        {hasSoilReport ? (
          <div className="pt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                <span>{lang === 'te' ? 'నివేదిక అప్‌లోడ్ చేయబడింది' : 'Report Uploaded'}</span>
              </span>

              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                <span>{lang === 'te' ? 'విలువలు ధృవీకరించబడ్డాయి' : 'Values Confirmed'}</span>
              </span>

              <span className="text-xs text-stone-500 font-medium inline-flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>{t.soilReport.lastUpdated}: {profile?.last_tested_date || 'Recently'}</span>
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-3 bg-stone-50 rounded-xl text-center border border-stone-200/80">
                <span className="text-[10px] text-stone-500 font-bold block">{t.fertilizerPage.nitrogen}</span>
                <span className="text-sm font-black text-stone-900">{profile?.nitrogen} kg/ha</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl text-center border border-stone-200/80">
                <span className="text-[10px] text-stone-500 font-bold block">{t.fertilizerPage.phosphorus}</span>
                <span className="text-sm font-black text-stone-900">{profile?.phosphorus} kg/ha</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl text-center border border-stone-200/80">
                <span className="text-[10px] text-stone-500 font-bold block">{t.fertilizerPage.potassium}</span>
                <span className="text-sm font-black text-stone-900">{profile?.potassium} kg/ha</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl text-center border border-stone-200/80">
                <span className="text-[10px] text-stone-500 font-bold block">{t.fertilizerPage.ph}</span>
                <span className="text-sm font-black text-stone-900">{profile?.ph} pH</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-4 flex items-center space-x-3 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p>
              {lang === 'te'
                ? 'మీ వద్ద సాయిల్ హెల్త్ కార్డ్ ఉన్నట్లయితే దానిని ఇక్కడ అప్‌లోడ్ చేయండి. చేతితో ఎంటర్ చేయకుండా వివరాలు స్వయంచాలకంగా పూరించబడతాయి.'
                : 'Upload your lab Soil Health Card once, and the extracted parameters will be reused across all six modules without re-entry.'}
            </p>
          </div>
        )}
      </div>

      {/* SIX AGRICULTURAL DECISION MODULES SHORTCUT CARDS (As explicitly required) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900">
            {t.dashboard.sixToolsTitle}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {t.dashboard.sixToolsSub}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Crop Recommendation */}
          <div
            onClick={() => onNavigate('crop')}
            className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform mb-3">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-stone-900 group-hover:text-emerald-800 transition-colors">
                {t.nav.crop}
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                {lang === 'te'
                  ? 'మీ నేల పోషకాలకు తగిన లాభదాయకమైన పంటల సిఫార్సు మరియు సంభావ్యత.'
                  : 'Calibrated probabilistic crop varieties tailored to your confirmed soil nutrients.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-900">
              <span>{t.dashboard.viewTool}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. Yield Prediction */}
          <div
            onClick={() => onNavigate('yield')}
            className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-teal-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 group-hover:scale-105 transition-transform mb-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-stone-900 group-hover:text-teal-800 transition-colors">
                {t.nav.yield}
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                {lang === 'te'
                  ? 'ఆశించిన హెక్టారు మరియు మొత్తం పొలం దిగుబడి మరియు 90% ఖచ్చితత్వ పరిధి.'
                  : 'Multivariable regression estimating tonnes/ha harvest potential and statistical bounds.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-teal-700 group-hover:text-teal-900">
              <span>{t.dashboard.viewTool}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Fertilizer Recommendation */}
          <div
            onClick={() => onNavigate('fertilizer')}
            className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform mb-3">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-stone-900 group-hover:text-amber-800 transition-colors">
                {t.nav.fertilizer}
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                {lang === 'te'
                  ? 'ఐసిఎఆర్ లోటు నివారణ సూత్రాల ప్రకారం యూరియా, డిఎపి, పొటాష్ మోతాదులు.'
                  : 'ICAR stoichiometric nutrient deficit schedule for Urea, DAP, MOP, and amendments.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:text-amber-900">
              <span>{t.dashboard.viewTool}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. Irrigation Recommendation */}
          <div
            onClick={() => onNavigate('irrigation')}
            className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform mb-3">
                <Droplets className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-stone-900 group-hover:text-blue-800 transition-colors">
                {t.nav.irrigation}
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                {lang === 'te'
                  ? 'నేల తేమ మరియు రాబోయే 48 గంటల వర్ష సూచన ఆధారంగా నీరు పెట్టే నిర్ణయం.'
                  : 'FAO-56 water balance checking soil depletion and 48h rainfall forecast.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-blue-700 group-hover:text-blue-900">
              <span>{t.dashboard.viewTool}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 5. Disease Risk */}
          <div
            onClick={() => onNavigate('disease')}
            className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-rose-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-100 group-hover:scale-105 transition-transform mb-3">
                <Bug className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-stone-900 group-hover:text-rose-800 transition-colors">
                {t.nav.disease}
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                {lang === 'te'
                  ? 'ఉష్ణోగ్రత, తేమ ఆధారంగా పైరు తెగుళ్ల వ్యాప్తి ప్రమాద తీవ్రత అంచనా.'
                  : 'Microclimatic foliar pathogen germination risk and IPM preventive advisories.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-rose-700 group-hover:text-rose-900">
              <span>{t.dashboard.viewTool}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 6. Weather & Alerts */}
          <div
            onClick={() => onNavigate('weather')}
            className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform mb-3">
                <Sun className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-stone-900 group-hover:text-amber-800 transition-colors">
                {t.nav.weather}
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                {lang === 'te'
                  ? 'మీ పొలం వద్ద ప్రత్యక్ష ఉష్ణోగ్రత, వర్షపాతం, గాలి వేగం మరియు 5 రోజుల సూచన.'
                  : 'Live satellite weather telemetry and dynamic agricultural hazard alerts.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:text-amber-900">
              <span>{t.dashboard.viewTool}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
