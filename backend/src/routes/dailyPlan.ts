import { Router } from 'express';
import { dailyPlanController } from '../controllers/dailyPlanController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// GET /api/daily-plan - Get or generate today's daily plan
router.get('/', authMiddleware, dailyPlanController.getDailyPlan);

// POST /api/daily-plan/complete - Mark task as completed
router.post('/complete', authMiddleware, dailyPlanController.completeTask);

// GET /api/daily-plan/history - Get plan history
router.get('/history', authMiddleware, dailyPlanController.getHistory);

// POST /api/daily-plan/career-goal - Set career goal
router.post('/career-goal', authMiddleware, dailyPlanController.setCareerGoal);

export default router;
