import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// GET /api/analytics - Get user analytics dashboard
router.get('/', authMiddleware, analyticsController.getAnalytics);

// GET /api/analytics/streak - Get learning streak
router.get('/streak', authMiddleware, analyticsController.getStreak);

// POST /api/analytics/activity - Record user activity
router.post('/activity', authMiddleware, analyticsController.recordActivity);

export default router;
