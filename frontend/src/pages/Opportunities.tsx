import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { opportunitiesApi } from '../api';
import OpportunityCard from '../components/OpportunityCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Briefcase, Search, Loader2 } from 'lucide-react';

interface Opportunity {
  id?: string;
  title: string;
  provider: string;
  url: string;
  category: string;
  skillLevel: string;
  description?: string;
}

const categories = ['All', 'scholarship', 'internship', 'course', 'bootcamp', 'fellowship'];
const skillLevels = ['All', 'beginner', 'intermediate', 'advanced'];

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [careerGoal, setCareerGoal] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { t } = useLanguage();

  // Load career goal from session storage
  useEffect(() => {
    const storedRoadmap = sessionStorage.getItem('currentRoadmap');
    if (storedRoadmap) {
      try {
        const data = JSON.parse(storedRoadmap);
        if (data.careerGoal) {
          setCareerGoal(data.careerGoal);
        }
      } catch (e) {
        console.error('Failed to parse roadmap data');
      }
    }
  }, []);

  const handleSearch = async () => {
    if (!careerGoal.trim()) {
      setError('Please enter a career goal');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await opportunitiesApi.generate(
        careerGoal,
        selectedLevel !== 'All' ? selectedLevel : undefined,
        selectedCategory !== 'All' ? selectedCategory : undefined
      );

      if (response.success && response.data) {
        setOpportunities(response.data.opportunities);
      } else {
        setError(response.error || 'Failed to find opportunities');
      }
    } catch (err) {
      setError('Failed to find opportunities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (opportunity: Opportunity) => {
    try {
      const response = await opportunitiesApi.save(opportunity);
      if (response.success && response.data) {
        setSavedIds((prev) => new Set(prev).add(response.data!.id!));
      }
    } catch (err) {
      console.error('Failed to save opportunity');
    }
  };

  const handleUnsave = async (opportunityId: string) => {
    try {
      await opportunitiesApi.delete(opportunityId);
      setSavedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(opportunityId);
        return newSet;
      });
    } catch (err) {
      console.error('Failed to unsave opportunity');
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    if (selectedCategory !== 'All' && opp.category.toLowerCase() !== selectedCategory) {
      return false;
    }
    if (selectedLevel !== 'All' && opp.skillLevel.toLowerCase() !== selectedLevel) {
      return false;
    }
    return true;
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 mb-4">
          <Briefcase className="h-4 w-4" />
          Opportunities
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{t('opportunities.title')}</h1>
        <p className="mt-2 text-gray-600">
          Discover scholarships, internships, and programs matched to your goals
        </p>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Career Goal
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g., Software Developer, Data Scientist"
                className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-lg border border-gray-200 py-3 px-4 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="rounded-lg border border-gray-200 py-3 px-4 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              >
                {skillLevels.map((level) => (
                  <option key={level} value={level}>
                    {level === 'All' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={handleSearch}
          disabled={loading || !careerGoal.trim()}
          className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full md:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              {t('opportunities.generate')}
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner text="Finding opportunities..." />
        </div>
      ) : opportunities.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Found {filteredOpportunities.length} opportunities
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOpportunities.map((opportunity, index) => (
              <OpportunityCard
                key={opportunity.id || index}
                title={opportunity.title}
                provider={opportunity.provider}
                url={opportunity.url}
                category={opportunity.category}
                skillLevel={opportunity.skillLevel}
                description={opportunity.description}
                isSaved={opportunity.id ? savedIds.has(opportunity.id) : false}
                onSave={() => handleSave(opportunity)}
                onUnsave={() => opportunity.id && handleUnsave(opportunity.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 text-gray-400 mb-4">
            <Briefcase className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities yet</h3>
          <p className="text-gray-500">
            Enter your career goal and search to find relevant opportunities
          </p>
        </div>
      )}
    </div>
  );
};

export default Opportunities;
