import { logger } from './logger';

const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY;
const GOOGLE_TTS_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';

interface TTSRequest {
  text: string;
  language: 'am' | 'en' | 'om';
}

interface GoogleTTSResponse {
  audioContent: string; // Base64 encoded audio
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
    if (!GOOGLE_TTS_API_KEY) {
      throw new Error('Google TTS API key not configured');
    }

    const voiceConfig = VOICE_CONFIG[language] || VOICE_CONFIG.en;

    try {
      logger.info(`TTS request for language: ${language}, text length: ${text.length}`);

      const response = await fetch(
        `${GOOGLE_TTS_URL}?key=${GOOGLE_TTS_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            input: { text },
            voice: {
              languageCode: voiceConfig.languageCode,
              name: voiceConfig.name,
              ssmlGender: voiceConfig.ssmlGender,
            },
            audioConfig: {
              audioEncoding: 'MP3',
              speakingRate: 0.9,
              pitch: 0,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        logger.error('TTS API error:', errorData);
        throw new Error('TTS API request failed');
      }

      const data = await response.json() as GoogleTTSResponse;
      logger.info('TTS synthesis successful');
      return data.audioContent;
    } catch (error: any) {
      logger.error('TTS synthesis failed:', error.message);
      throw new Error('Failed to synthesize speech');
    }
  },
};

export default ttsService;
