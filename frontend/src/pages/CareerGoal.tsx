import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { roadmapApi } from '../api';
import RoadmapStageCard from '../components/RoadmapStageCard';
import { 
  Compass, Loader2, Sparkles, RefreshCw, CheckCircle, 
  ChevronUp, Search, BarChart3, Brain, MessageCircle, Calendar,
  Edit3, Rocket
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
      setError(t('career.enterGoal') || 'Please enter a career goal');
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
      {/* Hero Card - Career Goal Display (when roadmap exists) */}
      {roadmapData && !isGoalExpanded && (
        <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-3xl p-6 text-white shadow-soft-lg animate-fade-in-up">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Compass className="h-8 w-8" />
              </div>
              <div>
                <p className="text-sm text-white/80 mb-1">{t('career.yourGoal') || 'Your career goal'}</p>
                <h1 className="text-2xl font-bold">{roadmapData.careerGoal}</h1>
                {roadmapData?.saved && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-white/90 bg-white/20 px-2 py-1 rounded-full mt-2">
                    <CheckCircle className="h-3 w-3" />
                    {t('career.saved') || 'Saved to your profile'}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsGoalExpanded(true)}
              className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              title={t('career.editGoal') || 'Edit goal'}
            >
              <Edit3 className="h-5 w-5" />
            </button>
          </div>
          {/* Mini Progress */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-white/80">{t('career.progress') || 'Your progress'}</span>
              <span className="font-medium">{completedStages.size} / {roadmapData.stages.length} {t('career.stepsComplete') || 'steps'}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Goal Form Card - Collapsible */}
      <div className={`transition-all duration-300 ${roadmapData && !isGoalExpanded ? 'hidden' : ''}`}>
        <div className="rounded-3xl bg-white shadow-card border border-surface-200 overflow-hidden">
          {/* Header */}
          {roadmapData && (
            <div 
              className="flex items-center justify-between p-5 cursor-pointer hover:bg-surface-50 transition-colors border-b border-surface-100"
              onClick={() => setIsGoalExpanded(!isGoalExpanded)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl">
                  <Compass className="h-5 w-5 text-primary-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-text-primary">{t('career.changeGoal') || 'Change your goal'}</h2>
                  <p className="text-sm text-text-muted">{t('career.currentGoal') || 'Currently:'} {roadmapData.careerGoal}</p>
                </div>
              </div>
              <ChevronUp className="h-5 w-5 text-text-muted" />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Career Input */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t('career.whatGoal') || 'What do you want to become?'}
              </label>
              <div className="relative">
                <Sparkles className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-400" />
                <input
                  type="text"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  placeholder={t('career.placeholder') || 'e.g., Software Developer, Data Scientist...'}
                  className="w-full rounded-2xl bg-surface-50 border border-surface-200 py-4 pl-12 pr-4 text-text-primary placeholder-text-muted focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100/50 transition-all"
                />
              </div>
            </div>

            {/* Popular Careers */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-3 uppercase tracking-wide">
                {t('career.popularChoices') || 'Popular choices'}
              </label>
              <div className="flex flex-wrap gap-2">
                {popularCareers.map((career) => (
                  <button
                    key={career}
                    type="button"
                    onClick={() => selectCareer(career)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      careerGoal === career
                        ? 'bg-primary-500 text-white shadow-button'
                        : 'bg-surface-100 text-text-secondary hover:bg-surface-200 hover:scale-[1.02]'
                    }`}
                  >
                    {career}
                  </button>
                ))}
              </div>
            </div>

            {/* Skill Level */}
            <div>
              <label className="block text-xs font-medium text-text-muted mb-3 uppercase tracking-wide">
                {t('career.skillLevel') || 'Your current level'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'beginner', label: t('career.beginner') || 'Beginner', icon: '🌱' },
                  { value: 'intermediate', label: t('career.intermediate') || 'Intermediate', icon: '🌿' },
                  { value: 'advanced', label: t('career.advanced') || 'Advanced', icon: '🌳' }
                ].map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setSkillLevel(level.value)}
                    className={`rounded-xl border-2 py-3 text-sm font-medium transition-all duration-200 ${
                      skillLevel === level.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-soft'
                        : 'border-surface-200 text-text-secondary hover:border-surface-300'
                    }`}
                  >
                    <span className="text-lg mr-1">{level.icon}</span> {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-700 flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !careerGoal.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 py-4 font-medium text-white hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-button hover:shadow-lg hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t('career.creating') || 'Creating your roadmap...'}
                </>
              ) : roadmapData ? (
                <>
                  <RefreshCw className="h-5 w-5" />
                  {t('career.regenerate') || 'Create New Roadmap'}
                </>
              ) : (
                <>
                  <Rocket className="h-5 w-5" />
                  {t('career.createRoadmap') || 'Create My Roadmap'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Roadmap Section */}
      {roadmapData?.stages?.length ? (
        <div className="space-y-4 animate-fade-in">
          {/* Section Title */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-xl">
              <Compass className="h-5 w-5 text-primary-500" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">{t('career.yourRoadmap') || 'Your Learning Path'}</h2>
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
                <Compass className="h-6 w-6 text-primary-600 group-hover:scale-110 transition-transform" />
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
