import axios, { AxiosInstance, AxiosError } from 'axios';
import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds (Cloud Run cold start)
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      
      if (status === 401) {
        // Unauthorized - token expired or invalid
        console.error('Authentication error. Please login again.');
      } else if (status === 429) {
        // Rate limited
        console.error('Too many requests. Please wait a moment.');
      } else if (status >= 500) {
        // Server error
        console.error('Server error. Please try again later.');
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Type definitions for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface RoadmapStage {
  title: string;
  description: string;
  resources: string[];
  duration?: string;
  skills?: string[];
}

export interface Roadmap {
  id: string;
  careerGoal: string;
  stages: RoadmapStage[];
  createdAt: string;
}

export interface Opportunity {
  id?: string;
  title: string;
  provider: string;
  url: string;
  category: string;
  skillLevel: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  language: string;
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  languagePreference: 'en' | 'am' | 'om';
  careerGoals?: string[];
}
