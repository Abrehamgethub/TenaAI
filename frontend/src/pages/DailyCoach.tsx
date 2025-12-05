import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { dailyPlanApi, DailyTask, QuizQuestion } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import QuizModal from '../components/QuizModal';
import {
  Calendar,
  Circle,
  Clock,
  Flame,
  BookOpen,
  Code,
  RefreshCw,
  Play,
  ExternalLink,
  Trophy,
  Sparkles,
  Check,
  Brain,
} from 'lucide-react';

const DailyCoach = () => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [completingTask, setCompletingTask] = useState<string | null>(null);

  const { t } = useLanguage();

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

  const toggleTask = async (taskId: string) => {
    try {
      setCompletingTask(taskId);
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      
      // Toggle the completed state
      const newCompletedState = !task.completed;
      
      // Optimistically update UI
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, completed: newCompletedState } : t
      ));
      
      // Call API to persist the change
      const response = await dailyPlanApi.toggleTask(taskId, newCompletedState);
      if (response.success && response.data) {
        setTasks(response.data.tasks);
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
      // Revert on error
      loadDailyPlan();
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
  const completedTime = tasks
    .filter(t => t.completed)
    .reduce((sum, t) => sum + t.estimatedTime, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text={t('dailyCoach.preparing')} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header - Calm and Welcoming */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
              <Sparkles className="h-6 w-6 text-primary-500" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">{t('dailyCoach.title') || 'Your Daily Plan'}</h1>
          </div>
          <p className="text-text-secondary">{t('dailyCoach.subtitle') || 'Small steps lead to big achievements'}</p>
          {/* Motivational Line */}
          <p className="mt-3 text-sm text-accent-500 font-medium flex items-center gap-2">
            ✨ {t('dailyCoach.motivation') || "You've got this. One step at a time."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Time Estimate */}
          <div className="flex items-center gap-2 bg-primary-50 px-4 py-2.5 rounded-full border border-primary-100">
            <Clock className="h-4 w-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700">{t('dailyCoach.aboutOneHour') || 'About 1 hour'}</span>
          </div>
          {/* Streak */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-2.5 rounded-full border border-orange-100">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-700">{streak} {t('dailyCoach.dayStreak') || 'day streak'}</span>
          </div>
          {/* Refresh */}
          <button
            onClick={loadDailyPlan}
            className="p-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 transition-all duration-200 hover:scale-105"
            title={t('dailyCoach.refresh') || 'Refresh plan'}
          >
            <RefreshCw className="h-5 w-5 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Progress Card - Soft and Encouraging */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-3xl p-6 text-white shadow-soft-lg">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm text-white/80 mb-1">{t('dailyCoach.todayProgress') || "Today's progress"}</p>
            <p className="text-3xl font-bold">
              {completedCount} <span className="text-lg font-normal text-white/70">/ {tasks.length}</span>
            </p>
            <p className="text-sm text-white/70 mt-1">{t('dailyCoach.tasksCompleted') || 'tasks completed'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80 mb-1">{t('dailyCoach.timeSpent') || 'Time invested'}</p>
            <p className="text-2xl font-bold">
              {completedTime} <span className="text-lg font-normal text-white/70">min</span>
            </p>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-white rounded-full h-2.5 transition-all duration-700 ease-out"
            style={{ width: `${(completedCount / Math.max(tasks.length, 1)) * 100}%` }}
          />
        </div>
        {/* Completion Message */}
        {completedCount === tasks.length && tasks.length > 0 && (
          <div className="mt-4 flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2.5 backdrop-blur-sm">
            <Trophy className="h-5 w-5 text-yellow-300" />
            <span className="font-medium">{t('dailyCoach.allDone') || "Amazing! You've completed today's plan!"}</span>
          </div>
        )}
      </div>

      {/* Task List - Clean and Calm */}
      <div className="space-y-4">
        <h2 className="font-semibold text-lg text-text-primary">{t('dailyCoach.todayTasks') || "Today's tasks"}</h2>
        
        {tasks.length === 0 ? (
          <div className="text-center py-16 bg-surface-50 rounded-3xl border border-surface-200">
            <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-text-muted" />
            </div>
            <p className="text-text-secondary">{t('dailyCoach.noTasks') || 'No tasks for today yet'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-5 border-2 transition-all duration-300 animate-fade-in-up ${
                  task.completed
                    ? 'border-accent-200 bg-gradient-to-r from-accent-50/50 to-white'
                    : 'border-surface-200 hover:border-primary-200 hover:shadow-soft'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Custom Checkbox - Large and Satisfying */}
                  <div className="mt-0.5 flex-shrink-0">
                    {completingTask === task.id ? (
                      <div className="h-7 w-7 border-2 border-primary-300 border-t-primary-500 rounded-lg animate-spin" />
                    ) : (
                      <label className="cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                          disabled={completingTask === task.id}
                          className="sr-only"
                          aria-label={task.completed ? t('dailyCoach.markIncomplete') : t('dailyCoach.markComplete')}
                        />
                        <div className={`h-7 w-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                          task.completed 
                            ? 'bg-accent-300 border-accent-300' 
                            : 'border-surface-300 group-hover:border-primary-400 group-hover:bg-primary-50'
                        }`}>
                          {task.completed && (
                            <Check className="h-4 w-4 text-white animate-check" />
                          )}
                        </div>
                      </label>
                    )}
                  </div>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`p-1.5 rounded-lg ${task.completed ? 'bg-accent-100' : 'bg-surface-100'}`}>
                        {getTaskIcon(task.type)}
                      </div>
                      <h3 className={`font-medium text-[15px] ${
                        task.completed ? 'text-text-muted line-through' : 'text-text-primary'
                      }`}>
                        {task.title}
                      </h3>
                    </div>
                    <p className={`text-sm mb-3 ${task.completed ? 'text-text-muted' : 'text-text-secondary'}`}>
                      {task.description}
                    </p>
                    
                    {/* Meta Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1.5 text-xs text-text-muted bg-surface-50 px-2.5 py-1 rounded-full">
                        <Clock className="h-3 w-3" />
                        {task.estimatedTime} min
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority === 'high' ? '!' : ''} {task.priority}
                      </span>
                    </div>

                    {/* Resources */}
                    {task.resources.length > 0 && !task.completed && (
                      <div className="mt-3 pt-3 border-t border-surface-100 flex flex-wrap gap-2">
                        {task.resources.slice(0, 2).map((resource, i) => (
                          <a
                            key={i}
                            href={resource.includes('http') ? resource : '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1.5 bg-primary-50 px-3 py-1.5 rounded-full transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {resource.length > 25 ? resource.slice(0, 25) + '...' : resource}
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

      {/* Daily Quiz Section - Modern Card */}
      {quizQuestions.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-3xl p-6 border border-purple-100/50 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-soft">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">
                  {t('dailyCoach.knowledgeCheck') || 'Quick Knowledge Check'}
                </h3>
                <p className="text-sm text-text-secondary mt-0.5">
                  {t('dailyCoach.testYourself') || 'Test what you learned today'} • {quizQuestions.length} {t('dailyCoach.questions') || 'questions'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowQuiz(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-medium shadow-soft hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              <Play className="h-4 w-4" />
              {t('dailyCoach.takeQuiz') || 'Take Quiz'}
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
