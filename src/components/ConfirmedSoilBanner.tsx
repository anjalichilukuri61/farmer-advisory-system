// src/components/ConfirmedSoilBanner.tsx
import React from 'react';
import { Farm } from '../types/index.js';
import { Language, translations } from '../i18n/translations.js';
import { FileText, CheckCircle2, AlertTriangle, UploadCloud } from 'lucide-react';
import { VoiceButton } from './VoiceButton.js';

interface ConfirmedSoilBannerProps {
  farm: Farm | null;
  lang: Language;
  onOpenUpload: () => void;
}

export const ConfirmedSoilBanner: React.FC<ConfirmedSoilBannerProps> = ({ farm, lang, onOpenUpload }) => {
  const t = translations[lang];
  const profile = farm?.profile;
  const hasProfile = !!profile && profile.nitrogen !== undefined && profile.ph !== undefined;

  const getSoilSpeech = () => {
    if (!profile) {
      return lang === 'te'
        ? 'ఈ పొలానికి నేల పరీక్ష నివేదిక ఇంకా అప్‌లోడ్ చేయలేదు. దయచేసి నేల పరీక్ష నివేదికను అప్‌లోడ్ చేయండి.'
        : 'Soil test report has not been uploaded for this farm. Please upload a soil report.';
    }
    if (lang === 'te') {
      return `ధృవీకరించబడిన నేల వివరాలు: నత్రజని ${profile.nitrogen} కిలోలు ప్రతి హెక్టారుకు, భాస్వరం ${profile.phosphorus} కిలోలు, పొటాషియం ${profile.potassium} కిలోలు, పి హెచ్ ${profile.ph}, నేల రకం ${profile.soil_type}. చివరి పరీక్ష తేది ${profile.last_tested_date || 'ఇటీవల'}.`;
    }
    return `Confirmed soil profile: Nitrogen is ${profile.nitrogen} kg/ha, Phosphorus is ${profile.phosphorus} kg/ha, Potassium is ${profile.potassium} kg/ha, pH is ${profile.ph}, Soil texture is ${profile.soil_type}. Verified from Soil Health Card on ${profile.last_tested_date || 'recently'}.`;
  };

  if (!hasProfile) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 bg-amber-100 rounded-xl text-amber-800 shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-amber-950">
                {t.soilReport.reportNotUploaded}
              </h4>
              <VoiceButton
                id="soil_missing_banner_voice"
                textToSpeak={getSoilSpeech()}
                lang={lang}
                variant="compact"
              />
            </div>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              {lang === 'te'
                ? 'నేల పరీక్ష నివేదికను అప్‌లోడ్ చేయడం ద్వారా నత్రజని, భాస్వరం, పొటాషియం విలువలు స్వయంచాలకంగా పూరించబడతాయి.'
                : 'Upload your agricultural Soil Health Card to automatically populate N-P-K, pH, and soil texture without manual typing.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenUpload}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>{t.soilReport.uploadReportNow}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 mb-6 shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700 shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center space-x-1">
                <FileText className="w-3 h-3" />
                <span>{t.soilReport.reportUploadedConfirmed}</span>
              </span>
              <span className="text-xs text-stone-500 font-medium">
                • {farm?.name || 'Farm'}
              </span>
              <VoiceButton
                id="confirmed_soil_banner_voice"
                textToSpeak={getSoilSpeech()}
                lang={lang}
                variant="compact"
                ariaLabel={lang === 'te' ? 'నేల వివరాలను వినండి' : 'Listen to soil profile'}
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              {t.soilReport.lastUpdated}: {profile.last_tested_date || 'Recently'} • {profile.soil_type}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenUpload}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors self-start md:self-auto cursor-pointer"
        >
          {t.soilReport.viewProfile}
        </button>
      </div>

      {/* Confirmed Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-3">
        <div className="p-2 bg-stone-50 rounded-lg text-center border border-stone-200/70">
          <span className="text-[10px] text-stone-500 font-bold block">{t.fertilizerPage.nitrogen}</span>
          <span className="text-sm font-black text-stone-900">{profile.nitrogen}</span>
          <span className="text-[10px] text-stone-500 block">kg/ha</span>
        </div>

        <div className="p-2 bg-stone-50 rounded-lg text-center border border-stone-200/70">
          <span className="text-[10px] text-stone-500 font-bold block">{t.fertilizerPage.phosphorus}</span>
          <span className="text-sm font-black text-stone-900">{profile.phosphorus}</span>
          <span className="text-[10px] text-stone-500 block">kg/ha</span>
        </div>

        <div className="p-2 bg-stone-50 rounded-lg text-center border border-stone-200/70">
          <span className="text-[10px] text-stone-500 font-bold block">{t.fertilizerPage.potassium}</span>
          <span className="text-sm font-black text-stone-900">{profile.potassium}</span>
          <span className="text-[10px] text-stone-500 block">kg/ha</span>
        </div>

        <div className="p-2 bg-stone-50 rounded-lg text-center border border-stone-200/70">
          <span className="text-[10px] text-stone-500 font-bold block">{t.fertilizerPage.ph}</span>
          <span className="text-sm font-black text-stone-900">{profile.ph}</span>
          <span className="text-[10px] text-stone-500 block">pH Reaction</span>
        </div>

        <div className="p-2 bg-stone-50 rounded-lg text-center border border-stone-200/70">
          <span className="text-[10px] text-stone-500 font-bold block">
            {lang === 'te' ? 'నేల రకం' : 'Soil Texture'}
          </span>
          <span className="text-xs font-black text-stone-900 truncate block mt-0.5" title={profile.soil_type}>
            {profile.soil_type}
          </span>
        </div>

        <div className="p-2 bg-stone-50 rounded-lg text-center border border-stone-200/70">
          <span className="text-[10px] text-stone-500 font-bold block">
            {lang === 'te' ? 'నేల తేమ' : 'Soil Moisture'}
          </span>
          <span className="text-sm font-black text-stone-900">{profile.soil_moisture ?? 40}%</span>
          <span className="text-[10px] text-stone-500 block">Sensor / Lab</span>
        </div>
      </div>
    </div>
  );
};
