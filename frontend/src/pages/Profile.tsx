import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, Language } from '../context/LanguageContext';
import { profileApi } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Map, Bookmark, Globe, Loader2, Save } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  languagePreference: Language;
  careerGoals?: string[];
}

interface Roadmap {
  id: string;
  careerGoal: string;
  createdAt: string;
}

interface Opportunity {
  id?: string;
  title: string;
  provider: string;
  category: string;
}

const Profile = () => {
  const [_profile, setProfile] = useState<UserProfile | null>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');

  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileApi.get();
      if (response.success && response.data) {
        setProfile(response.data.profile);
        setName(response.data.profile.name || '');
        setRoadmaps(response.data.roadmaps || []);
        setOpportunities(response.data.savedOpportunities || []);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileApi.save({
        name,
        languagePreference: language,
      });
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = async (newLanguage: Language) => {
    setLanguage(newLanguage);
    try {
      await profileApi.updateLanguage(newLanguage);
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner text={t('common.loading')} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 mb-4">
          <User className="h-4 w-4" />
          Profile
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{t('profile.title')}</h1>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-2xl font-bold">
            {user?.displayName?.[0] || user?.email?.[0] || 'U'}
          </div>
          <div className="flex-1">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full max-w-md rounded-lg border border-gray-200 py-2 px-4 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <p className="text-gray-600">{user?.email}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="inline h-4 w-4 mr-1" />
                {t('profile.language')}
              </label>
              <div className="flex gap-2">
                {(['en', 'am', 'om'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      language === lang
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {lang === 'en' ? 'English' : lang === 'am' ? 'አማርኛ' : 'Oromiffa'}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>

      {/* Saved Roadmaps */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
          <Map className="h-5 w-5 text-primary-600" />
          {t('profile.savedRoadmaps')}
        </h2>
        {roadmaps.length > 0 ? (
          <div className="space-y-3">
            {roadmaps.map((roadmap) => (
              <div
                key={roadmap.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
              >
                <div>
                  <p className="font-medium text-gray-900">{roadmap.careerGoal}</p>
                  <p className="text-sm text-gray-500">
                    Created {new Date(roadmap.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No saved roadmaps yet</p>
        )}
      </div>

      {/* Saved Opportunities */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
          <Bookmark className="h-5 w-5 text-primary-600" />
          {t('profile.savedOpportunities')}
        </h2>
        {opportunities.length > 0 ? (
          <div className="space-y-3">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
              >
                <div>
                  <p className="font-medium text-gray-900">{opp.title}</p>
                  <p className="text-sm text-gray-500">
                    {opp.provider} - {opp.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No saved opportunities yet</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
