import { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { quizApi, QuizQuestion, QuizGradeResult } from '../api';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Trophy,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface QuizModalProps {
  questions: QuizQuestion[];
  onClose: () => void;
  onComplete: (result: QuizGradeResult) => void;
  sessionId?: string;
}

const QuizModal = ({ questions: rawQuestions, onClose, onComplete, sessionId }: QuizModalProps) => {
  // Ensure each question has a unique ID
  const questions = useMemo(() => {
    return rawQuestions.map((q, index) => ({
      ...q,
      id: q.id || `q_${index}_${Date.now()}`,
    }));
  }, [rawQuestions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState<QuizGradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { language } = useLanguage();

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  
  // Check if all questions are answered
  const allAnswered = useMemo(() => {
    return questions.every(q => answers[q.id] && answers[q.id].trim() !== '');
  }, [questions, answers]);
  
  const answeredCount = Object.keys(answers).filter(key => answers[key]?.trim()).length;

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      setError('Please answer all questions before submitting.');
      return;
    }
    
    try {
      setGrading(true);
      setError(null);
      const response = await quizApi.grade(answers, questions, sessionId, language);
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError('Failed to grade quiz. Please try again.');
      }
    } catch (err) {
      console.error('Failed to grade quiz:', err);
      setError('Failed to grade quiz. Please try again.');
    } finally {
      setGrading(false);
    }
  };

  const handleFinish = () => {
    if (result) {
      onComplete(result);
    }
    onClose();
  };

  // Results View
  if (result) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Quiz Results</h2>
              <button onClick={handleFinish} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Score */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
                result.percentage >= 80
                  ? 'bg-green-100'
                  : result.percentage >= 60
                  ? 'bg-yellow-100'
                  : 'bg-red-100'
              }`}>
                {result.percentage >= 80 ? (
                  <Trophy className="h-12 w-12 text-green-600" />
                ) : result.percentage >= 60 ? (
                  <CheckCircle className="h-12 w-12 text-yellow-600" />
                ) : (
                  <AlertCircle className="h-12 w-12 text-red-600" />
                )}
              </div>
              <p className="text-4xl font-bold text-gray-900">{result.percentage}%</p>
              <p className="text-gray-600">
                {result.score} out of {result.totalQuestions} correct
              </p>
            </div>

            {/* Overall Feedback */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-gray-700">{result.overallFeedback}</p>
            </div>

            {/* Question Feedback */}
            <div className="space-y-3 mb-6">
              <h3 className="font-semibold text-gray-900">Question Breakdown</h3>
              {result.feedback.map((fb, i) => (
                <div
                  key={fb.questionId}
                  className={`p-3 rounded-lg border ${
                    fb.isCorrect
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {fb.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Question {i + 1}
                      </p>
                      <p className="text-sm text-gray-600">{fb.feedback}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Areas to Improve */}
            {result.areasToImprove.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Areas to Improve</h3>
                <div className="flex flex-wrap gap-2">
                  {result.areasToImprove.map((area, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Finish Button */}
            <button
              onClick={handleFinish}
              className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz View
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Knowledge Check</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className="bg-primary-600 rounded-full h-2 transition-all"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">
              {currentIndex + 1}/{questions.length}
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="p-6">
          <div className="mb-6">
            <span className="text-xs text-primary-600 font-medium mb-2 block">
              {currentQuestion.category || 'General'} • {currentQuestion.difficulty || 'Medium'}
            </span>
            <h3 className="text-lg font-medium text-gray-900">{currentQuestion.question}</h3>
          </div>

          {/* Options */}
          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(option)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    answers[currentQuestion.id] === option
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                        answers[currentQuestion.id] === option
                          ? 'border-primary-500 bg-primary-500 text-white'
                          : 'border-gray-300 text-gray-500'
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-gray-700">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Short Answer */}
          {currentQuestion.type === 'short_answer' && (
            <div className="mb-6">
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-4 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none resize-none h-32"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Answer Status */}
          <div className="mb-4 text-sm text-gray-500 text-center">
            {answeredCount} of {questions.length} questions answered
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || grading}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {grading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Grading...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Submit Quiz ({answeredCount}/{questions.length})
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
                className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
