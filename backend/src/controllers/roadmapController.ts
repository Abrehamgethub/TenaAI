import { Response } from 'express';
import { geminiService, AIError, AI_ERROR_CODES } from '../services/gemini';
import { firestoreService } from '../services/firestore';
import { logger } from '../services/logger';
import { AuthenticatedRequest, RoadmapRequest, ApiResponse, Roadmap } from '../types';

// Helper to map AI errors to structured responses
const mapAIError = (error: unknown): { message: string; code: string; status: number } => {
  if (error instanceof AIError) {
    const statusMap: Record<string, number> = {
      [AI_ERROR_CODES.AI_TIMEOUT]: 504,
      [AI_ERROR_CODES.AI_QUOTA]: 429,
      [AI_ERROR_CODES.AI_API_KEY_MISSING]: 503,
      [AI_ERROR_CODES.AI_NO_ANSWER]: 500,
      [AI_ERROR_CODES.AI_MALFORMED_RESPONSE]: 500,
      [AI_ERROR_CODES.LLM_ERROR]: 500,
    };
    return {
      message: error.message,
      code: error.code,
      status: statusMap[error.code] || 500,
    };
  }
  return {
    message: 'Failed to generate roadmap. Please try again.',
    code: AI_ERROR_CODES.LLM_ERROR,
    status: 500,
  };
};

export const roadmapController = {
  /**
   * Generate a new career roadmap
   */
  async generate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { 
        careerGoal, 
        currentSkillLevel, 
        preferredLanguage, 
        language,  // Alternative key
        user       // User context object
      } = req.body as RoadmapRequest & { 
        language?: string;
        user?: { age?: number; gender?: string };
      };
      const uid = req.user?.uid;

      // Use language or preferredLanguage (fallback to 'en')
      const effectiveLanguage = (language || preferredLanguage || 'en') as 'en' | 'am' | 'om' | 'tg' | 'so';
      
      // Extract user demographics
      const userAge = user?.age;
      const userGender = user?.gender;

      // Validate input (backup check - middleware should catch this)
      if (!careerGoal || careerGoal.trim().length < 3) {
        res.status(400).json({
          success: false,
          error: 'careerGoal_missing_or_invalid',
          message: 'A clear careerGoal string (min 3 chars) is required.',
          code: 'INVALID_INPUT',
        });
        return;
      }

      logger.info(`Generating roadmap for career: ${careerGoal}`, { 
        uid, 
        age: userAge, 
        gender: userGender, 
        language: effectiveLanguage 
      });

      // Generate roadmap using Gemini with retry, timeout, and demographic options
      const stages = await geminiService.generateRoadmap(
        careerGoal.trim(), 
        currentSkillLevel || 'beginner',
        { age: userAge, gender: userGender, language: effectiveLanguage }
      );

      let savedRoadmap: Roadmap | null = null;

      // Save to Firestore if user is authenticated - use correct path /users/{uid}/careerGoal/data
      if (uid) {
        savedRoadmap = await firestoreService.saveRoadmap(uid, careerGoal.trim(), stages);

        // Update user's career goals and save roadmap data
        await firestoreService.upsertUserProfile(uid, {
          careerGoals: [careerGoal.trim()],
          languagePreference: preferredLanguage,
        });
        
        // Also save to /users/{uid}/careerGoal/data path
        await firestoreService.saveCareerGoalData(uid, {
          careerGoal: careerGoal.trim(),
          stages,
          skillLevel: currentSkillLevel || 'beginner',
          language: preferredLanguage,
          updatedAt: new Date(),
        });
      }

      const response: ApiResponse<{ roadmap: typeof stages; saved?: Roadmap }> = {
        success: true,
        data: {
          roadmap: stages,
          ...(savedRoadmap && { saved: savedRoadmap }),
        },
        message: 'Career roadmap generated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error generating roadmap:', error);
      const errorInfo = mapAIError(error);
      res.status(errorInfo.status).json({
        success: false,
        error: errorInfo.message,
        code: errorInfo.code,
      });
    }
  },

  /**
   * Get user's saved roadmaps
   */
  async getUserRoadmaps(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
        return;
      }

      const roadmaps = await firestoreService.getUserRoadmaps(uid);

      res.status(200).json({
        success: true,
        data: roadmaps,
      });
    } catch (error) {
      logger.error('Error fetching roadmaps:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch roadmaps',
      });
    }
  },

  /**
   * Get a specific roadmap
   */
  async getRoadmap(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;
      const { roadmapId } = req.params;

      if (!uid) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
        return;
      }

      const roadmap = await firestoreService.getRoadmap(uid, roadmapId);

      if (!roadmap) {
        res.status(404).json({
          success: false,
          error: 'Roadmap not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: roadmap,
      });
    } catch (error) {
      logger.error('Error fetching roadmap:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch roadmap',
      });
    }
  },

  /**
   * Delete a roadmap
   */
  async deleteRoadmap(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;
      const { roadmapId } = req.params;

      if (!uid) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
        return;
      }

      await firestoreService.deleteRoadmap(uid, roadmapId);

      res.status(200).json({
        success: true,
        message: 'Roadmap deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting roadmap:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete roadmap',
      });
    }
  },
};

export default roadmapController;
