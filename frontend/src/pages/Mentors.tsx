import { useState } from 'react';
import { 
  Users, 
  Search, 
  Briefcase, 
  MapPin, 
  Star,
  MessageCircle,
  Linkedin,
  Mail,
  Filter,
  Sparkles
} from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  expertise: string[];
  bio: string;
  experience: string;
  availability: 'available' | 'busy' | 'limited';
  rating: number;
  mentees: number;
  linkedIn?: string;
  image?: string;
}

// Sample Ethiopian mentors data
const sampleMentors: Mentor[] = [
  {
    id: '1',
    name: 'Dr. Betelhem Dessie',
    title: 'AI & Robotics Expert',
    company: 'iCog Labs',
    location: 'Addis Ababa',
    expertise: ['Artificial Intelligence', 'Machine Learning', 'Robotics', 'Python'],
    bio: 'Leading AI researcher in Ethiopia, working on bringing AI education to African youth.',
    experience: '10+ years',
    availability: 'limited',
    rating: 4.9,
    mentees: 150,
    linkedIn: 'https://linkedin.com/in/',
  },
  {
    id: '2',
    name: 'Kidus Asfaw',
    title: 'Software Engineering Lead',
    company: 'Safaricom Ethiopia',
    location: 'Addis Ababa',
    expertise: ['Software Development', 'Mobile Apps', 'System Design', 'Leadership'],
    bio: 'Passionate about building tech talent in Ethiopia and mentoring the next generation.',
    experience: '8+ years',
    availability: 'available',
    rating: 4.8,
    mentees: 45,
    linkedIn: 'https://linkedin.com/in/',
  },
  {
    id: '3',
    name: 'Sara Tekle',
    title: 'Data Scientist',
    company: 'Ethiopian Airlines',
    location: 'Addis Ababa',
    expertise: ['Data Science', 'Analytics', 'Python', 'SQL', 'Visualization'],
    bio: 'Using data to solve real problems. Love helping students break into data careers.',
    experience: '6+ years',
    availability: 'available',
    rating: 4.7,
    mentees: 32,
    linkedIn: 'https://linkedin.com/in/',
  },
  {
    id: '4',
    name: 'Yonas Hailu',
    title: 'Full Stack Developer',
    company: 'Gebeya',
    location: 'Remote / Addis Ababa',
    expertise: ['React', 'Node.js', 'TypeScript', 'Cloud', 'Startups'],
    bio: 'Building digital solutions for Africa. Advocate for remote work and freelancing.',
    experience: '5+ years',
    availability: 'available',
    rating: 4.6,
    mentees: 28,
    linkedIn: 'https://linkedin.com/in/',
  },
  {
    id: '5',
    name: 'Meron Assefa',
    title: 'UX/UI Designer',
    company: 'Apposit',
    location: 'Addis Ababa',
    expertise: ['UI/UX Design', 'Figma', 'User Research', 'Product Design'],
    bio: 'Creating beautiful, user-centered designs. Mentoring aspiring designers.',
    experience: '7+ years',
    availability: 'busy',
    rating: 4.8,
    mentees: 40,
    linkedIn: 'https://linkedin.com/in/',
  },
  {
    id: '6',
    name: 'Abel Mengistu',
    title: 'DevOps Engineer',
    company: 'Commercial Bank of Ethiopia',
    location: 'Addis Ababa',
    expertise: ['DevOps', 'AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    bio: 'Bridging development and operations. Happy to guide newcomers to DevOps.',
    experience: '6+ years',
    availability: 'available',
    rating: 4.5,
    mentees: 22,
    linkedIn: 'https://linkedin.com/in/',
  },
];

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

            {/* Actions */}
            <div className="mt-5 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm">
                <MessageCircle className="h-4 w-4" />
                Request Mentorship
              </button>
              {mentor.linkedIn && (
                <a
                  href={mentor.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Linkedin className="h-4 w-4 text-gray-600" />
                </a>
              )}
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
        <h3 className="font-semibold text-gray-900">Are you an experienced professional?</h3>
        <p className="text-gray-600 mt-1">Help shape the next generation of Ethiopian tech talent</p>
        <button className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium">
          <Mail className="h-4 w-4" />
          Become a Mentor
        </button>
      </div>
    </div>
  );
};

export default Mentors;
