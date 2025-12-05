import { Request, Response } from 'express';
import { sttService } from '../services/stt';
import { logger } from '../services/logger';

/**
 * Language code mapping for Google Speech-to-Text
 * Maps our app language codes to Google STT language codes
 */
const STT_LANGUAGE_MAP: Record<string, { primary: string; fallback: string }> = {
  en: { primary: 'en-US', fallback: 'en-US' },
  am: { primary: 'am-ET', fallback: 'am-ET' },
  om: { primary: 'om-ET', fallback: 'en-US' }, // Oromo may not be fully supported, fallback to English
  tg: { primary: 'ti-ET', fallback: 'am-ET' }, // Tigrigna: try ti-ET, fallback to Amharic
  so: { primary: 'so-SO', fallback: 'en-US' }, // Somali
};

// Languages fully supported by Google STT
const FULLY_SUPPORTED = ['en', 'am'];

// Languages with limited/experimental support
const LIMITED_SUPPORT = ['om', 'tg', 'so'];

export const sttController = {
  /**
   * Transcribe audio to text using Google Speech-to-Text
   */
  async transcribe(req: Request, res: Response) {
    try {
      const { audioBase64, language = 'en' } = req.body;

      if (!audioBase64) {
        return res.status(400).json({
          success: false,
          error: 'Audio data is required',
        });
      }

      // Get language mapping
      const langConfig = STT_LANGUAGE_MAP[language] || STT_LANGUAGE_MAP['en'];
      const isLimitedSupport = LIMITED_SUPPORT.includes(language);

      logger.info(`STT request for language: ${language}, using: ${langConfig.primary}`);

      try {
        // Attempt transcription with primary language
        const result = await sttService.transcribe(audioBase64, langConfig.primary);
        
        return res.json({
          success: true,
          transcript: result.transcript,
          confidence: result.confidence,
          languageUsed: langConfig.primary,
          isApproximate: isLimitedSupport,
          message: isLimitedSupport 
            ? `Transcription may be approximate. ${language} has limited STT support.`
            : undefined,
        });
      } catch (primaryError) {
        // If primary fails for limited support languages, try fallback
        if (isLimitedSupport && langConfig.fallback !== langConfig.primary) {
          logger.warn(`Primary STT failed for ${language}, trying fallback: ${langConfig.fallback}`);
          
          try {
            const fallbackResult = await sttService.transcribe(audioBase64, langConfig.fallback);
            
            return res.json({
              success: true,
              transcript: fallbackResult.transcript,
              confidence: fallbackResult.confidence,
              languageUsed: langConfig.fallback,
              isApproximate: true,
              message: `Used ${langConfig.fallback} as fallback. Original language ${language} not fully supported.`,
            });
          } catch (fallbackError) {
            throw fallbackError;
          }
        }
        throw primaryError;
      }
    } catch (error) {
      logger.error('STT transcription error:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Failed to transcribe audio',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  /**
   * Get list of supported languages for STT
   */
  async getSupportedLanguages(_req: Request, res: Response) {
    return res.json({
      success: true,
      languages: {
        fullSupport: FULLY_SUPPORTED.map(code => ({
          code,
          name: getLanguageName(code),
          sttCode: STT_LANGUAGE_MAP[code]?.primary,
        })),
        limitedSupport: LIMITED_SUPPORT.map(code => ({
          code,
          name: getLanguageName(code),
          sttCode: STT_LANGUAGE_MAP[code]?.primary,
          fallback: STT_LANGUAGE_MAP[code]?.fallback,
          note: 'May use fallback language for transcription',
        })),
      },
    });
  },
};

function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    en: 'English',
    am: 'Amharic',
    om: 'Afan Oromo',
    tg: 'Tigrigna',
    so: 'Somali',
  };
  return names[code] || code;
}
