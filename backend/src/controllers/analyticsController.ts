import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { analyticsService } from '../services/analytics';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../services/logger';

export const analyticsController = {
  /**
   * Get user analytics dashboard data
   */
  getAnalytics: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.uid;
    
    logger.info(`Fetching analytics for user: ${userId}`);
    
    const analytics = await analyticsService.getUserAnalytics(userId);
    
    res.json({
      success: true,
      data: analytics,
    });
  }),

  /**
   * Record user activity
   */
  recordActivity: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.uid;
    const { tasksCompleted, quizzesTaken, conceptsLearned, timeSpent } = req.body;
    
    await analyticsService.recordActivity(userId, {
      tasksCompleted,
      quizzesTaken,
      conceptsLearned,
      timeSpent,
    });
    
    res.json({
      success: true,
      message: 'Activity recorded',
    });
  }),

  /**
   * Get learning streak
   */
  getStreak: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.uid;
    
    const streak = await analyticsService.calculateStreak(userId);
    
    res.json({
      success: true,
      data: { streak },
    });
  }),
};
