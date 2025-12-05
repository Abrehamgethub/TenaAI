import { logger } from './logger';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Use Google Cloud TTS client (uses default credentials in Cloud Run)
let ttsClient: TextToSpeechClient | null = null;

const getTTSClient = (): TextToSpeechClient => {
  if (!ttsClient) {
    ttsClient = new TextToSpeechClient();
  }
  return ttsClient;
};

interface TTSRequest {
  text: string;
  language: 'am' | 'en' | 'om';
}

// Language to voice mapping
const VOICE_CONFIG: Record<string, { languageCode: string; name: string; ssmlGender: string }> = {
  am: {
    languageCode: 'am-ET',
    name: 'am-ET-Standard-A',
    ssmlGender: 'FEMALE',
  },
  en: {
    languageCode: 'en-US',
    name: 'en-US-Standard-C',
    ssmlGender: 'FEMALE',
  },
  // Oromo is not supported by Google TTS, fallback to English
  om: {
    languageCode: 'en-US',
    name: 'en-US-Standard-C',
    ssmlGender: 'FEMALE',
  },
};

export const ttsService = {
  /**
   * Check if a language is supported by Google Cloud TTS
   */
  isLanguageSupported(language: string): boolean {
    return language === 'am' || language === 'en';
  },

  /**
   * Convert text to speech using Google Cloud TTS
   */
  async synthesize({ text, language }: TTSRequest): Promise<string> {
    const voiceConfig = VOICE_CONFIG[language] || VOICE_CONFIG.en;

    try {
      logger.info(`TTS request for language: ${language}, text length: ${text.length}`);

      const client = getTTSClient();
      
      const [response] = await client.synthesizeSpeech({
        input: { text },
        voice: {
          languageCode: voiceConfig.languageCode,
          name: voiceConfig.name,
          ssmlGender: voiceConfig.ssmlGender as 'FEMALE' | 'MALE' | 'NEUTRAL',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.9,
          pitch: 0,
        },
      });

      if (!response.audioContent) {
        throw new Error('No audio content received');
      }

      // Convert Buffer/Uint8Array to base64
      const audioContent = Buffer.from(response.audioContent).toString('base64');
      
      logger.info('TTS synthesis successful');
      return audioContent;
    } catch (error: any) {
      logger.error('TTS synthesis failed:', error.message);
      throw new Error('Failed to synthesize speech');
    }
  },
};

export default ttsService;
