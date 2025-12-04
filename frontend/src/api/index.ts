import apiClient, {
  ApiResponse,
  RoadmapStage,
  Roadmap,
  Opportunity,
  UserProfile,
} from './client';

// ==================== Roadmap API ====================

export const roadmapApi = {
  /**
   * Generate a new career roadmap
   */
  generate: async (
    careerGoal: string,
    currentSkillLevel?: string,
    preferredLanguage?: string
  ): Promise<ApiResponse<{ roadmap: RoadmapStage[]; saved?: Roadmap }>> => {
    const response = await apiClient.post('/roadmap', {
      careerGoal,
      currentSkillLevel,
      preferredLanguage,
    });
    return response.data;
  },

  /**
   * Get user's saved roadmaps
   */
  getSaved: async (): Promise<ApiResponse<Roadmap[]>> => {
    const response = await apiClient.get('/roadmap');
    return response.data;
  },

  /**
   * Get a specific roadmap
   */
  getById: async (roadmapId: string): Promise<ApiResponse<Roadmap>> => {
    const response = await apiClient.get(`/roadmap/${roadmapId}`);
    return response.data;
  },

  /**
   * Delete a roadmap
   */
  delete: async (roadmapId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/roadmap/${roadmapId}`);
    return response.data;
  },
};

// ==================== Tutor/Explain API ====================

export const tutorApi = {
  /**
   * Explain a concept
   */
  explain: async (
    concept: string,
    language: 'en' | 'am' | 'om',
    context?: string
  ): Promise<ApiResponse<{ explanation: string; language: string }>> => {
    const response = await apiClient.post('/explain', {
      concept,
      language,
      context,
    });
    return response.data;
  },

  /**
   * Chat with AI tutor
   */
  chat: async (
    message: string,
    language?: 'en' | 'am' | 'om',
    historyId?: string
  ): Promise<ApiResponse<{ response: string; historyId?: string }>> => {
    const response = await apiClient.post('/explain/chat', {
      message,
      language,
      historyId,
    });
    return response.data;
  },

  /**
   * Get all chat histories (list)
   */
  getAllHistories: async (): Promise<ApiResponse<ChatHistorySummary[]>> => {
    const response = await apiClient.get('/explain/history');
    return response.data;
  },

  /**
   * Get specific chat history with messages
   */
  getHistory: async (historyId: string): Promise<ApiResponse<ChatMessage[]>> => {
    const response = await apiClient.get(`/explain/history/${historyId}`);
    return response.data;
  },
};

// Chat history types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  language: string;
  timestamp: string;
}

export interface ChatHistorySummary {
  historyId: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  updatedAt: string;
  createdAt: string;
}

// ==================== Opportunities API ====================

export const opportunitiesApi = {
  /**
   * Generate opportunity recommendations
   */
  generate: async (
    careerGoal: string,
    skillLevel?: string,
    category?: string
  ): Promise<ApiResponse<{ opportunities: Opportunity[]; careerGoal: string }>> => {
    const response = await apiClient.post('/opportunities', {
      careerGoal,
      skillLevel,
      category,
    });
    return response.data;
  },

  /**
   * Save/bookmark an opportunity
   */
  save: async (
    opportunity: Omit<Opportunity, 'id'>
  ): Promise<ApiResponse<Opportunity>> => {
    const response = await apiClient.post('/opportunities/save', opportunity);
    return response.data;
  },

  /**
   * Get saved opportunities
   */
  getSaved: async (): Promise<ApiResponse<Opportunity[]>> => {
    const response = await apiClient.get('/opportunities/saved');
    return response.data;
  },

  /**
   * Delete a saved opportunity
   */
  delete: async (opportunityId: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/opportunities/${opportunityId}`);
    return response.data;
  },
};

// ==================== Skills Evaluation API ====================

export const skillsApi = {
  /**
   * Evaluate skills and get recommendations
   */
  evaluate: async (
    careerGoal: string,
    currentSkills: string[],
    experience?: string
  ): Promise<
    ApiResponse<{
      careerGoal: string;
      currentSkills: string[];
      assessment: string;
      skillGaps: string[];
      recommendations: string[];
    }>
  > => {
    const response = await apiClient.post('/skills-eval', {
      careerGoal,
      currentSkills,
      experience,
    });
    return response.data;
  },
};

// ==================== Profile API ====================

export const profileApi = {
  /**
   * Save/update user profile
   */
  save: async (
    profileData: Partial<Pick<UserProfile, 'name' | 'languagePreference' | 'careerGoals'>>
  ): Promise<ApiResponse<UserProfile>> => {
    const response = await apiClient.post('/profile/save', profileData);
    return response.data;
  },

  /**
   * Get user profile with related data
   */
  get: async (): Promise<
    ApiResponse<{
      profile: UserProfile;
      roadmaps: Roadmap[];
      savedOpportunities: Opportunity[];
    }>
  > => {
    const response = await apiClient.get('/profile/get');
    return response.data;
  },

  /**
   * Update language preference
   */
  updateLanguage: async (
    languagePreference: 'en' | 'am' | 'om'
  ): Promise<ApiResponse<void>> => {
    const response = await apiClient.put('/profile/language', {
      languagePreference,
    });
    return response.data;
  },
};

