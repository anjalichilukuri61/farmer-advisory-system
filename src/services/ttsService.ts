// src/services/ttsService.ts
import { Language } from '../i18n/translations.js';

export type VoiceSpeed = 'slow' | 'normal' | 'fast';

export interface SpeakOptions {
  id: string;
  text: string;
  lang: Language;
  speed?: VoiceSpeed;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onVoiceUnavailable?: (message: string) => void;
}

type StateChangeListener = (activeId: string | null) => void;

class TTSService {
  private currentId: string | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private listeners: Set<StateChangeListener> = new Set();
  private voicesLoaded = false;
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    }
  }

  private loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.availableVoices = window.speechSynthesis.getVoices();
    if (this.availableVoices.length > 0) {
      this.voicesLoaded = true;
    }
  }

  public subscribe(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(activeId: string | null) {
    this.currentId = activeId;
    this.listeners.forEach(fn => fn(activeId));
  }

  public getActiveId(): string | null {
    return this.currentId;
  }

  public isSpeaking(id?: string): boolean {
    if (id) {
      if (this.currentId !== id) return false;
    } else {
      if (!this.currentId) return false;
    }

    if (this.currentAudio && !this.currentAudio.paused && !this.currentAudio.ended) {
      return true;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return window.speechSynthesis.speaking;
    }

    return false;
  }

  public stop(): void {
    // 1. Stop HTMLAudio streaming if playing
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.removeAttribute('src');
      } catch (e) {
        console.warn('Audio pause error', e);
      }
      this.currentAudio = null;
    }

    // 2. Stop Web Speech Synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Speech cancellation error', e);
      }
      this.currentUtterance = null;
    }

    this.notify(null);
  }

  /**
   * Check if Telugu voice is installed on client device.
   */
  public hasTeluguVoice(): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
    const voices = this.availableVoices.length > 0 ? this.availableVoices : window.speechSynthesis.getVoices();
    return voices.some(v => v.lang.toLowerCase().startsWith('te') || v.name.toLowerCase().includes('telugu'));
  }

  /**
   * Cleans text and translates abbreviations (kg/ha, °C, mm, etc.)
   * into natural spoken language suitable for farmers.
   */
  public sanitizeSpokenText(text: string, lang: Language): string {
    if (!text) return '';

    let clean = text
      .replace(/https?:\/\/\S+/g, '')
      .replace(/mod_[a-zA-Z0-9_]+/g, '')
      .replace(/pred_[a-zA-Z0-9_]+/g, '')
      .replace(/usr_[a-zA-Z0-9_]+/g, '')
      .replace(/farm_[a-zA-Z0-9_]+/g, '')
      .replace(/rep_[a-zA-Z0-9_]+/g, '')
      .replace(/[{}()\[\]\\/]/g, ' ')
      .replace(/[*_#~`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (lang === 'te') {
      clean = clean
        .replace(/kg\/ha/gi, ' కిలోగ్రాములు ప్రతి హెక్టారుకు ')
        .replace(/t\/ha/gi, ' టన్నులు ప్రతి హెక్టారుకు ')
        .replace(/tonnes/gi, ' టన్నులు ')
        .replace(/tonne/gi, ' టన్ను ')
        .replace(/mm/gi, ' మిల్లీమీటర్లు ')
        .replace(/km\/h/gi, ' కిలోమీటర్లు ప్రతి గంటకు ')
        .replace(/°C/gi, ' డిగ్రీల సెల్సియస్ ')
        .replace(/%/g, ' శాతం ')
        .replace(/pH/gi, ' పి హెచ్ ')
        .replace(/\bN\b/g, 'నత్రజని')
        .replace(/\bP\b/g, 'భాస్వరం')
        .replace(/\bK\b/g, 'పొటాషియం')
        .replace(/DAP/gi, 'డి ఎ పి')
        .replace(/Urea/gi, 'యూరియా')
        .replace(/MOP/gi, 'ఎం ఓ పి')
        .replace(/FYM/gi, 'పశువుల ఎరువు')
        .replace(/(\d+)\.(\d+)/g, '$1 పాయింట్ $2');
    } else {
      clean = clean
        .replace(/kg\/ha/gi, ' kilograms per hectare ')
        .replace(/t\/ha/gi, ' tonnes per hectare ')
        .replace(/°C/gi, ' degrees Celsius ')
        .replace(/%/g, ' percent ')
        .replace(/mm/gi, ' millimeters ')
        .replace(/km\/h/gi, ' kilometers per hour ')
        .replace(/pH/gi, ' P H ')
        .replace(/\bN\b/g, 'Nitrogen')
        .replace(/\bP\b/g, 'Phosphorus')
        .replace(/\bK\b/g, 'Potassium');
    }

    return clean;
  }

  private resolveVoice(lang: Language): { voice: SpeechSynthesisVoice | null; targetLocale: string; isFallback: boolean } {
    let targetLocale = 'en-IN';
    if (lang === 'te') targetLocale = 'te-IN';

    const voices = this.availableVoices.length > 0 ? this.availableVoices : (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : []);

    if (lang === 'te') {
      // 1. Direct match for Telugu voice
      let teVoice = voices.find(v => v.lang.toLowerCase() === 'te-in' || v.lang.toLowerCase().startsWith('te'));
      if (!teVoice) {
        teVoice = voices.find(v => v.name.toLowerCase().includes('telugu'));
      }
      return { voice: teVoice || null, targetLocale: 'te-IN', isFallback: !teVoice };
    }

    // English
    let enVoice = voices.find(v => v.lang.toLowerCase() === 'en-in');
    if (!enVoice) {
      enVoice = voices.find(v => v.lang.toLowerCase().startsWith('en'));
    }
    return { voice: enVoice || null, targetLocale: 'en-IN', isFallback: false };
  }

  /**
   * Plays audio stream directly from the server TTS audio service.
   * This guarantees native, high-quality Telugu pronunciation on every device,
   * even when local browser / OS Telugu voices are absent.
   */
  private playAudioStream(spokenText: string, options: SpeakOptions): void {
    try {
      const rate = options.speed === 'slow' ? 0.85 : options.speed === 'fast' ? 1.25 : 1.0;
      const audioUrl = `/api/tts/stream?text=${encodeURIComponent(spokenText)}&lang=${options.lang}`;

      const audio = new Audio(audioUrl);
      audio.playbackRate = rate;

      this.currentAudio = audio;
      this.currentId = options.id;

      audio.onplay = () => {
        this.notify(options.id);
        options.onStart?.();
      };

      audio.onended = () => {
        if (this.currentId === options.id) {
          this.notify(null);
        }
        this.currentAudio = null;
        options.onEnd?.();
      };

      audio.onerror = (e) => {
        console.warn('Audio streaming playback error, attempting retry or error notification', e);
        if (this.currentId === options.id) {
          this.notify(null);
        }
        this.currentAudio = null;
        options.onError?.(e);
      };

      audio.play().catch((playError) => {
        console.warn('Failed to start audio playback automatically:', playError);
        if (this.currentId === options.id) {
          this.notify(null);
        }
        this.currentAudio = null;
        options.onError?.(playError);
      });
    } catch (streamErr) {
      console.error('Audio streaming initialization failed:', streamErr);
      this.notify(null);
      options.onError?.(streamErr);
    }
  }

  /**
   * Main Speak Entrypoint:
   * 1. If Telugu voice is available in the browser, plays via Web Speech API.
   * 2. If Telugu voice is NOT found locally on the device (or Web Speech fails),
   *    AUTOMATICALLY and SEAMLESSLY uses the server-side audio stream!
   *    The farmer hears Telugu speech with ZERO configuration or error dialogs.
   */
  public speak(options: SpeakOptions): void {
    // Prevent multiple overlapping audio playback
    this.stop();

    const spokenText = this.sanitizeSpokenText(options.text, options.lang);
    if (!spokenText) {
      options.onEnd?.();
      return;
    }

    // For Telugu: Check if local voice exists; if not, immediately play high-fidelity audio stream!
    if (options.lang === 'te') {
      const { voice } = this.resolveVoice('te');

      // If browser doesn't have native Telugu voice, seamlessly use the universal audio stream!
      if (!voice) {
        this.playAudioStream(spokenText, options);
        return;
      }

      // If local voice exists, attempt to use it with seamless fallback to audio stream on error
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          const utterance = new SpeechSynthesisUtterance(spokenText);
          utterance.voice = voice;
          utterance.lang = voice.lang || 'te-IN';

          let rate = 1.0;
          if (options.speed === 'slow') rate = 0.82;
          else if (options.speed === 'fast') rate = 1.25;
          utterance.rate = rate;
          utterance.pitch = 1.0;

          utterance.onstart = () => {
            this.notify(options.id);
            options.onStart?.();
          };

          utterance.onend = () => {
            if (this.currentId === options.id) {
              this.notify(null);
            }
            options.onEnd?.();
          };

          utterance.onerror = (e) => {
            if (e.error !== 'interrupted' && e.error !== 'canceled') {
              console.warn('Local speech synthesis error, falling back to audio stream:', e);
              // Automatic seamless fallback to audio stream
              this.playAudioStream(spokenText, options);
            } else if (this.currentId === options.id) {
              this.notify(null);
            }
          };

          this.currentUtterance = utterance;
          window.speechSynthesis.speak(utterance);
          return;
        } catch (localErr) {
          console.warn('Web speech failed, falling back to audio stream:', localErr);
          this.playAudioStream(spokenText, options);
          return;
        }
      } else {
        this.playAudioStream(spokenText, options);
        return;
      }
    }

    // For English:
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const { voice, targetLocale } = this.resolveVoice('en');
        const utterance = new SpeechSynthesisUtterance(spokenText);

        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else {
          utterance.lang = targetLocale;
        }

        let rate = 1.0;
        if (options.speed === 'slow') rate = 0.82;
        else if (options.speed === 'fast') rate = 1.25;
        utterance.rate = rate;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          this.notify(options.id);
          options.onStart?.();
        };

        utterance.onend = () => {
          if (this.currentId === options.id) {
            this.notify(null);
          }
          options.onEnd?.();
        };

        utterance.onerror = (e) => {
          if (e.error !== 'interrupted' && e.error !== 'canceled') {
            console.warn('Speech synthesis error for English, falling back to audio stream:', e);
            this.playAudioStream(spokenText, options);
          } else if (this.currentId === options.id) {
            this.notify(null);
          }
        };

        this.currentUtterance = utterance;
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('TTS execution error, falling back to audio stream:', err);
        this.playAudioStream(spokenText, options);
      }
    } else {
      // Browser has no Web Speech API, use audio stream
      this.playAudioStream(spokenText, options);
    }
  }
}

export const tts = new TTSService();
