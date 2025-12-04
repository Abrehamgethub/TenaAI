import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import config from '../config';
import { logger } from './logger';
import { PROMPTS } from '../config/prompts';
import {
  Language,
  RoadmapStage,
  Opportunity,
  GeminiRoadmapResponse,
  GeminiOpportunitiesResponse,
  GeminiSkillsResponse,
} from '../types';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  /**
   * Parse JSON from Gemini response, handling markdown code blocks
   */
  private parseJsonResponse<T>(text: string): T {
    // Remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    try {
      return JSON.parse(cleanedText) as T;
    } catch (error) {
      logger.error('Failed to parse Gemini JSON response:', { text: cleanedText, error });
      throw new Error('Failed to parse AI response');
    }
  }

  /**
   * Generate a career roadmap
   */
  async generateRoadmap(
    careerGoal: string,
    skillLevel?: string
  ): Promise<RoadmapStage[]> {
    try {
      const prompt = PROMPTS.roadmap(careerGoal, skillLevel);
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      logger.debug('Gemini roadmap response:', { text });

      const parsed = this.parseJsonResponse<GeminiRoadmapResponse>(text);
      return parsed.stages;
    } catch (error) {
      logger.error('Error generating roadmap:', error);
      throw new Error('Failed to generate career roadmap');
    }
  }

  /**
   * Explain a concept in the specified language
   */
  async explainConcept(
    concept: string,
    language: Language,
    context?: string
  ): Promise<string> {
    try {
      const prompt = PROMPTS.explain(concept, language, context);
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      logger.debug('Gemini explain response:', { language, concept: concept.substring(0, 50) });

      return text;
    } catch (error) {
      logger.error('Error explaining concept:', error);
      throw new Error('Failed to generate explanation');
    }
  }

  /**
   * Generate opportunity recommendations
   */
  async generateOpportunities(
    careerGoal: string,
    skillLevel?: string,
    category?: string
  ): Promise<Omit<Opportunity, 'id' | 'createdAt'>[]> {
    try {
      const prompt = PROMPTS.opportunities(careerGoal, skillLevel, category);
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      logger.debug('Gemini opportunities response:', { text });

      const parsed = this.parseJsonResponse<GeminiOpportunitiesResponse>(text);
      return parsed.opportunities;
    } catch (error) {
      logger.error('Error generating opportunities:', error);
      throw new Error('Failed to generate opportunities');
    }
  }

  /**
   * Evaluate skills and provide recommendations
   */
  async evaluateSkills(
    careerGoal: string,
    currentSkills: string[],
    experience?: string
  ): Promise<GeminiSkillsResponse & { assessment: string }> {
    try {
      const prompt = PROMPTS.skillsEval(careerGoal, currentSkills, experience);
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      logger.debug('Gemini skills eval response:', { text });

      const parsed = this.parseJsonResponse<GeminiSkillsResponse & { assessment: string }>(text);
      return parsed;
    } catch (error) {
      logger.error('Error evaluating skills:', error);
      throw new Error('Failed to evaluate skills');
    }
  }

  /**
   * General chat completion for the AI tutor
   */
  async chat(message: string, language: Language = 'en'): Promise<string> {
    try {
      const systemPrompt = `You are TenaAI, a friendly AI tutor helping Ethiopian youth learn and grow in their careers. 
      Respond in ${language === 'am' ? 'Amharic' : language === 'om' ? 'Afan Oromo' : 'English'}.
      Be encouraging, patient, and provide practical advice relevant to the Ethiopian context.`;

      const result = await this.model.generateContent(`${systemPrompt}\n\nUser: ${message}`);
      const response = result.response;
      return response.text();
    } catch (error) {
      logger.error('Error in chat:', error);
      throw new Error('Failed to generate chat response');
    }
  }

  /**
   * Generate simple text response
   */
  async generateText(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      logger.error('Error generating text:', error);
      throw new Error('Failed to generate text');
    }
  }

  /**
   * Detect language from text
   */
  async detectLanguage(text: string): Promise<Language> {
    try {
      const prompt = `Detect the language of this text and respond with only one of: "en", "am", or "om".
      Text: "${text}"
      
      Respond with only the language code, nothing else.`;
      
      const result = await this.model.generateContent(prompt);
      const detected = result.response.text().trim().toLowerCase();
      
      if (detected === 'am' || detected === 'amharic') return 'am';
      if (detected === 'om' || detected === 'oromo' || detected === 'afan oromo') return 'om';
      return 'en';
    } catch (error) {
      logger.error('Error detecting language:', error);
      return 'en';
    }
  }

  /**
   * Generate daily learning tasks
   */
  async generateDailyPlan(
    careerGoal: string,
    completedTopics: string[],
    skillLevel: string,
    language: Language = 'en'
  ): Promise<{
    tasks: DailyTask[];
    quizQuestions: QuizQuestion[];
  }> {
    try {
      const languageName = language === 'am' ? 'Amharic' : language === 'om' ? 'Afan Oromo' : 'English';
      
      const prompt = `Generate a personalized daily learning plan for someone pursuing ${careerGoal}.
      Their current skill level: ${skillLevel}
      Topics they've already completed: ${completedTopics.join(', ') || 'None yet'}
      
      Respond in ${languageName}.
      
      Return a JSON object with this exact structure:
      {
        "tasks": [
          {
            "id": "task_1",
            "title": "Task title",
            "description": "Brief description",
            "estimatedTime": 15,
            "type": "learn|practice|review",
            "priority": "high|medium|low",
            "resources": ["resource link or name"]
          }
        ],
        "quizQuestions": [
          {
            "id": "q_1",
            "question": "Question text?",
            "type": "multiple_choice",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "A",
            "explanation": "Why this is correct"
          }
        ]
      }
      
      Generate 4-6 tasks and 3-5 quiz questions. Make tasks progressive and relevant.`;

      const result = await this.model.generateContent(prompt);
      return this.parseJsonResponse<{ tasks: DailyTask[]; quizQuestions: QuizQuestion[] }>(
        result.response.text()
      );
    } catch (error) {
      logger.error('Error generating daily plan:', error);
      throw new Error('Failed to generate daily plan');
    }
  }

  /**
   * Generate quiz questions for a topic
   */
  async generateQuiz(
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    count: number = 5,
    language: Language = 'en'
  ): Promise<QuizQuestion[]> {
    try {
      const languageName = language === 'am' ? 'Amharic' : language === 'om' ? 'Afan Oromo' : 'English';
      
      const prompt = `Generate ${count} ${difficulty} quiz questions about "${topic}".
      Respond in ${languageName}.
      
      Return a JSON array with this structure:
      [
        {
          "id": "q_1",
          "question": "Question text?",
          "type": "multiple_choice",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option A",
          "explanation": "Explanation of why this is correct",
          "difficulty": "${difficulty}",
          "category": "${topic}"
        }
      ]
      
      Mix multiple choice and short answer questions. Ensure questions test understanding, not just memorization.`;

      const result = await this.model.generateContent(prompt);
      return this.parseJsonResponse<QuizQuestion[]>(result.response.text());
    } catch (error) {
      logger.error('Error generating quiz:', error);
      throw new Error('Failed to generate quiz');
    }
  }

  /**
   * Grade quiz answers
   */
  async gradeQuiz(
    questions: QuizQuestion[],
    answers: Record<string, string>,
    language: Language = 'en'
  ): Promise<QuizGradeResult> {
    try {
      const languageName = language === 'am' ? 'Amharic' : language === 'om' ? 'Afan Oromo' : 'English';
      
      const questionsWithAnswers = questions.map(q => ({
        question: q.question,
        correctAnswer: q.correctAnswer,
        userAnswer: answers[q.id] || 'No answer provided',
        type: q.type,
      }));

      const prompt = `Grade these quiz answers and provide feedback.
      Respond in ${languageName}.
      
      Questions and Answers:
      ${JSON.stringify(questionsWithAnswers, null, 2)}
      
      Return a JSON object:
      {
        "score": number (correct answers count),
        "totalQuestions": ${questions.length},
        "percentage": number,
        "feedback": [
          {
            "questionId": "q_1",
            "isCorrect": boolean,
            "feedback": "Specific feedback for this answer"
          }
        ],
        "overallFeedback": "Encouraging overall assessment",
        "areasToImprove": ["area1", "area2"],
        "strengths": ["strength1"]
      }`;

      const result = await this.model.generateContent(prompt);
      return this.parseJsonResponse<QuizGradeResult>(result.response.text());
    } catch (error) {
      logger.error('Error grading quiz:', error);
      throw new Error('Failed to grade quiz');
    }
  }

  /**
   * Explain concept with optional image description
   */
  async explainWithImage(
    concept: string,
    language: Language = 'en'
  ): Promise<{ explanation: string; shortExplanation: string; imageDescription: string }> {
    try {
      const languageName = language === 'am' ? 'Amharic' : language === 'om' ? 'Afan Oromo' : 'English';
      
      const prompt = `Explain the concept "${concept}" in ${languageName}.
      
      Return a JSON object:
      {
        "explanation": "Detailed explanation (3-4 paragraphs)",
        "shortExplanation": "Brief explanation (2-3 sentences, suitable for text-to-speech)",
        "imageDescription": "Detailed description of a diagram that would help visualize this concept. Be specific about shapes, labels, arrows, and layout."
      }`;

      const result = await this.model.generateContent(prompt);
      return this.parseJsonResponse<{
        explanation: string;
        shortExplanation: string;
        imageDescription: string;
      }>(result.response.text());
    } catch (error) {
      logger.error('Error explaining concept:', error);
      throw new Error('Failed to explain concept');
    }
  }
}

// Types for new features
export interface DailyTask {
  id: string;
  title: string;
  description: string;
  estimatedTime: number;
  type: 'learn' | 'practice' | 'review';
  priority: 'high' | 'medium' | 'low';
  resources: string[];
  completed?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty?: string;
  category?: string;
}

export interface QuizGradeResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  feedback: Array<{
    questionId: string;
    isCorrect: boolean;
    feedback: string;
  }>;
  overallFeedback: string;
  areasToImprove: string[];
  strengths: string[];
}

// Export singleton instance
export const geminiService = new GeminiService();
export default geminiService;
