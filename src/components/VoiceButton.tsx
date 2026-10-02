// src/components/VoiceButton.tsx
import React from 'react';
import { Volume2, Square, RotateCcw } from 'lucide-react';
import { useTTS } from '../context/TTSContext.js';
import { Language, translations } from '../i18n/translations.js';

export interface VoiceButtonProps {
  id: string;
  textToSpeak: string;
  lang: Language;
  ariaLabel?: string;
  variant?: 'pill' | 'inline' | 'compact' | 'subtle';
  className?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  id,
  textToSpeak,
  lang,
  ariaLabel,
  variant = 'pill',
  className = '',
}) => {
  const { activeId, playedIds, voiceEnabled, speak, stop } = useTTS();
  const t = translations[lang].voice;

  if (!voiceEnabled) return null;

  const isPlaying = activeId === id;
  const hasPlayed = playedIds.has(id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stop();
    } else {
      speak(id, textToSpeak, lang);
    }
  };

  const getLabel = () => {
    if (isPlaying) return t.stop;
    if (hasPlayed) return t.replay;
    return t.listen;
  };

  const getAriaLabel = () => {
    if (isPlaying) return t.ariaStop;
    if (hasPlayed) return t.ariaReplay;
    return ariaLabel || t.ariaListen;
  };

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={getAriaLabel()}
        title={getLabel()}
        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer select-none ${
          isPlaying
            ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse ring-2 ring-rose-400/40'
            : hasPlayed
            ? 'bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900 border border-stone-200'
            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
        } ${className}`}
      >
        {isPlaying ? (
          <Square className="w-3 h-3 fill-rose-700 text-rose-700 shrink-0" />
        ) : hasPlayed ? (
          <RotateCcw className="w-3 h-3 text-emerald-700 shrink-0" />
        ) : (
          <Volume2 className="w-3 h-3 text-emerald-700 shrink-0" />
        )}
        <span className="truncate">{getLabel()}</span>
      </button>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={getAriaLabel()}
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none shadow-2xs ${
          isPlaying
            ? 'bg-rose-600 text-white shadow-md animate-pulse ring-2 ring-rose-400'
            : hasPlayed
            ? 'bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900 border border-stone-300'
            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
        } ${className}`}
      >
        {isPlaying ? (
          <Square className="w-3.5 h-3.5 fill-white text-white shrink-0" />
        ) : hasPlayed ? (
          <RotateCcw className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
        )}
        <span>{getLabel()}</span>
      </button>
    );
  }

  if (variant === 'subtle') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={getAriaLabel()}
        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-semibold text-stone-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer select-none ${
          isPlaying ? 'text-rose-600 font-bold bg-rose-50 ring-1 ring-rose-300' : ''
        } ${className}`}
      >
        {isPlaying ? (
          <Square className="w-3.5 h-3.5 fill-rose-600 text-rose-600 shrink-0" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
        )}
        <span>{getLabel()}</span>
      </button>
    );
  }

  // Default 'pill' variant: high contrast, large tap target for farmers
  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={getAriaLabel()}
      className={`inline-flex items-center justify-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer select-none ${
        isPlaying
          ? 'bg-rose-600 text-white ring-4 ring-rose-200 shadow-md animate-pulse'
          : hasPlayed
          ? 'bg-white hover:bg-emerald-50 text-stone-800 hover:text-emerald-900 border border-stone-300 hover:border-emerald-400'
          : 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white hover:shadow'
      } ${className}`}
    >
      {isPlaying ? (
        <>
          <Square className="w-3.5 h-3.5 fill-white text-white shrink-0" />
          <span>{t.stop}</span>
        </>
      ) : hasPlayed ? (
        <>
          <RotateCcw className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>{t.replay}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
          <span>{t.listen}</span>
        </>
      )}
    </button>
  );
};
