import { Router } from 'express';
import { sttController } from '../controllers/sttController';
import { optionalAuthMiddleware } from '../middleware/auth';

const router = Router();

/**
 * POST /api/stt/transcribe
 * Server-side speech-to-text transcription for languages not supported by browser STT
 * Body: { audioBase64: string, language: string }
 */
router.post('/transcribe', optionalAuthMiddleware, sttController.transcribe);

/**
 * GET /api/stt/supported-languages
 * Get list of supported languages for server-side STT
 */
router.get('/supported-languages', sttController.getSupportedLanguages);

export default router;
