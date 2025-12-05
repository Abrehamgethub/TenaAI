import { Response } from 'express';
import { geminiService } from '../services/gemini';
import { firestoreService } from '../services/firestore';
import { logger } from '../services/logger';
import { AuthenticatedRequest, RoadmapRequest, ApiResponse, Roadmap } from '../types';

export const roadmapController = {
  /**
   * Generate a new career roadmap
   */
  async generate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { careerGoal, currentSkillLevel, preferredLanguage } = req.body as RoadmapRequest;
      const uid = req.user?.uid;

      // Validate input
      if (!careerGoal || careerGoal.trim().length < 3) {
        res.status(400).json({
          success: false,
          error: 'Career goal is required and must be at least 3 characters',
        });
        return;
      }

      logger.info(`Generating roadmap for career: ${careerGoal}`, { uid });

      // Generate roadmap using Gemini with safe error handling
      let stages;
      try {
        stages = await geminiService.generateRoadmap(careerGoal.trim(), currentSkillLevel || 'beginner');
      } catch (genError) {
        logger.error('Gemini generation error:', genError);
        res.status(500).json({
          success: false,
          error: 'AI service temporarily unavailable. Please try again.',
        });
        return;
      }

      // Validate generated stages
      if (!stages || !Array.isArray(stages) || stages.length === 0) {
        res.status(500).json({
          success: false,
          error: 'Failed to generate valid roadmap stages. Please try again.',
        });
        return;
      }

      let savedRoadmap: Roadmap | null = null;

      // Save to Firestore if user is authenticated
      if (uid) {
        savedRoadmap = await firestoreService.saveRoadmap(uid, careerGoal, stages);

        // Update user's career goals
        await firestoreService.upsertUserProfile(uid, {
          careerGoals: [careerGoal],
          languagePreference: preferredLanguage,
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
      res.status(500).json({
        success: false,
        error: 'Failed to generate career roadmap',
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
