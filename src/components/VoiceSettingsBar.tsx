// src/components/VoiceSettingsBar.tsx
import React, { useState } from 'react';
import { Volume2, VolumeX, Settings2, Gauge, Square } from 'lucide-react';
import { useTTS } from '../context/TTSContext.js';
import { Language, translations } from '../i18n/translations.js';

interface VoiceSettingsBarProps {
  lang: Language;
}

export const VoiceSettingsBar: React.FC<VoiceSettingsBarProps> = ({ lang }) => {
  const { voiceEnabled, setVoiceEnabled, voiceSpeed, setVoiceSpeed, activeId, stop } = useTTS();
  const t = translations[lang].voice;
  const [showSpeedControls, setShowSpeedControls] = useState<boolean>(false);

  return (
    <div className="bg-emerald-950/80 text-emerald-100 border-b border-emerald-800/60 px-4 py-1.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Status & Toggle */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-semibold">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{t.voiceSettings}:</span>
          </div>

          {/* ON / OFF Switch */}
          <button
            type="button"
            onClick={() => {
              if (voiceEnabled) stop();
              setVoiceEnabled(!voiceEnabled);
            }}
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              voiceEnabled
                ? 'bg-emerald-500 text-emerald-950 shadow-xs'
                : 'bg-stone-700 text-stone-300'
            }`}
          >
            {voiceEnabled ? t.voiceOn : t.voiceOff}
          </button>

          {/* Active Speaking Indicator */}
          {activeId && (
            <div className="flex items-center space-x-2 bg-rose-900/90 text-rose-100 px-2.5 py-0.5 rounded-full text-[11px] font-bold animate-pulse border border-rose-700">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <span>{t.nowPlaying}</span>
              <button
                type="button"
                onClick={stop}
                className="ml-1 bg-white/20 hover:bg-white/30 rounded px-1.5 py-0.2 text-[10px] uppercase font-bold"
              >
                {t.stop}
              </button>
            </div>
          )}
        </div>

        {/* Right: Speed Controls */}
        {voiceEnabled && (
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-emerald-300 font-medium hidden md:inline">{t.speed}:</span>
            <div className="inline-flex rounded-lg bg-emerald-900/90 p-0.5 border border-emerald-700/60">
              <button
                type="button"
                onClick={() => setVoiceSpeed('slow')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                  voiceSpeed === 'slow'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-300 hover:text-white'
                }`}
                title="Slow speech for easier listening"
              >
                {t.speedSlow}
              </button>
              <button
                type="button"
                onClick={() => setVoiceSpeed('normal')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                  voiceSpeed === 'normal'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-300 hover:text-white'
                }`}
                title="Normal speech rate"
              >
                {t.speedNormal}
              </button>
              <button
                type="button"
                onClick={() => setVoiceSpeed('fast')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                  voiceSpeed === 'fast'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-300 hover:text-white'
                }`}
                title="Fast speech rate"
              >
                {t.speedFast}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
