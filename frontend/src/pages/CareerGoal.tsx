import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { roadmapApi } from '../api';
import RoadmapStageCard from '../components/RoadmapStageCard';
import { 
  Target, Loader2, ArrowRight, Sparkles, RefreshCw, CheckCircle, Map, 
  ChevronDown, ChevronUp, Search, BarChart3, Brain, MessageCircle, Calendar 
} from 'lucide-react';

interface RoadmapStage {
  title: string;
  description: string;
  resources: string[];
  duration?: string;
  skills?: string[];
}

interface RoadmapData {
  careerGoal: string;
  stages: RoadmapStage[];
  saved?: { id: string };
}

const popularCareers = [
  'Software Developer',
  'Data Scientist',
  'UI/UX Designer',
  'Mobile App Developer',
  'Cybersecurity Analyst',
  'Cloud Engineer',
  'Machine Learning Engineer',
  'Web Developer',
];

const CareerGoal = () => {
  const [careerGoal, setCareerGoal] = useState('');
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set());
  const [isGoalExpanded, setIsGoalExpanded] = useState(true);

  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Load existing roadmap from session storage
  useEffect(() => {
    const storedData = sessionStorage.getItem('currentRoadmap');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setRoadmapData(data);
        setCareerGoal(data.careerGoal || '');
        setIsGoalExpanded(false);
      } catch (e) {
        console.error('Failed to parse roadmap data');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!careerGoal.trim()) {
      setError('Please enter a career goal');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await roadmapApi.generate(careerGoal.trim(), skillLevel, language);
      
      if (response.success && response.data && response.data.roadmap) {
        const newRoadmapData = {
          careerGoal: careerGoal.trim(),
          stages: response.data.roadmap,
          saved: response.data.saved,
        };
        // Store roadmap data
        sessionStorage.setItem('currentRoadmap', JSON.stringify(newRoadmapData));
        setRoadmapData(newRoadmapData);
        setCompletedStages(new Set());
        setIsGoalExpanded(false);
        setError('');
      } else {
        setError(response.error || t('roadmap.generateError'));
      }
    } catch (err: unknown) {
      console.error('Roadmap generation error:', err);
      const errorMessage = err instanceof Error ? err.message : t('roadmap.generateError');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectCareer = (career: string) => {
    setCareerGoal(career);
  };

  const toggleStageComplete = (stageIndex: number) => {
    setCompletedStages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stageIndex)) {
        newSet.delete(stageIndex);
      } else {
        newSet.add(stageIndex);
      }
      return newSet;
    });
  };

  const progress = roadmapData?.stages?.length 
    ? (completedStages.size / roadmapData.stages.length) * 100 
    : 0;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Career Goal Card - Sticky Header with Glassmorphism */}
      <div className={`sticky top-0 z-10 transition-all duration-300 ${!isGoalExpanded ? 'py-2' : ''}`}>
        <div className="rounded-2xl bg-white/80 backdrop-blur-lg shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
            onClick={() => setIsGoalExpanded(!isGoalExpanded)}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  {roadmapData ? 'Your Career Goal' : 'Set Your Career Goal'}
                </h2>
                {roadmapData && !isGoalExpanded && (
                  <p className="text-sm text-primary-600 font-medium">{roadmapData.careerGoal}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {roadmapData?.saved && (
                <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  Saved
                </span>
              )}
              {isGoalExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>

          {/* Expandable Form */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isGoalExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <form onSubmit={handleSubmit} className="p-4 pt-0 space-y-4">
              {/* Career Input */}
              <div>
                <div className="relative">
                  <Sparkles className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    placeholder={t('career.placeholder')}
                    className="w-full rounded-xl border border-gray-200 py-3 pl-12 pr-4 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  />
                </div>
              </div>

              {/* Popular Careers */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Popular choices
                </label>
                <div className="flex flex-wrap gap-2">
                  {popularCareers.map((career) => (
                    <button
                      key={career}
                      type="button"
                      onClick={() => selectCareer(career)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        careerGoal === career
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {career}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill Level */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Skill level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSkillLevel(level)}
                      className={`rounded-lg border py-2 text-sm font-medium capitalize transition-all ${
                        skillLevel === level
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !careerGoal.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 py-3 font-medium text-white hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t('career.loading')}
                  </>
                ) : roadmapData ? (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    Regenerate Roadmap
                  </>
                ) : (
                  <>
                    {t('career.submit')}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Roadmap Section */}
      {roadmapData?.stages?.length ? (
        <div className="space-y-4 animate-fade-in">
          {/* Progress Bar */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-lg shadow-md border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Map className="h-5 w-5 text-primary-600" />
                <span className="font-semibold text-gray-900">Your Learning Roadmap</span>
              </div>
              <span className="text-sm font-medium text-primary-600">
                {completedStages.size} / {roadmapData.stages.length} completed
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stages */}
          <div className="space-y-3">
            {roadmapData.stages.map((stage, index) => (
              <div 
                key={index}
                className="animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <RoadmapStageCard
                  stageNumber={index + 1}
                  title={stage.title}
                  description={stage.description}
                  resources={stage.resources}
                  duration={stage.duration}
                  skills={stage.skills}
                  isCompleted={completedStages.has(index)}
                  onToggleComplete={() => toggleStageComplete(index)}
                />
              </div>
            ))}
          </div>

          {/* Completion Message */}
          {progress === 100 && (
            <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center animate-fade-in">
              <CheckCircle className="h-12 w-12 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">🎉 Congratulations!</h3>
              <p className="opacity-90">You've completed all stages of your roadmap!</p>
            </div>
          )}

          {/* Secondary Actions */}
          <div className="rounded-2xl bg-white/80 backdrop-blur-lg shadow-lg border border-gray-100 p-6 animate-fade-in">
            <h3 className="font-semibold text-gray-900 mb-4">{t('career.roadmapStages')} - {t('common.loading').replace('...', '')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <button
                onClick={() => setIsGoalExpanded(true)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 border border-primary-200 transition-all group"
              >
                <Target className="h-6 w-6 text-primary-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-primary-700">{t('career.newGoal')}</span>
              </button>
              <button
                onClick={() => navigate('/opportunities')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 transition-all group"
              >
                <Search className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-blue-700">{t('career.findOpportunities')}</span>
              </button>
              <button
                onClick={() => navigate('/daily-coach')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border border-orange-200 transition-all group"
              >
                <Calendar className="h-6 w-6 text-orange-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-orange-700">{t('career.goToDailyCoach')}</span>
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 transition-all group"
              >
                <BarChart3 className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-green-700">{t('career.viewAnalytics')}</span>
              </button>
              <button
                onClick={() => navigate('/quiz')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 transition-all group"
              >
                <Brain className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-purple-700">{t('career.takeQuiz')}</span>
              </button>
              <button
                onClick={() => navigate('/tutor')}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 border border-pink-200 transition-all group"
              >
                <MessageCircle className="h-6 w-6 text-pink-600 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-pink-700">{t('career.talkToTutor')}</span>
              </button>
            </div>
          </div>
        </div>
      ) : !loading && (
        /* Info Card - Show only when no roadmap */
        <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 p-6 border border-primary-200">
          <h3 className="font-semibold text-primary-900 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-sm text-primary-800">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
              AI analyzes your career goal and skill level
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
              Creates a 5-stage personalized learning roadmap
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
              Recommends free resources for each stage
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
              Saves your roadmap for future reference
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default CareerGoal;
