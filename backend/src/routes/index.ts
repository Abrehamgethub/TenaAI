import { Router } from 'express';
import roadmapRoutes from './roadmap';
import tutorRoutes from './tutor';
import opportunitiesRoutes from './opportunities';
import skillsRoutes from './skills';
import profileRoutes from './profile';
import analyticsRoutes from './analytics';
import quizRoutes from './quiz';
import dailyPlanRoutes from './dailyPlan';

const router = Router();

// API Routes
router.use('/roadmap', roadmapRoutes);
router.use('/explain', tutorRoutes);
router.use('/opportunities', opportunitiesRoutes);
router.use('/skills-eval', skillsRoutes);
router.use('/profile', profileRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/quiz', quizRoutes);
router.use('/daily-plan', dailyPlanRoutes);

export default router;
