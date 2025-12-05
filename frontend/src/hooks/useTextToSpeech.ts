import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { ttsApi } from '../api';

// Languages supported by Google Cloud TTS
const CLOUD_TTS_LANGUAGES = ['am', 'tg', 'so'];
// Languages not fully supported - will try browser TTS first, then cloud, then show message
const FALLBACK_LANGUAGES = ['om'];

// Voice language mappings for browser TTS
const VOICE_LANG_MAP: Record<string, string[]> = {
  'en': ['en-US', 'en-GB', 'en'],
  'am': ['am-ET', 'am', 'Amharic'],
  'om': ['om-ET', 'om', 'Oromo'],
  'tg': ['ti-ET', 'ti', 'Tigrinya', 'en-US'], // Fallback to English
  'so': ['so-SO', 'so', 'Somali', 'en-US'], // Fallback to English
};

/**
 * Clean text for TTS - remove markdown and special characters
 */
const cleanTextForSpeech = (text: string): string => {
  return text
    // Remove markdown bold/italic markers
    .replace(/\*\*\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/___/g, '')
    .replace(/__/g, '')
    .replace(/_/g, ' ')
    // Remove markdown headers
    .replace(/#{1,6}\s*/g, '')
    // Remove markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove markdown images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    // Remove bullet points and list markers
    .replace(/^[\s]*[-•]\s*/gm, '')
    .replace(/^[\s]*\d+\.\s*/gm, '')
    // Remove extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    // Remove special characters that shouldn't be spoken
    .replace(/[<>{}[\]|\\^~]/g, '')
    .trim();
};

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
  
  const browserTTSSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  
  // Check if we should use cloud TTS
  const useCloudTTS = useMemo(() => {
    return CLOUD_TTS_LANGUAGES.includes(lang);
  }, [lang]);
  
  // TTS is supported if either browser TTS works OR we use cloud TTS
  const isSupported = browserTTSSupported || useCloudTTS;
  
  // Check if the current language has TTS support (browser or cloud)
  const isLanguageSupported = useMemo(() => {
    // All languages are supported now via cloud TTS fallback
    return true;
  }, []);

  // Message to show when language might have limited support
  const unsupportedMessage = useMemo(() => {
    if (FALLBACK_LANGUAGES.includes(lang)) {
      return 'Voice may have limited support for this language. Text response is shown above.';
    }
    return null;
  }, [lang]);

  // Load available voices (only for browser TTS)
  useEffect(() => {
    if (!browserTTSSupported) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Set default voice based on language using VOICE_LANG_MAP
      const langCodes = VOICE_LANG_MAP[lang] || VOICE_LANG_MAP['en'];
      
      // Try to find a voice matching any of the language codes
      let defaultVoice: SpeechSynthesisVoice | undefined;
      for (const code of langCodes) {
        defaultVoice = availableVoices.find(v => 
          v.lang.startsWith(code) || v.name.toLowerCase().includes(code.toLowerCase())
        );
        if (defaultVoice) break;
      }
      
      // Fallback to English if no matching voice found
      if (!defaultVoice) {
        defaultVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
      }
      
      if (defaultVoice) {
        setCurrentVoice(defaultVoice);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [browserTTSSupported, lang]);

  // CRITICAL: Stop speech on unmount or page navigation
  useEffect(() => {
    // Stop speech when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (browserTTSSupported) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    };
  }, [browserTTSSupported]);

  // Also stop on page visibility change (tab switch) and before unload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        if (browserTTSSupported) {
          window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
      }
    };

    const handleBeforeUnload = () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (browserTTSSupported) {
        window.speechSynthesis.cancel();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (browserTTSSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [browserTTSSupported]);

  const speak = useCallback(async (text: string) => {
    // Don't speak if not supported or language not supported
    if (!text || !isLanguageSupported) return;

    // Clean the text - remove markdown and special characters
    const cleanedText = cleanTextForSpeech(text);
    if (!cleanedText) return;

    // Stop any ongoing speech first
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (browserTTSSupported) {
      window.speechSynthesis.cancel();
    }

    // Use Google Cloud TTS for Amharic
    if (useCloudTTS) {
      try {
        setIsSpeaking(true);
        console.log('Calling Cloud TTS for language:', lang);
        const response = await ttsApi.synthesize(cleanedText, lang as 'am' | 'en' | 'om');
        console.log('TTS response:', response.success, !!response.data?.audioContent);
        
        if (response.success && response.data?.audioContent) {
          // Create audio from base64
          const audioSrc = `data:audio/mp3;base64,${response.data.audioContent}`;
          const audio = new Audio(audioSrc);
          audioRef.current = audio;
          
          audio.onended = () => {
            console.log('Audio playback ended');
            setIsSpeaking(false);
            audioRef.current = null;
          };
          audio.onerror = (e) => {
            console.error('Audio playback error:', e);
            setIsSpeaking(false);
            audioRef.current = null;
          };
          
          console.log('Playing audio...');
          await audio.play();
        } else {
          console.error('TTS failed:', response);
          setIsSpeaking(false);
        }
      } catch (error) {
        console.error('Cloud TTS error:', error);
        setIsSpeaking(false);
      }
      return;
    }

    // Use browser TTS for English
    if (!browserTTSSupported) return;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
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
  }, [browserTTSSupported, isLanguageSupported, useCloudTTS, lang, currentVoice]);

  const stop = useCallback(() => {
    // Stop cloud TTS audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    // Stop browser TTS
    if (browserTTSSupported) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, [browserTTSSupported]);

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