// ==================== Analytics API ====================

export const analyticsApi = {
  /**
   * Get user analytics dashboard
   */
  get: async (): Promise<ApiResponse<AnalyticsData>> => {
    const response = await apiClient.get('/analytics');
    return response.data;
  },

  /**
   * Get learning streak
   */
  getStreak: async (): Promise<ApiResponse<{ streak: number }>> => {
    const response = await apiClient.get('/analytics/streak');
    return response.data;
  },

  /**
   * Record activity
   */
  recordActivity: async (activity: {
    tasksCompleted?: number;
    quizzesTaken?: number;
    conceptsLearned?: number;
    timeSpent?: number;
  }): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/analytics/activity', activity);
    return response.data;
  },
};

// ==================== Quiz API ====================

export const quizApi = {
  /**
   * Generate quiz questions
   */
  generate: async (
    topic: string,
    difficulty?: 'easy' | 'medium' | 'hard',
    count?: number,
    language?: string
  ): Promise<ApiResponse<{ sessionId?: string; questions: QuizQuestion[] }>> => {
    const response = await apiClient.post('/quiz/generate', {
      topic,
      difficulty,
      count,
      language,
    });
    return response.data;
  },

  /**
   * Grade quiz answers
   */
  grade: async (
    answers: Record<string, string>,
    questions?: QuizQuestion[],
    sessionId?: string,
    language?: string
  ): Promise<ApiResponse<QuizGradeResult>> => {
    const response = await apiClient.post('/quiz/grade', {
      answers,
      questions,
      sessionId,
      language,
    });
    return response.data;
  },

  /**
   * Get quiz history
   */
  getHistory: async (limit?: number): Promise<ApiResponse<QuizHistoryItem[]>> => {
    const response = await apiClient.get('/quiz/history', { params: { limit } });
    return response.data;
  },
};

// ==================== Daily Plan API ====================

export const dailyPlanApi = {
  /**
   * Get or generate today's daily plan
   */
  get: async (): Promise<ApiResponse<DailyPlanData>> => {
    const response = await apiClient.get('/daily-plan');
    return response.data;
  },

  /**
   * Mark task as completed
   */
  completeTask: async (taskId: string, date?: string): Promise<ApiResponse<{ tasks: DailyTask[] }>> => {
    const response = await apiClient.post('/daily-plan/complete', { taskId, date });
    return response.data;
  },

  /**
   * Get plan history
   */
  getHistory: async (limit?: number): Promise<ApiResponse<DailyPlanHistory[]>> => {
    const response = await apiClient.get('/daily-plan/history', { params: { limit } });
    return response.data;
  },

  /**
   * Set career goal
   */
  setCareerGoal: async (careerGoal: string, skillLevel: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/daily-plan/career-goal', { careerGoal, skillLevel });
    return response.data;
  },
};

// Types for new features
export interface AnalyticsData {
  userId: string;
  learningStreak: number;
  roadmapProgress: number;
  quizPerformance: Array<{
    date: string;
    score: number;
    totalQuestions: number;
    category: string;
  }>;
  conceptCategories: Array<{
    category: string;
    progress: number;
    questionsAnswered: number;
    accuracy: number;
  }>;
  totalLearningTime: number;
  skillsConfidenceScore: number;
  weaknessAreas: string[];
  strengthAreas: string[];
  aiInsights: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'short_answer';
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
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

export interface QuizHistoryItem {
  id: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  category: string;
  createdAt: string;
}

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

export interface DailyPlanData {
  date: string;
  tasks: DailyTask[];
  quizQuestions: QuizQuestion[];
  streak: number;
}

export interface DailyPlanHistory {
  date: string;
  tasksCompleted: number;
  totalTasks: number;
}

// ==================== TTS API ====================

export const ttsApi = {
  /**
   * Synthesize text to speech (for Amharic)
   */
  synthesize: async (
    text: string,
    language: 'am' | 'en' | 'om'
  ): Promise<ApiResponse<{ audioContent: string; format: string; language: string }>> => {
    const response = await apiClient.post('/tts', { text, language });
    return response.data;
  },

  /**
   * Get supported TTS languages
   */
  getSupportedLanguages: async (): Promise<ApiResponse<{ languages: Array<{ code: string; name: string; supported: boolean }> }>> => {
    const response = await apiClient.get('/tts/languages');
    return response.data;
  },
};

export default {
  roadmap: roadmapApi,
  tutor: tutorApi,
  opportunities: opportunitiesApi,
  skills: skillsApi,
  profile: profileApi,
  analytics: analyticsApi,
  quiz: quizApi,
  dailyPlan: dailyPlanApi,
  tts: ttsApi,
};
