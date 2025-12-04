import { getFirestore } from '../config/firebase';
import { geminiService } from './gemini';
import { logger } from './logger';

const db = getFirestore();

export interface AnalyticsData {
  userId: string;
  learningStreak: number;
  roadmapProgress: number;
  quizPerformance: QuizPerformance[];
  conceptCategories: CategoryProgress[];
  totalLearningTime: number;
  skillsConfidenceScore: number;
  weaknessAreas: string[];
  strengthAreas: string[];
  aiInsights: string;
}

export interface QuizPerformance {
  date: string;
  score: number;
  totalQuestions: number;
  category: string;
}

export interface CategoryProgress {
  category: string;
  progress: number;
  questionsAnswered: number;
  accuracy: number;
}

export interface DailyActivity {
  date: string;
  tasksCompleted: number;
  quizzesTaken: number;
  conceptsLearned: number;
  timeSpent: number;
}

class AnalyticsService {
  /**
   * Get comprehensive analytics for a user
   */
  async getUserAnalytics(userId: string): Promise<AnalyticsData> {
    try {
      // Get user's roadmaps
      const roadmapsRef = db.collection('users').doc(userId).collection('roadmaps');
      const roadmapsSnapshot = await roadmapsRef.get();
      
      // Get user's quiz history
      const quizzesRef = db.collection('users').doc(userId).collection('quizHistory');
      const quizzesSnapshot = await quizzesRef.orderBy('createdAt', 'desc').limit(50).get();
      
      // Get daily activities
      const activitiesRef = db.collection('users').doc(userId).collection('dailyActivities');
      const activitiesSnapshot = await activitiesRef.orderBy('date', 'desc').limit(30).get();
      
      // Calculate learning streak
      const streak = await this.calculateStreak(userId);
      
      // Calculate roadmap progress
      const roadmapProgress = this.calculateRoadmapProgress(roadmapsSnapshot);
      
      // Process quiz performance
      const quizPerformance = this.processQuizPerformance(quizzesSnapshot);
      
      // Calculate category progress
      const conceptCategories = this.calculateCategoryProgress(quizzesSnapshot);
      
      // Calculate total learning time
      const totalLearningTime = this.calculateTotalTime(activitiesSnapshot);
      
      // Get AI-enhanced insights
      const { confidenceScore, weaknesses, strengths, insights } = 
        await this.generateAIInsights(userId, quizPerformance, conceptCategories);
      
      return {
        userId,
        learningStreak: streak,
        roadmapProgress,
        quizPerformance,
        conceptCategories,
        totalLearningTime,
        skillsConfidenceScore: confidenceScore,
        weaknessAreas: weaknesses,
        strengthAreas: strengths,
        aiInsights: insights,
      };
    } catch (error) {
      logger.error('Error getting user analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate consecutive learning days
   */
  async calculateStreak(userId: string): Promise<number> {
    const activitiesRef = db.collection('users').doc(userId).collection('dailyActivities');
    const snapshot = await activitiesRef.orderBy('date', 'desc').limit(60).get();
    
    if (snapshot.empty) return 0;
    
    const dates = snapshot.docs.map(doc => doc.data().date as string);
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < dates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];
      
      if (dates.includes(expectedDateStr)) {
        streak++;
      } else if (i === 0) {
        // If today doesn't have activity, check from yesterday
        continue;
      } else {
        break;
      }
    }
    
    return streak;
  }

  /**
   * Calculate overall roadmap completion percentage
   */
  private calculateRoadmapProgress(snapshot: FirebaseFirestore.QuerySnapshot): number {
    if (snapshot.empty) return 0;
    
    let totalStages = 0;
    let completedStages = 0;
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const stages = data.stages || [];
      const completed = data.completedStages || [];
      
      totalStages += stages.length;
      completedStages += completed.length;
    });
    
