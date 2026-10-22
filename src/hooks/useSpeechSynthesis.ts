import { useState, useEffect, useRef, useCallback } from 'react';
import { storageService } from '../services/storageService';

interface UseSpeechSynthesisReturn {
  isSpeaking: boolean;
  isPaused: boolean;
  supported: boolean;
  voices: SpeechSynthesisVoice[];
  speak: (text: string, lang?: string, onEnd?: () => void) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported, setSupported] = useState(false);
  const onEndCallbackRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.cancel();
      };
    } else {
      setSupported(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      if (onEndCallbackRef.current) {
        onEndCallbackRef.current();
        onEndCallbackRef.current = null;
      }
    }
  }, []);

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const speak = useCallback(
    (text: string, lang = 'English', onEnd?: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        if (onEnd) onEnd();
        return;
      }

      // Stop previous
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);

      if (!text || text.trim() === '') {
        if (onEnd) onEnd();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const settings = storageService.getSettings();

      utterance.rate = settings.speechRate || 1.0;
      utterance.pitch = settings.speechPitch || 1.0;

      // Map language
      let targetLangPrefix = 'en';
      if (lang.toLowerCase().includes('hindi') || lang.toLowerCase() === 'hi') {
        targetLangPrefix = 'hi';
      } else if (lang.toLowerCase().includes('marathi') || lang.toLowerCase() === 'mr') {
        targetLangPrefix = 'mr';
      }

      // Select voice
      const currentVoices = window.speechSynthesis.getVoices();
      let selectedVoice: SpeechSynthesisVoice | undefined;

      if (settings.preferredVoiceURI) {
        selectedVoice = currentVoices.find((v) => v.voiceURI === settings.preferredVoiceURI);
      }

      if (!selectedVoice) {
        // Find best match for language
        selectedVoice = currentVoices.find(
          (v) => v.lang.toLowerCase().startsWith(targetLangPrefix) && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Neural'))
        ) || currentVoices.find((v) => v.lang.toLowerCase().startsWith(targetLangPrefix));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = targetLangPrefix === 'hi' ? 'hi-IN' : targetLangPrefix === 'mr' ? 'mr-IN' : 'en-US';
      }

      onEndCallbackRef.current = onEnd || null;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        if (onEndCallbackRef.current) {
          onEndCallbackRef.current();
          onEndCallbackRef.current = null;
        }
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error/interrupted:', e);
        setIsSpeaking(false);
        setIsPaused(false);
        if (onEndCallbackRef.current) {
          onEndCallbackRef.current();
          onEndCallbackRef.current = null;
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  return {
    isSpeaking,
    isPaused,
    supported,
    voices,
    speak,
    stop,
    pause,
    resume,
  };
}
