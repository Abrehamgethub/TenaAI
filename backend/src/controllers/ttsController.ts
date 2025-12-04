import { Request, Response } from 'express';
import { ttsService } from '../services/tts';
import { logger } from '../services/logger';

export const ttsController = {
  /**
   * Synthesize text to speech
   */
  async synthesize(req: Request, res: Response): Promise<void> {
    try {
      const { text, language = 'en' } = req.body;

      if (!text || typeof text !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Text is required',
        });
        return;
      }

      // Limit text length to prevent abuse
      if (text.length > 5000) {
        res.status(400).json({
          success: false,
          error: 'Text too long. Maximum 5000 characters.',
        });
        return;
      }

      // Check if language is supported
      if (!ttsService.isLanguageSupported(language)) {
        res.status(400).json({
          success: false,
          error: `Language '${language}' is not supported for TTS`,
          supportedLanguages: ['am', 'en'],
        });
        return;
      }

      const audioContent = await ttsService.synthesize({ text, language });

      res.status(200).json({
        success: true,
        data: {
          audioContent, // Base64 encoded MP3
          format: 'mp3',
          language,
        },
      });
    } catch (error) {
      logger.error('TTS controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate speech',
      });
    }
  },

  /**
   * Get supported languages
   */
  getSupportedLanguages(_req: Request, res: Response): void {
    res.status(200).json({
      success: true,
      data: {
        languages: [
          { code: 'am', name: 'Amharic', supported: true },
          { code: 'en', name: 'English', supported: true },
          { code: 'om', name: 'Afan Oromo', supported: false },
        ],
      },
    });
  },
};

export default ttsController;
