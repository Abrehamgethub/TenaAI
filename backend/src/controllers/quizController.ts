import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { geminiService, QuizQuestion } from '../services/gemini';
import { getFirestore } from '../config/firebase';
import { asyncHandler } from '../middleware/errorHandler';
import { analyticsService } from '../services/analytics';
import { logger } from '../services/logger';

const db = getFirestore();

export const quizController = {
  /**
   * Generate quiz questions for a topic
   */
  generate: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { topic, difficulty = 'medium', count = 5, language = 'en' } = req.body;
    
    logger.info(`Generating ${count} ${difficulty} quiz questions about: ${topic}`);
    
    const questions = await geminiService.generateQuiz(
      topic,
      difficulty as 'easy' | 'medium' | 'hard',
      count,
      language
    );
    
    // Store quiz session if user is authenticated
    if (req.user) {
      const quizRef = db.collection('users').doc(req.user.uid).collection('quizSessions').doc();
      await quizRef.set({
        id: quizRef.id,
        topic,
        difficulty,
        questions,
        createdAt: new Date(),
        status: 'active',
      });
      
      res.json({
        success: true,
        data: {
          sessionId: quizRef.id,
          questions: questions.map(q => ({
            ...q,
            correctAnswer: undefined, // Don't send correct answer to client
          })),
        },
      });
    } else {
      res.json({
        success: true,
        data: {
          questions: questions.map(q => ({
            ...q,
            correctAnswer: undefined,
          })),
        },
      });
    }
  }),

  /**
   * Grade quiz answers
   */
  grade: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { sessionId, answers, questions, language = 'en' } = req.body;
    
    let quizQuestions: QuizQuestion[] = questions;
    
    // If session ID provided, get questions from database
    if (sessionId && req.user) {
      const sessionRef = db.collection('users').doc(req.user.uid)
        .collection('quizSessions').doc(sessionId);
      const session = await sessionRef.get();
      
      if (session.exists) {
        quizQuestions = session.data()!.questions;
      }
    }
    
    logger.info('Grading quiz with', Object.keys(answers).length, 'answers');
    
    const result = await geminiService.gradeQuiz(quizQuestions, answers, language);
    
    // Save quiz result if authenticated
    if (req.user) {
      const historyRef = db.collection('users').doc(req.user.uid).collection('quizHistory').doc();
      await historyRef.set({
        id: historyRef.id,
        sessionId,
        score: result.score,
        totalQuestions: result.totalQuestions,
        percentage: result.percentage,
        category: quizQuestions[0]?.category || 'General',
        feedback: result.feedback,
        createdAt: new Date(),
      });
      
      // Record activity
      await analyticsService.recordActivity(req.user.uid, {
        quizzesTaken: 1,
        conceptsLearned: result.score,
      });
      
      // Update session status
      if (sessionId) {
        await db.collection('users').doc(req.user.uid)
          .collection('quizSessions').doc(sessionId)
          .update({ status: 'completed', result });
      }
    }
    
    res.json({
      success: true,
      data: result,
    });
  }),

  /**
   * Get quiz history
   */
  getHistory: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.uid;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const historyRef = db.collection('users').doc(userId).collection('quizHistory');
    const snapshot = await historyRef.orderBy('createdAt', 'desc').limit(limit).get();
    
    const history = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
    }));
    
    res.json({
      success: true,
      data: history,
    });
  }),
};
