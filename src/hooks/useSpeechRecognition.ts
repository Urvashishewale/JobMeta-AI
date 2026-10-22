import { useState, useEffect, useRef, useCallback } from 'react';
import { InterviewLanguage } from '../types/interview';

// Define SpeechRecognition interface types for TypeScript
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

interface UseSpeechRecognitionOptions {
  language?: InterviewLanguage;
  continuous?: boolean;
  interimResults?: boolean;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  supported: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
  setTranscript: (text: string) => void;
}

export function useSpeechRecognition({
  language = 'English',
  continuous = true,
  interimResults = true,
}: UseSpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscriptState] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);

  // References to prevent stale closures and manage recognition lifecycle
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const isStartingRef = useRef(false);
  const isManuallyStoppedRef = useRef(false);
  const restartTimeoutRef = useRef<any>(null);

  // Transcript persistence refs
  // baseTranscriptRef holds text that was committed before the current speech recognition session started
  const baseTranscriptRef = useRef('');
  // sessionFinalRef holds final results collected during the current speech recognition session
  const sessionFinalRef = useRef('');
  // sessionInterimRef holds the latest interim result
  const sessionInterimRef = useRef('');

  // Map application language to speech recognition BCP-47 tag
  const getLanguageCode = useCallback((lang: InterviewLanguage): string => {
    switch (lang) {
      case 'Hindi':
        return 'hi-IN';
      case 'Marathi':
        return 'mr-IN';
      case 'English':
      default:
        return 'en-US';
    }
  }, []);

  // Check browser support on mount
  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      setSupported(true);
    } else {
      setSupported(false);
      setError(
        'Web Speech Recognition API is not supported in this browser. You can type your answers directly using the text input fallback.'
      );
    }

    return () => {
      // Cleanup on unmount
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      isManuallyStoppedRef.current = true;
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.onstart = null;
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  // Update recognition language dynamically if language prop changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = getLanguageCode(language);
    }
  }, [language, getLanguageCode]);

  // Public method to update transcript (e.g. when user edits textarea)
  const setTranscript = useCallback((text: string) => {
    baseTranscriptRef.current = text;
    sessionFinalRef.current = '';
    sessionInterimRef.current = '';
    setTranscriptState(text);
    setInterimTranscript('');
  }, []);

  // Public method to reset transcript
  const resetTranscript = useCallback(() => {
    baseTranscriptRef.current = '';
    sessionFinalRef.current = '';
    sessionInterimRef.current = '';
    setTranscriptState('');
    setInterimTranscript('');
  }, []);

  // Start speech recognition
  const startListening = useCallback(async () => {
    if (isStartingRef.current || isListeningRef.current) {
      return;
    }
    isStartingRef.current = true;
    setError(null);
    isManuallyStoppedRef.current = false;

    const win = window as unknown as IWindow;
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setError('Web Speech API is not supported in this browser. Please use text mode.');
      isStartingRef.current = false;
      return;
    }

    // Step 1: Request microphone permission explicitly via getUserMedia.
    // In iframe and preview environments, SpeechRecognition will fail with 'not-allowed'
    // unless getUserMedia has prompted and secured mic access.
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release tracks so SpeechRecognition has dedicated microphone access
        stream.getTracks().forEach((track) => track.stop());
      } catch (permErr: any) {
        console.warn('Microphone permission request error:', permErr);
        isStartingRef.current = false;
        if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
          setError(
            'Microphone access was denied. Please allow microphone permissions in your browser or switch to Text Answer mode.'
          );
          setIsListening(false);
          isListeningRef.current = false;
          return;
        }
        if (permErr.name === 'NotFoundError' || permErr.name === 'DevicesNotFoundError') {
          setError('No microphone found on your device. Please connect a microphone or use Text Mode.');
          setIsListening(false);
          isListeningRef.current = false;
          return;
        }
      }
    }

    // Step 2: Stop any existing instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onstart = null;
        recognitionRef.current.abort();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }

    // Clear timeout if any restart was queued
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    // Reset session refs (preserve baseTranscriptRef so new speech appends to existing text)
    sessionFinalRef.current = '';
    sessionInterimRef.current = '';

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = getLanguageCode(language);
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        isStartingRef.current = false;
        isListeningRef.current = true;
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        let currentSessionFinal = '';
        let currentSessionInterim = '';

        // Iterate through all results in the current session
        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          const text = (item[0]?.transcript || '').trim();
          if (!text) continue;

          if (item.isFinal) {
            currentSessionFinal += (currentSessionFinal ? ' ' : '') + text;
          } else {
            currentSessionInterim += (currentSessionInterim ? ' ' : '') + text;
          }
        }

        sessionFinalRef.current = currentSessionFinal;
        sessionInterimRef.current = currentSessionInterim;

        // Compute total confirmed transcript: base + sessionFinal
        const base = baseTranscriptRef.current.trim();
        let totalFinal = base;
        if (currentSessionFinal) {
          totalFinal = base ? `${base} ${currentSessionFinal}` : currentSessionFinal;
        }

        setTranscriptState(totalFinal);
        setInterimTranscript(currentSessionInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);

        if (event.error === 'no-speech') {
          // User was quiet for a moment. Do not abort or reset transcript.
          return;
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setError(
            'Microphone access was denied. Please allow microphone permissions in your browser or switch to Text Answer mode.'
          );
          isListeningRef.current = false;
          isManuallyStoppedRef.current = true;
          setIsListening(false);
          return;
        }

        if (event.error === 'audio-capture') {
          setError('No microphone found or audio capture failed. Please check your audio input device.');
          isListeningRef.current = false;
          isManuallyStoppedRef.current = true;
          setIsListening(false);
          return;
        }

        if (event.error === 'network') {
          setError('Network issue with speech recognition service. You can type your answer in the text box below.');
          isListeningRef.current = false;
          isManuallyStoppedRef.current = true;
          setIsListening(false);
          return;
        }

        if (event.error === 'aborted') {
          // Normal stop/abort; do not show error
          return;
        }

        setError(`Speech recognition notice: ${event.error}. You can also type your response.`);
      };

      recognition.onend = () => {
        // Commit whatever final speech was captured into baseTranscriptRef
        const base = baseTranscriptRef.current.trim();
        const sessionPart = (sessionFinalRef.current || sessionInterimRef.current).trim();
        if (sessionPart) {
          baseTranscriptRef.current = base ? `${base} ${sessionPart}` : sessionPart;
          setTranscriptState(baseTranscriptRef.current);
        }
        sessionFinalRef.current = '';
        sessionInterimRef.current = '';
        setInterimTranscript('');

        // If the user did not manually stop and listening is still marked as active,
        // auto-restart recognition (handles Chrome's automatic pause/timeout)
        if (!isManuallyStoppedRef.current && isListeningRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            if (!isManuallyStoppedRef.current && isListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e: any) {
                // If already started or failed to restart, reset listening state
                if (e.name !== 'InvalidStateError') {
                  console.warn('Failed to restart speech recognition:', e);
                  setIsListening(false);
                  isListeningRef.current = false;
                }
              }
            }
          }, 150);
          return;
        }

        setIsListening(false);
        isListeningRef.current = false;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      isStartingRef.current = false;
      if (err.name === 'InvalidStateError') {
        // Recognition is already running
        return;
      }
      console.error('Failed to start speech recognition:', err);
      setError('Unable to activate speech recognition. Please check your browser microphone settings.');
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [continuous, getLanguageCode, interimResults, language]);

  // Stop speech recognition safely and preserve all transcript text
  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true;
    isListeningRef.current = false;
    isStartingRef.current = false;

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore if already stopped
      }
    }

    // Commit any active final or interim words into the confirmed transcript
    const base = baseTranscriptRef.current.trim();
    const sessionPart = (sessionFinalRef.current || sessionInterimRef.current).trim();
    if (sessionPart) {
      baseTranscriptRef.current = base ? `${base} ${sessionPart}` : sessionPart;
      setTranscriptState(baseTranscriptRef.current);
    }
    sessionFinalRef.current = '';
    sessionInterimRef.current = '';

    setIsListening(false);
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    supported,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  };
}
