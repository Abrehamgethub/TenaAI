import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { dailyPlanApi, DailyTask, QuizQuestion } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import QuizModal from '../components/QuizModal';
import {
  Calendar,
  CheckCircle,
  Circle,
  Clock,
  Flame,
  BookOpen,
  Code,
  RefreshCw,
  Play,
  ExternalLink,
  Trophy,
} from 'lucide-react';

const DailyCoach = () => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [completingTask, setCompletingTask] = useState<string | null>(null);

  const { language: _language } = useLanguage();

  useEffect(() => {
    loadDailyPlan();
  }, []);

  const loadDailyPlan = async () => {
    try {
      setLoading(true);
      const response = await dailyPlanApi.get();
      if (response.success && response.data) {
        setTasks(response.data.tasks);
        setQuizQuestions(response.data.quizQuestions);
        setStreak(response.data.streak);
      }
    } catch (err) {
      console.error('Failed to load daily plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      setCompletingTask(taskId);
      const response = await dailyPlanApi.completeTask(taskId);
      if (response.success && response.data) {
        setTasks(response.data.tasks);
      }
    } catch (err) {
      console.error('Failed to complete task:', err);
    } finally {
      setCompletingTask(null);
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'learn':
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'practice':
        return <Code className="h-5 w-5 text-purple-500" />;
      case 'review':
        return <RefreshCw className="h-5 w-5 text-orange-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalTime = tasks.reduce((sum, t) => sum + t.estimatedTime, 0);
  const completedTime = tasks
    .filter(t => t.completed)
    .reduce((sum, t) => sum + t.estimatedTime, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Preparing your daily plan..." />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📅 Daily Learning Coach</h1>
          <p className="mt-2 text-gray-600">Your personalized learning tasks for today</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="font-semibold text-orange-700">{streak} day streak</span>
          </div>
          <button
            onClick={loadDailyPlan}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90">Today's Progress</p>
            <p className="text-3xl font-bold">
              {completedCount}/{tasks.length} tasks
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Time Invested</p>
            <p className="text-2xl font-bold">
              {completedTime}/{totalTime} min
            </p>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${(completedCount / Math.max(tasks.length, 1)) * 100}%` }}
          />
        </div>
        {completedCount === tasks.length && tasks.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-300" />
            <span className="font-medium">All tasks completed! Great job! 🎉</span>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg text-gray-900">Today's Tasks</h2>
        
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tasks yet. Set your career goal to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white rounded-xl p-4 border transition-all ${
                  task.completed
                    ? 'border-green-200 bg-green-50/50'
                    : 'border-gray-100 hover:border-primary-200 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Completion Toggle */}
                  <button
                    onClick={() => !task.completed && handleCompleteTask(task.id)}
                    disabled={task.completed || completingTask === task.id}
                    className="mt-1 flex-shrink-0"
                  >
                    {completingTask === task.id ? (
                      <div className="h-6 w-6 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
                    ) : task.completed ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-300 hover:text-primary-500 transition-colors" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getTaskIcon(task.type)}
                      <h3
                        className={`font-medium ${
                          task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}
                      >
                        {task.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                    
                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {task.estimatedTime} min
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {task.type}
                      </span>
                    </div>

                    {/* Resources */}
                    {task.resources.length > 0 && !task.completed && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {task.resources.slice(0, 2).map((resource, i) => (
                          <a
                            key={i}
                            href={resource.includes('http') ? resource : '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {resource.length > 30 ? resource.slice(0, 30) + '...' : resource}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily Quiz Section */}
      {quizQuestions.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                🧠 Daily Knowledge Check
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Test your understanding with {quizQuestions.length} quick questions
              </p>
            </div>
            <button
              onClick={() => setShowQuiz(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Play className="h-4 w-4" />
              Start Quiz
            </button>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuiz && (
        <QuizModal
          questions={quizQuestions}
          onClose={() => setShowQuiz(false)}
          onComplete={() => {
            setShowQuiz(false);
            loadDailyPlan();
          }}
        />
      )}
    </div>
  );
};

export default DailyCoach;
