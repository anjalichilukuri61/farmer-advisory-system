// src/context/TTSContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tts, VoiceSpeed } from '../services/ttsService.js';
import { Language, translations } from '../i18n/translations.js';

interface TTSContextType {
  activeId: string | null;
  voiceEnabled: boolean;
  voiceSpeed: VoiceSpeed;
  playedIds: Set<string>;
  voiceWarning: string | null;
  dismissVoiceWarning: () => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setVoiceSpeed: (speed: VoiceSpeed) => void;
  speak: (id: string, text: string, lang: Language) => void;
  stop: () => void;
}

const TTSContext = createContext<TTSContextType | undefined>(undefined);

export const TTSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [voiceSpeed, setVoiceSpeed] = useState<VoiceSpeed>('normal');
  const [playedIds, setPlayedIds] = useState<Set<string>>(new Set());
  const [voiceWarning, setVoiceWarning] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = tts.subscribe(id => {
      setActiveId(id);
    });
    return () => {
      unsubscribe();
      tts.stop();
    };
  }, []);

  const stop = useCallback(() => {
    tts.stop();
  }, []);

  const dismissVoiceWarning = useCallback(() => {
    setVoiceWarning(null);
  }, []);

  const speak = useCallback(
    (id: string, text: string, lang: Language) => {
      if (!voiceEnabled) return;

      // If already playing this item, clicking acts as Stop toggle
      if (activeId === id) {
        tts.stop();
        return;
      }

      tts.speak({
        id,
        text,
        lang,
        speed: voiceSpeed,
        onStart: () => {
          setActiveId(id);
        },
        onEnd: () => {
          setActiveId(null);
          setPlayedIds(prev => new Set(prev).add(id));
        },
        onError: () => {
          setActiveId(null);
        },
        onVoiceUnavailable: (message: string) => {
          setVoiceWarning(message);
          setTimeout(() => setVoiceWarning(null), 7000);
        },
      });
    },
    [activeId, voiceEnabled, voiceSpeed]
  );

  return (
    <TTSContext.Provider
      value={{
        activeId,
        voiceEnabled,
        voiceSpeed,
        playedIds,
        voiceWarning,
        dismissVoiceWarning,
        setVoiceEnabled,
        setVoiceSpeed,
        speak,
        stop,
      }}
    >
      {children}
    </TTSContext.Provider>
  );
};

export function useTTS(): TTSContextType {
  const context = useContext(TTSContext);
  if (!context) {
    throw new Error('useTTS must be used within a TTSProvider');
  }
  return context;
}
