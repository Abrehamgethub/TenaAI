import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import RoadmapStageCard from '../components/RoadmapStageCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Map, ArrowLeft, CheckCircle } from 'lucide-react';

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

const Roadmap = () => {
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // Load roadmap data from session storage
    const storedData = sessionStorage.getItem('currentRoadmap');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setRoadmapData(data);
      } catch (e) {
        console.error('Failed to parse roadmap data');
      }
    }
    setLoading(false);
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner text={t('common.loading')} />
      </div>
    );
  }

  if (!roadmapData || !roadmapData.stages?.length) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 text-gray-400 mb-4">
          <Map className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('roadmap.empty')}</h2>
        <p className="text-gray-500 mb-6">Create a career goal to get your personalized roadmap</p>
        <button
          onClick={() => navigate('/career-goal')}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Set Career Goal
        </button>
      </div>
    );
  }

  const progress = (completedStages.size / roadmapData.stages.length) * 100;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 mb-4">
              <Map className="h-4 w-4" />
              Your Roadmap
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{roadmapData.careerGoal}</h1>
            <p className="mt-2 text-gray-600">
              Follow these {roadmapData.stages.length} stages to achieve your goal
            </p>
          </div>
          {roadmapData.saved && (
            <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              <CheckCircle className="h-4 w-4" />
              Saved
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 rounded-lg bg-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-primary-600">
              {completedStages.size} / {roadmapData.stages.length} stages
            </span>
          </div>
          <div className="h-3 rounded-full bg-gray-200">
            <div
              className="h-3 rounded-full bg-primary-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-4">
        {roadmapData.stages.map((stage, index) => (
          <RoadmapStageCard
            key={index}
            stageNumber={index + 1}
            title={stage.title}
            description={stage.description}
            resources={stage.resources}
            duration={stage.duration}
            skills={stage.skills}
            isCompleted={completedStages.has(index)}
            onToggleComplete={() => toggleStageComplete(index)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate('/career-goal')}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          New Career Goal
        </button>
        <button
          onClick={() => navigate('/opportunities')}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700 transition-colors"
        >
          Find Opportunities
        </button>
      </div>
    </div>
  );
};

export default Roadmap;
