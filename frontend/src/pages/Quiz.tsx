import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { quizApi, QuizQuestion, QuizGradeResult } from '../api';
import QuizModal from '../components/QuizModal';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Brain,
  Play,
  Trophy,
  Target,
  Zap,
  Flame,
  History,
  Star,
} from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; icon: typeof Zap; color: string; description: string; questions: number }> = {
  easy: {
    label: 'Beginner',
    icon: Target,
    color: 'text-green-600 bg-green-100 border-green-200',
    description: 'Basic concepts and fundamentals',
    questions: 3,
  },
  medium: {
    label: 'Intermediate',
    icon: Zap,
    color: 'text-yellow-600 bg-yellow-100 border-yellow-200',
    description: 'Applied knowledge and deeper understanding',
    questions: 5,
  },
  hard: {
    label: 'Advanced',
    icon: Flame,
    color: 'text-red-600 bg-red-100 border-red-200',
    description: 'Complex problems and expert-level challenges',
    questions: 7,
  },
};

const TOPICS = [
  'Programming Basics',
  'Web Development',
  'Data Structures',
  'Algorithms',
  'Machine Learning',
  'Database Design',
  'System Design',
  'Computer Networks',
  'Cybersecurity',
  'Cloud Computing',
];

const Quiz = () => {
  const [topic, setTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [sessionId, setSessionId] = useState<string>();
  const [lastResult, setLastResult] = useState<QuizGradeResult | null>(null);
  const [error, setError] = useState('');

  const { language } = useLanguage();

  const selectedTopic = customTopic || topic;

  const handleGenerateQuiz = async () => {
    if (!selectedTopic.trim()) {
      setError('Please select or enter a topic');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await quizApi.generate(
        selectedTopic,
        difficulty,
        DIFFICULTY_CONFIG[difficulty].questions,
        language
      );

      if (response.success && response.data) {
        setQuestions(response.data.questions);
        setSessionId(response.data.sessionId);
        setShowQuiz(true);
      } else {
        setError('Failed to generate quiz. Please try again.');
      }
    } catch (err) {
      console.error('Failed to generate quiz:', err);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = (result: QuizGradeResult) => {
    setLastResult(result);
    setShowQuiz(false);
  };

  const DifficultyIcon = DIFFICULTY_CONFIG[difficulty].icon;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 mb-4">
          <Brain className="h-4 w-4" />
          Knowledge Quiz
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Test Your Knowledge</h1>
        <p className="mt-2 text-gray-600">
          Challenge yourself with quizzes at different difficulty levels
        </p>
      </div>

      {/* Last Result */}
      {lastResult && (
        <div className={`mb-6 p-4 rounded-xl border ${
          lastResult.percentage >= 80
            ? 'bg-green-50 border-green-200'
            : lastResult.percentage >= 60
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className={`h-8 w-8 ${
                lastResult.percentage >= 80
                  ? 'text-green-600'
                  : lastResult.percentage >= 60
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`} />
              <div>
                <p className="font-semibold text-gray-900">Last Quiz Result</p>
                <p className="text-sm text-gray-600">
                  {lastResult.score}/{lastResult.totalQuestions} correct ({lastResult.percentage}%)
                </p>
              </div>
            </div>
            <button
              onClick={() => setLastResult(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Quiz Setup */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
        {/* Topic Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose a Topic
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTopic(t);
                  setCustomTopic('');
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  topic === t && !customTopic
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => {
                setCustomTopic(e.target.value);
                setTopic('');
              }}
              placeholder="Or enter a custom topic..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
            />
          </div>
        </div>

        {/* Difficulty Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Difficulty
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG['easy']][]).map(
              ([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setDifficulty(key)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      difficulty === key
                        ? `${config.color} border-current`
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`h-5 w-5 ${difficulty === key ? '' : 'text-gray-400'}`} />
                      <span className={`font-semibold ${difficulty === key ? '' : 'text-gray-900'}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className={`text-sm ${difficulty === key ? 'opacity-90' : 'text-gray-500'}`}>
                      {config.description}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      {Array.from({ length: config.questions }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            difficulty === key ? 'fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className={`text-xs ml-1 ${difficulty === key ? '' : 'text-gray-400'}`}>
                        {config.questions} questions
                      </span>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Start Button */}
        <button
          onClick={handleGenerateQuiz}
          disabled={loading || !selectedTopic.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              Generating Quiz...
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Start {DIFFICULTY_CONFIG[difficulty].label} Quiz
            </>
          )}
        </button>

        {/* Quiz Info */}
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <DifficultyIcon className="h-4 w-4" />
            {DIFFICULTY_CONFIG[difficulty].questions} Questions
          </div>
          <div className="flex items-center gap-1">
            <History className="h-4 w-4" />
            ~{DIFFICULTY_CONFIG[difficulty].questions * 2} min
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {showQuiz && questions.length > 0 && (
        <QuizModal
          questions={questions}
          sessionId={sessionId}
          onClose={() => setShowQuiz(false)}
          onComplete={handleQuizComplete}
        />
      )}
    </div>
  );
};

export default Quiz;
