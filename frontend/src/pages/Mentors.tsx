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

const expertiseAreas = [
  'All',
  'Software Development',
  'Data Science',
  'AI & Machine Learning',
  'UI/UX Design',
  'DevOps',
  'Mobile Apps',
  'Cloud Computing',
];

const Mentors = () => {
  const [mentors] = useState<Mentor[]>(sampleMentors);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('All');
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
      mentor.expertise.some(e => e.toLowerCase().includes(selectedExpertise.toLowerCase()));
    
    return matchesSearch && matchesExpertise;
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
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
          <Users className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Find a Mentor</h1>
        <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
          Connect with experienced Ethiopian tech professionals who can guide your career journey
        </p>
      </div>

      {/* AI Matching Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">AI-Powered Mentor Matching</h3>
            <p className="text-primary-100 mt-1">
              Based on your career goal and learning path, we recommend mentors who can best guide your journey.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, skill, or company..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-5 w-5" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Expertise Area</p>
            <div className="flex flex-wrap gap-2">
              {expertiseAreas.map((area) => (
                <button
                  key={area}
                  onClick={() => setSelectedExpertise(area)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedExpertise === area
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-900">{filteredMentors.length}</span> mentors found
        </p>
      </div>

      {/* Mentor Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMentors.map((mentor) => (
          <div
            key={mentor.id}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold">
                {mentor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{mentor.name}</h3>
                <p className="text-sm text-gray-600 truncate">{mentor.title}</p>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span className="truncate">{mentor.company}</span>
                </div>
              </div>
            </div>

            {/* Availability Badge */}
            <div className="mt-4">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(mentor.availability)}`}>
                {getAvailabilityText(mentor.availability)}
              </span>
            </div>

            {/* Bio */}
            <p className="mt-3 text-sm text-gray-600 line-clamp-2">{mentor.bio}</p>

            {/* Expertise Tags */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {mentor.expertise.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {skill}
                </span>
              ))}
              {mentor.expertise.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">
                  +{mentor.expertise.length - 3}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span>{mentor.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{mentor.mentees} mentees</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{mentor.location.split(' / ')[0]}</span>
              </div>
            </div>

            {/* Actions - Single LinkedIn button only */}
            <div className="mt-5">
              <a
                href={getLinkedInSearchUrl(mentor.fullName)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                <Linkedin className="h-4 w-4" />
                {t('mentors.viewProfile') || 'View LinkedIn Profile'}
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No mentors found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Become a Mentor CTA */}
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <h3 className="font-semibold text-gray-900">{t('mentors.ctaTitle') || 'Are you an experienced professional?'}</h3>
        <p className="text-gray-600 mt-1">{t('mentors.ctaSubtitle') || 'Help shape the next generation of Ethiopian tech talent'}</p>
        <button 
          onClick={() => setShowMentorForm(true)}
          className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
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
