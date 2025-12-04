import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { ttsApi } from '../api';

// Languages supported by Google Cloud TTS (Amharic is now supported!)
const CLOUD_TTS_LANGUAGES = ['am'];
// Languages not supported at all (Oromo has no TTS support yet)
const UNSUPPORTED_LANGUAGES = ['om'];

interface UseTextToSpeechReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  isLanguageSupported: boolean;
  unsupportedMessage: string | null;
  voices: SpeechSynthesisVoice[];
  setVoice: (voice: SpeechSynthesisVoice) => void;
  currentVoice: SpeechSynthesisVoice | null;
}

export const useTextToSpeech = (lang: string = 'en-US'): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  
  // Check if the current language has TTS support (browser or cloud)
  const isLanguageSupported = useMemo(() => {
    return !UNSUPPORTED_LANGUAGES.includes(lang);
  }, [lang]);

  // Check if we should use cloud TTS
  const useCloudTTS = useMemo(() => {
    return CLOUD_TTS_LANGUAGES.includes(lang);
  }, [lang]);

  // Message to show when language is not supported
  const unsupportedMessage = useMemo(() => {
    if (lang === 'om') {
      return 'Voice is not available for Afan Oromo. The text response is shown above.';
    }
    return null;
  }, [lang]);

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Set default voice based on language
      const langCode = lang === 'am' ? 'am' : lang === 'om' ? 'om' : 'en';
      const defaultVoice = availableVoices.find(v => v.lang.startsWith(langCode)) 
        || availableVoices.find(v => v.lang.startsWith('en'))
        || availableVoices[0];
      
      if (defaultVoice) {
        setCurrentVoice(defaultVoice);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported, lang]);

  // CRITICAL: Stop speech on unmount or page navigation
  useEffect(() => {
    if (!isSupported) return;

    // Stop speech when component unmounts
    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
  }, [isSupported]);

  // Also stop on page visibility change (tab switch) and before unload
  useEffect(() => {
    if (!isSupported) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    };

    const handleBeforeUnload = () => {
      window.speechSynthesis.cancel();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const speak = useCallback(async (text: string) => {
    // Don't speak if not supported or language not supported
    if (!text || !isLanguageSupported) return;

    // Stop any ongoing speech first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (isSupported) {
      window.speechSynthesis.cancel();
    }

    // Use Google Cloud TTS for Amharic
    if (useCloudTTS) {
      try {
        setIsSpeaking(true);
        const response = await ttsApi.synthesize(text, lang as 'am' | 'en' | 'om');
        
        if (response.success && response.data?.audioContent) {
          // Create audio from base64
          const audioSrc = `data:audio/mp3;base64,${response.data.audioContent}`;
          const audio = new Audio(audioSrc);
          audioRef.current = audio;
          
          audio.onended = () => {
            setIsSpeaking(false);
            audioRef.current = null;
          };
          audio.onerror = () => {
            setIsSpeaking(false);
            audioRef.current = null;
          };
          
          await audio.play();
        } else {
          setIsSpeaking(false);
        }
      } catch (error) {
        console.error('Cloud TTS error:', error);
        setIsSpeaking(false);
      }
      return;
    }

    // Use browser TTS for English
    if (!isSupported) return;

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (currentVoice) {
      utterance.voice = currentVoice;
    }
    
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported, isLanguageSupported, useCloudTTS, lang, currentVoice]);

  const stop = useCallback(() => {
    // Stop cloud TTS audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    // Stop browser TTS
    if (isSupported) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [isSupported]);

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setCurrentVoice(voice);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    isLanguageSupported,
    unsupportedMessage,
    voices,
    setVoice,
    currentVoice,
  };
};
