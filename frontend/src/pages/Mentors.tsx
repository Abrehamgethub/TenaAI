import { useState } from 'react';
import { 
  Users, 
  Search, 
  Briefcase, 
  MapPin, 
  Linkedin,
  Filter,
  Sparkles,
  UserPlus,
  X,
  CheckCircle,
  Loader2,
  Star
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Mentor {
  id: string;
  name: string;
  fullName: string; // Used for LinkedIn search
  title: string;
  company: string;
  location: string;
  expertise: string[];
  primaryExpertise: string; // For filtering
  scope: 'local' | 'international' | 'both';
  bio: string;
  experience: string;
  availability: 'available' | 'busy' | 'limited';
  rating: number;
  mentees: number;
  image?: string;
}

// Generate LinkedIn search URL from mentor's full name
const getLinkedInSearchUrl = (fullName: string): string => {
  return `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(fullName)}`;
};

// Real, verifiable Ethiopian tech mentors - only globally findable profiles
const sampleMentors: Mentor[] = [
  {
    id: '1',
    name: 'Dr. Betelhem Dessie',
    fullName: 'Betelhem Dessie',
    title: 'AI & Robotics Expert, Founder',
    company: 'iCog Labs / Anyone Can Code',
    location: 'Addis Ababa',
    expertise: ['Artificial Intelligence', 'Machine Learning', 'Robotics', 'Education'],
    primaryExpertise: 'AI & Machine Learning',
    scope: 'international',
    bio: 'Youngest CEO in Ethiopian tech, leading AI research and education initiatives for African youth.',
    experience: '10+ years',
    availability: 'limited',
    rating: 4.9,
    mentees: 150,
  },
  {
    id: '2',
    name: 'Markos Lemma',
    fullName: 'Markos Lemma iCog',
    title: 'Co-Founder & CEO',
    company: 'iCog Labs',
    location: 'Addis Ababa',
    expertise: ['AI Research', 'Entrepreneurship', 'Robotics', 'Tech Leadership'],
    primaryExpertise: 'AI & Machine Learning',
    scope: 'local',
    bio: 'Building Ethiopia\'s premier AI research lab. Passionate about developing local tech talent.',
    experience: '12+ years',
    availability: 'limited',
    rating: 4.9,
    mentees: 80,
  },
  {
    id: '3',
    name: 'Bethlehem Tilahun Alemu',
    fullName: 'Bethlehem Tilahun Alemu',
    title: 'Founder & CEO',
    company: 'soleRebels / Garden of Coffee',
    location: 'Addis Ababa',
    expertise: ['Entrepreneurship', 'Social Enterprise', 'Branding', 'Sustainability'],
    primaryExpertise: 'Entrepreneurship',
    scope: 'international',
    bio: 'Award-winning entrepreneur building globally recognized Ethiopian brands.',
    experience: '15+ years',
    availability: 'busy',
    rating: 4.9,
    mentees: 200,
  },
  {
    id: '4',
    name: 'Tewodros Ashenafi',
    fullName: 'Tewodros Ashenafi SouthWest',
    title: 'Chairman & CEO',
    company: 'SouthWest Energy',
    location: 'Addis Ababa',
    expertise: ['Business Strategy', 'Energy', 'Investment', 'Leadership'],
    primaryExpertise: 'Business Strategy',
    scope: 'local',
    bio: 'Leading Ethiopian business executive with expertise in building large-scale enterprises.',
    experience: '20+ years',
    availability: 'limited',
    rating: 4.8,
    mentees: 50,
  },
];

// Mentor application form interface
interface MentorApplication {
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  bio: string;
  expertise: string;
}

// Derive expertise areas from mentors' primaryExpertise
const expertiseAreas = ['All', ...new Set(sampleMentors.map(m => m.primaryExpertise))];

// Scope options
const scopeOptions = ['All', 'Local', 'International'] as const;
type ScopeFilter = typeof scopeOptions[number];

const Mentors = () => {
  const [mentors] = useState<Mentor[]>(sampleMentors);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('All');
  const [selectedScope, setSelectedScope] = useState<ScopeFilter>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [showMentorForm, setShowMentorForm] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formData, setFormData] = useState<MentorApplication>({
    fullName: '',
    email: '',
    phone: '',
    linkedinUrl: '',
    bio: '',
    expertise: '',
  });

  const { t } = useLanguage();
  const { user } = useAuth();

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMentorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const db = getFirestore();
      await addDoc(collection(db, 'mentorApplications'), {
        ...formData,
        userId: user?.uid || null,
        userEmail: user?.email || formData.email,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setFormSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        linkedinUrl: '',
        bio: '',
        expertise: '',
      });

      // Hide success message after 3 seconds
      setTimeout(() => {
        setFormSuccess(false);
        setShowMentorForm(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting mentor application:', error);
      alert(t('mentors.submitError') || 'Failed to submit application. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch = 
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesExpertise = 
      selectedExpertise === 'All' || 
      mentor.primaryExpertise === selectedExpertise;
    
    const matchesScope = 
      selectedScope === 'All' ||
      mentor.scope === selectedScope.toLowerCase() ||
      mentor.scope === 'both';
    
    return matchesSearch && matchesExpertise && matchesScope;
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'limited': return 'bg-yellow-100 text-yellow-700';
      case 'busy': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available': return 'Available';
      case 'limited': return 'Limited Availability';
      case 'busy': return 'Currently Busy';
      default: return availability;
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header - Warm and Welcoming */}
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl">
          <Users className="h-7 w-7 text-primary-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('mentors.title') || 'Meet Your Mentors'}</h1>
          <p className="text-text-secondary">{t('mentors.subtitle') || 'Connect with experienced professionals who can guide you'}</p>
        </div>
      </div>

      {/* AI Matching Banner - Modern Gradient */}
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-3xl p-6 text-white shadow-soft-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{t('mentors.aiMatching') || 'Personalized Recommendations'}</h3>
            <p className="text-white/80 mt-1">
              {t('mentors.aiMatchingDesc') || 'Based on your goals, we suggest mentors who can best guide your journey.'}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters - Clean Design */}
      <div className="bg-white rounded-2xl p-5 shadow-card border border-surface-200">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('mentors.searchPlaceholder') || 'Search by name, skill, or company...'}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-surface-50 border border-surface-200 text-text-primary placeholder-text-muted focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100/50 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-medium transition-all duration-200 ${
              showFilters 
                ? 'bg-primary-50 text-primary-600 border border-primary-200' 
                : 'bg-surface-100 text-text-secondary hover:bg-surface-200 border border-surface-200'
            }`}
          >
            <Filter className="h-5 w-5" />
            {t('mentors.filters') || 'Filters'}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-surface-100 animate-fade-in space-y-4">
            {/* Expertise Filter */}
            <div>
              <p className="text-xs font-medium text-text-muted mb-3 uppercase tracking-wide">{t('mentors.expertiseArea') || 'Expertise Area'}</p>
              <div className="flex flex-wrap gap-2">
                {expertiseAreas.map((area) => (
                  <button
                    key={area}
                    onClick={() => setSelectedExpertise(area)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedExpertise === area
                        ? 'bg-primary-500 text-white shadow-button'
                        : 'bg-surface-100 text-text-secondary hover:bg-surface-200 hover:scale-[1.02]'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Scope Filter */}
            <div>
              <p className="text-xs font-medium text-text-muted mb-3 uppercase tracking-wide">{t('mentors.scope') || 'Scope'}</p>
              <div className="flex gap-2">
                {scopeOptions.map((scope) => (
                  <button
                    key={scope}
                    onClick={() => setSelectedScope(scope)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedScope === scope
                        ? 'bg-accent-300 text-white shadow-button'
                        : 'bg-surface-100 text-text-secondary hover:bg-surface-200'
                    }`}
                  >
                    {scope === 'All' ? (t('mentors.all') || 'All') : scope}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-text-secondary">
          <span className="font-semibold text-text-primary">{filteredMentors.length}</span> {t('mentors.found') || 'mentors found'}
        </p>
      </div>

      {/* Mentor Cards - Uniform Height Design */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredMentors.map((mentor, index) => (
          <div
            key={mentor.id}
            className="bg-white rounded-2xl p-6 shadow-card border border-surface-200 hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in-up flex flex-col min-h-[320px]"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-lg font-bold shadow-soft flex-shrink-0">
                {mentor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-primary truncate">{mentor.name}</h3>
                <p className="text-sm text-text-secondary truncate">{mentor.title}</p>
                <div className="flex items-center gap-1.5 text-sm text-text-muted mt-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span className="truncate">{mentor.company}</span>
                </div>
              </div>
            </div>

            {/* Badges Row - Availability + Scope */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(mentor.availability)}`}>
                {getAvailabilityText(mentor.availability)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                mentor.scope === 'international' 
                  ? 'bg-blue-100 text-blue-700' 
                  : mentor.scope === 'local' 
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {mentor.scope === 'international' ? '🌍 International' : mentor.scope === 'local' ? '📍 Local' : '🌐 Both'}
              </span>
            </div>

            {/* Bio - flex-1 to push button to bottom */}
            <p className="mt-3 text-sm text-text-secondary leading-relaxed line-clamp-2 flex-1">{mentor.bio}</p>

            {/* Primary Expertise Tag */}
            <div className="mt-3">
              <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-medium">
                {mentor.primaryExpertise}
              </span>
            </div>

            {/* Stats Row */}
            <div className="mt-3 flex items-center gap-3 text-xs text-text-muted">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span className="font-medium text-text-secondary">{mentor.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>{mentor.mentees}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{mentor.location.split(' / ')[0]}</span>
              </div>
            </div>

            {/* LinkedIn Button - Aligned at bottom */}
            <div className="mt-4 pt-4 border-t border-surface-100">
              <a
                href={getLinkedInSearchUrl(mentor.fullName)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0A66C2] text-white rounded-xl hover:bg-[#004182] transition-all duration-200 font-medium text-sm"
              >
                <Linkedin className="h-4 w-4" />
                {t('mentors.viewProfile') || 'View LinkedIn Profile'}
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <div className="text-center py-16 bg-surface-50 rounded-3xl border border-surface-200">
          <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-text-muted" />
          </div>
          <h3 className="text-lg font-medium text-text-primary">{t('mentors.noResults') || 'No mentors found'}</h3>
          <p className="text-text-secondary mt-1">{t('mentors.tryAdjusting') || 'Try adjusting your search or filters'}</p>
        </div>
      )}

      {/* Become a Mentor CTA - Warm and Inviting */}
      <div className="bg-gradient-to-br from-accent-50 via-accent-50 to-primary-50 rounded-3xl p-8 text-center border border-accent-100">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft">
          <UserPlus className="h-7 w-7 text-accent-500" />
        </div>
        <h3 className="font-semibold text-text-primary text-lg">{t('mentors.ctaTitle') || 'Are you an experienced professional?'}</h3>
        <p className="text-text-secondary mt-2 max-w-md mx-auto">{t('mentors.ctaSubtitle') || 'Help shape the next generation of Ethiopian tech talent by becoming a mentor'}</p>
        <button 
          onClick={() => setShowMentorForm(true)}
          className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-accent-300 text-white rounded-full hover:bg-accent-400 transition-all duration-200 font-medium shadow-soft hover:shadow-lg hover:scale-[1.02]"
        >
          <UserPlus className="h-4 w-4" />
          {t('mentors.becomeMentor') || 'Become a Mentor'}
        </button>
      </div>

      {/* Become a Mentor Modal */}
      {showMentorForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('mentors.applicationTitle') || 'Mentor Application'}
                </h2>
                <button 
                  onClick={() => setShowMentorForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {formSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('mentors.submitSuccess') || 'Application Submitted!'}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {t('mentors.submitSuccessMessage') || 'Your application has been submitted. An admin will review it.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleMentorSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('mentors.fullName') || 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('mentors.email') || 'Email'} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('mentors.phone') || 'Phone'}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                      placeholder="+251 9XX XXX XXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('mentors.linkedinUrl') || 'LinkedIn Profile URL'} *
                    </label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('mentors.expertise') || 'Area of Expertise'} *
                    </label>
                    <input
                      type="text"
                      name="expertise"
                      value={formData.expertise}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none"
                      placeholder="e.g., Software Development, Data Science"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('mentors.bio') || 'Short Bio'} *
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleFormChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none resize-none"
                      placeholder="Tell us about your experience and how you can help mentees..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('mentors.submitting') || 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        {t('mentors.submitApplication') || 'Submit Application'}
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mentors;
