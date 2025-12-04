import { Router } from 'express';
import { ttsController } from '../controllers/ttsController';
import { optionalAuthMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/tts - Synthesize text to speech
router.post('/', optionalAuthMiddleware, ttsController.synthesize);

// GET /api/tts/languages - Get supported languages
router.get('/languages', ttsController.getSupportedLanguages);

export default router;