    return totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
  }

  /**
   * Process quiz performance data
   */
  private processQuizPerformance(snapshot: FirebaseFirestore.QuerySnapshot): QuizPerformance[] {
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        date: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        score: data.score || 0,
        totalQuestions: data.totalQuestions || 0,
        category: data.category || 'General',
      };
    });
  }

  /**
   * Calculate progress by category
   */
  private calculateCategoryProgress(snapshot: FirebaseFirestore.QuerySnapshot): CategoryProgress[] {
    const categoryMap = new Map<string, { total: number; correct: number; count: number }>();
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const category = data.category || 'General';
      
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { total: 0, correct: 0, count: 0 });
      }
      
      const stats = categoryMap.get(category)!;
      stats.total += data.totalQuestions || 0;
      stats.correct += data.score || 0;
      stats.count++;
    });
    
    return Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      progress: Math.min(100, stats.count * 10), // 10% per quiz in category
      questionsAnswered: stats.total,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
    }));
  }

  /**
   * Calculate total learning time in minutes
   */
  private calculateTotalTime(snapshot: FirebaseFirestore.QuerySnapshot): number {
    return snapshot.docs.reduce((total, doc) => {
      return total + (doc.data().timeSpent || 0);
    }, 0);
  }

  /**
   * Generate AI-powered insights
   */
  private async generateAIInsights(
    _userId: string,
    quizPerformance: QuizPerformance[],
    categories: CategoryProgress[]
  ): Promise<{
    confidenceScore: number;
    weaknesses: string[];
    strengths: string[];
    insights: string;
  }> {
    try {
      // Calculate confidence score based on quiz performance
      const avgScore = quizPerformance.length > 0
        ? quizPerformance.reduce((sum, q) => sum + (q.score / q.totalQuestions) * 100, 0) / quizPerformance.length
        : 50;
      
      // Identify strengths and weaknesses
      const sortedCategories = [...categories].sort((a, b) => b.accuracy - a.accuracy);
      const strengths = sortedCategories.slice(0, 3).map(c => c.category);
      const weaknesses = sortedCategories.slice(-3).reverse().map(c => c.category);
      
      // Generate AI insights
      const prompt = `Based on a student's learning analytics:
- Average quiz score: ${avgScore.toFixed(1)}%
- Strong areas: ${strengths.join(', ') || 'Not enough data'}
- Weak areas: ${weaknesses.join(', ') || 'Not enough data'}
- Total quizzes taken: ${quizPerformance.length}

Provide a brief, encouraging 2-3 sentence personalized insight about their learning journey and one specific recommendation.`;

      const insights = await geminiService.generateText(prompt);
      
      return {
        confidenceScore: Math.round(avgScore),
        weaknesses: weaknesses.filter(w => w !== 'General'),
        strengths: strengths.filter(s => s !== 'General'),
        insights: insights || 'Keep up the great work! Continue practicing to improve your skills.',
      };
    } catch (error) {
      logger.error('Error generating AI insights:', error);
      return {
        confidenceScore: 50,
        weaknesses: [],
        strengths: [],
        insights: 'Continue your learning journey to unlock personalized insights!',
      };
    }
  }

  /**
   * Record daily activity
   */
  async recordActivity(
    userId: string,
    activity: Partial<DailyActivity>
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const activityRef = db.collection('users').doc(userId).collection('dailyActivities').doc(today);
    
    const existing = await activityRef.get();
    
    if (existing.exists) {
      const data = existing.data()!;
      await activityRef.update({
        tasksCompleted: (data.tasksCompleted || 0) + (activity.tasksCompleted || 0),
        quizzesTaken: (data.quizzesTaken || 0) + (activity.quizzesTaken || 0),
        conceptsLearned: (data.conceptsLearned || 0) + (activity.conceptsLearned || 0),
        timeSpent: (data.timeSpent || 0) + (activity.timeSpent || 0),
        updatedAt: new Date(),
      });
    } else {
      await activityRef.set({
        date: today,
        tasksCompleted: activity.tasksCompleted || 0,
        quizzesTaken: activity.quizzesTaken || 0,
        conceptsLearned: activity.conceptsLearned || 0,
        timeSpent: activity.timeSpent || 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
}

export const analyticsService = new AnalyticsService();
