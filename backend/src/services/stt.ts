import { SpeechClient } from '@google-cloud/speech';
import { logger } from './logger';

// Initialize Google Speech-to-Text client
// Uses Application Default Credentials (ADC) on Cloud Run
let speechClient: SpeechClient | null = null;

const initSpeechClient = () => {
  if (!speechClient) {
    try {
      speechClient = new SpeechClient();
      logger.info('Google Speech-to-Text client initialized');
    } catch (error) {
      logger.error('Failed to initialize Speech-to-Text client:', error);
    }
  }
  return speechClient;
};

interface TranscriptionResult {
  transcript: string;
  confidence: number;
}

export const sttService = {
  /**
   * Transcribe audio using Google Speech-to-Text
   * @param audioBase64 - Base64 encoded audio data
   * @param languageCode - BCP-47 language code (e.g., 'en-US', 'am-ET')
   */
  async transcribe(audioBase64: string, languageCode: string): Promise<TranscriptionResult> {
    const client = initSpeechClient();
    
    if (!client) {
      throw new Error('Speech-to-Text service not available');
    }

    try {
      // Clean base64 string (remove data URL prefix if present)
      const cleanAudio = audioBase64.replace(/^data:audio\/\w+;base64,/, '');

      const request = {
        audio: {
          content: cleanAudio,
        },
        config: {
          encoding: 'WEBM_OPUS' as const, // Common browser recording format
          sampleRateHertz: 48000,
          languageCode: languageCode,
          enableAutomaticPunctuation: true,
          model: 'default',
          // Alternative audio encodings to try if WEBM_OPUS fails
          // encoding: 'LINEAR16' as const,
          // encoding: 'OGG_OPUS' as const,
        },
      };

      logger.info(`STT request with language: ${languageCode}`);
      
      const [response] = await client.recognize(request);
      
      if (!response.results || response.results.length === 0) {
        logger.warn('STT returned no results');
        return { transcript: '', confidence: 0 };
      }

      const result = response.results[0];
      const alternative = result.alternatives?.[0];
      
      if (!alternative) {
        return { transcript: '', confidence: 0 };
      }

      logger.info(`STT success: "${alternative.transcript?.substring(0, 50)}..." (confidence: ${alternative.confidence})`);

      return {
        transcript: alternative.transcript || '',
        confidence: alternative.confidence || 0,
      };
    } catch (error) {
      logger.error('STT transcription failed:', error);
      throw error;
    }
  },

  /**
   * Check if STT service is available
   */
  isAvailable(): boolean {
    try {
      const client = initSpeechClient();
      return client !== null;
    } catch {
      return false;
    }
  },
};
