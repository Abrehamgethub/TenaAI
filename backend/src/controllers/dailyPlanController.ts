import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { geminiService, DailyTask } from '../services/gemini';
import { getFirestore } from '../config/firebase';
import { asyncHandler } from '../middleware/errorHandler';
import { analyticsService } from '../services/analytics';
import { logger } from '../services/logger';

const db = getFirestore();

export const dailyPlanController = {
  /**
   * Generate or get today's daily plan
   */
  getDailyPlan: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.uid;
    const today = new Date().toISOString().split('T')[0];
    
    // Check if today's plan already exists
    const planRef = db.collection('users').doc(userId).collection('dailyPlans').doc(today);
    const existingPlan = await planRef.get();
    
    if (existingPlan.exists) {
      const data = existingPlan.data()!;
      res.json({
        success: true,
        data: {
          date: today,
          tasks: data.tasks,
          quizQuestions: data.quizQuestions,
          streak: await analyticsService.calculateStreak(userId),
        },
      });
      return;
    }
    
    // Get user's career goal and completed topics
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : {};
    
    const careerGoal = userData?.careerGoals?.[0] || 'Software Development';
    const completedTopics = userData?.completedTopics || [];
    const skillLevel = userData?.skillLevel || 'beginner';
    const language = userData?.languagePreference || 'en';
    
    logger.info(`Generating daily plan for user ${userId}, career: ${careerGoal}`);
    
    // Generate new daily plan
    const plan = await geminiService.generateDailyPlan(
      careerGoal,
      completedTopics,
      skillLevel,
      language
    );
    
    // Save the plan
    await planRef.set({
      date: today,
      tasks: plan.tasks,
      quizQuestions: plan.quizQuestions,
      createdAt: new Date(),
    });
    
    const streak = await analyticsService.calculateStreak(userId);
    
    res.json({
      success: true,
      data: {
        date: today,
        tasks: plan.tasks,
        quizQuestions: plan.quizQuestions,
        streak,
      },
    });
  }),

  /**
   * Mark a task as completed
   */
  completeTask: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.uid;
    const { taskId, date } = req.body;
    const planDate = date || new Date().toISOString().split('T')[0];
    
    const planRef = db.collection('users').doc(userId).collection('dailyPlans').doc(planDate);
    const plan = await planRef.get();
    
    if (!plan.exists) {
      res.status(404).json({
        success: false,
        error: 'Daily plan not found',
      });
      return;
    }
    
    const tasks = plan.data()!.tasks as DailyTask[];
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: true } : task
    );
    
    await planRef.update({ tasks: updatedTasks });
    
    // Record activity
    await analyticsService.recordActivity(userId, {
      tasksCompleted: 1,
      timeSpent: tasks.find(t => t.id === taskId)?.estimatedTime || 0,
    });
    
    res.json({
      success: true,
      message: 'Task marked as completed',
      data: { tasks: updatedTasks },
    });
  }),

  /**
   * Get plan history
   */
  getHistory: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.uid;
    const limit = parseInt(req.query.limit as string) || 7;
    
    const plansRef = db.collection('users').doc(userId).collection('dailyPlans');
    const snapshot = await plansRef.orderBy('date', 'desc').limit(limit).get();
    
    const history = snapshot.docs.map(doc => ({
      date: doc.id,
      ...doc.data(),
      tasksCompleted: (doc.data().tasks as DailyTask[])?.filter(t => t.completed).length || 0,
      totalTasks: (doc.data().tasks as DailyTask[])?.length || 0,
    }));
    
    res.json({
      success: true,
      data: history,
    });
  }),

  /**
   * Update user's career goal for personalized plans
   */
  setCareerGoal: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.uid;
    const { careerGoal, skillLevel } = req.body;
    
    const userRef = db.collection('users').doc(userId);
    await userRef.set({
      careerGoals: [careerGoal],
      skillLevel,
      updatedAt: new Date(),
    }, { merge: true });
    
    res.json({
      success: true,
      message: 'Career goal updated',
    });
  }),
};
