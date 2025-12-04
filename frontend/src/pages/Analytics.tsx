import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { analyticsApi, AnalyticsData } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Target,
  Award,
  Clock,
  Flame,
  Brain,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

const Analytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { language: _language } = useLanguage();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsApi.get();
      if (response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading your analytics..." />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">{error || 'No analytics data available'}</p>
        <p className="text-sm text-gray-500 mt-2">Start learning to see your progress!</p>
      </div>
    );
  }

  // Prepare chart data
  const progressData = analytics.quizPerformance.slice(-7).map((q, i) => ({
    name: `Day ${i + 1}`,
    score: Math.round((q.score / q.totalQuestions) * 100),
  }));

  const categoryData = analytics.conceptCategories.map(c => ({
    category: c.category,
    accuracy: c.accuracy,
    progress: c.progress,
  }));

  const radarData = analytics.conceptCategories.slice(0, 6).map(c => ({
    subject: c.category.length > 10 ? c.category.slice(0, 10) + '...' : c.category,
    value: c.accuracy,
    fullMark: 100,
  }));

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📊 Learning Analytics</h1>
        <p className="mt-2 text-gray-600">Track your progress and identify areas for improvement</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-5 w-5" />
            <span className="text-sm opacity-90">Learning Streak</span>
          </div>
          <p className="text-3xl font-bold">{analytics.learningStreak}</p>
          <p className="text-sm opacity-75">days</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5" />
            <span className="text-sm opacity-90">Roadmap Progress</span>
          </div>
          <p className="text-3xl font-bold">{analytics.roadmapProgress}%</p>
          <p className="text-sm opacity-75">completed</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5" />
            <span className="text-sm opacity-90">Confidence Score</span>
          </div>
          <p className="text-3xl font-bold">{analytics.skillsConfidenceScore}%</p>
          <p className="text-sm opacity-75">AI assessed</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5" />
            <span className="text-sm opacity-90">Time Invested</span>
          </div>
          <p className="text-3xl font-bold">{Math.round(analytics.totalLearningTime / 60)}</p>
          <p className="text-sm opacity-75">hours</p>
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-2xl p-6 border border-primary-100">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Brain className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Learning Insights</h3>
            <p className="text-gray-700">{analytics.aiInsights}</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Progress Over Time */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            Progress Over Time
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Accuracy */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary-600" />
            Quiz Accuracy by Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="accuracy" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Skills Radar */}
      {radarData.length > 2 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Skills Radar</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Skills"
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Your Strengths
          </h3>
          {analytics.strengthAreas.length > 0 ? (
            <ul className="space-y-2">
              {analytics.strengthAreas.map((strength, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {strength}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Complete more quizzes to identify your strengths!</p>
          )}
        </div>

        {/* Areas to Improve */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-500" />
            Areas to Improve
          </h3>
          {analytics.weaknessAreas.length > 0 ? (
            <ul className="space-y-2">
              {analytics.weaknessAreas.map((weakness, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  {weakness}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Keep practicing to identify areas for improvement!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
