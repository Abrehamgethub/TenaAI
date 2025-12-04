import { Router } from 'express';
import { quizController } from '../controllers/quizController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/quiz/generate - Generate quiz questions
router.post('/generate', optionalAuthMiddleware, quizController.generate);

// POST /api/quiz/grade - Grade quiz answers
router.post('/grade', optionalAuthMiddleware, quizController.grade);

// GET /api/quiz/history - Get quiz history
router.get('/history', authMiddleware, quizController.getHistory);

export default router;
