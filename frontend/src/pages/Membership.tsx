import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Crown, 
  Check, 
  Sparkles, 
  MessageCircle, 
  BookOpen, 
  BarChart3,
  Users,
  Zap,
  Shield,
  Loader2
} from 'lucide-react';

const Membership = () => {
  useLanguage(); // For future translations
  useAuth(); // For user context
  const [loading, setLoading] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const features = [
    {
      icon: MessageCircle,
      title: 'Unlimited AI Tutoring',
      description: 'Ask unlimited questions to your personal AI tutor',
    },
    {
      icon: BookOpen,
      title: 'Advanced Learning Paths',
      description: 'Access premium courses and detailed roadmaps',
    },
    {
      icon: BarChart3,
      title: 'Detailed Analytics',
      description: 'Track your progress with in-depth insights',
    },
    {
      icon: Users,
      title: 'Priority Mentor Matching',
      description: 'Get matched with top Ethiopian tech mentors',
    },
    {
      icon: Zap,
      title: 'Early Access Features',
      description: 'Be the first to try new QineGuide features',
    },
    {
      icon: Shield,
      title: 'Priority Support',
      description: '24/7 dedicated support for your learning journey',
    },
  ];

  const handleBecomeMember = async () => {
    setLoading(true);
    
    // Simulate API call - in production, this would call your backend
    // to update user's membership status in Firestore
    setTimeout(() => {
      setIsMember(true);
      setShowSuccess(true);
      setLoading(false);
      
      // In production, update Firestore:
      // await updateDoc(doc(db, "users", user.uid), { isMember: true });
    }, 1500);
  };

  if (showSuccess) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-24 w-24 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <Crown className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🎉 Welcome to QineGuide Premium!
        </h1>
        <p className="text-gray-600 max-w-md mb-8">
          You now have access to all premium features. Start exploring and accelerate your learning journey!
        </p>
        <div className="flex gap-4">
          <a
            href="/tutor"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            Try AI Tutor
          </a>
          <a
            href="/career-goal"
            className="inline-flex items-center gap-2 border border-gray-200 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            <BookOpen className="h-5 w-5" />
            Explore Roadmap
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          Premium Membership
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Unlock Your Full Potential
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get unlimited access to AI tutoring, advanced analytics, priority mentor matching, and more.
        </p>
      </div>

      {/* Pricing Card */}
      <div className="bg-gradient-to-br from-primary-600 to-purple-700 rounded-3xl p-8 text-white mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-6 w-6 text-yellow-400" />
              <span className="text-lg font-medium opacity-90">QineGuide Premium</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold">Free</span>
              <span className="text-xl opacity-75">during beta</span>
            </div>
            <p className="mt-2 opacity-80">
              Limited time offer - Become a founding member today!
            </p>
          </div>
          
          <button
            onClick={handleBecomeMember}
            disabled={loading || isMember}
            className="flex items-center gap-3 bg-white text-primary-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : isMember ? (
              <>
                <Check className="h-5 w-5" />
                You're a Member!
              </>
            ) : (
              <>
                <Crown className="h-5 w-5" />
                Become a Member
              </>
            )}
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="h-12 w-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
              <feature.icon className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-12 text-center">
        <p className="text-gray-600">
          Have questions? Visit our{' '}
          <a href="/help" className="text-primary-600 hover:underline font-medium">
            Help & FAQ
          </a>{' '}
          page or contact support.
        </p>
      </div>
    </div>
  );
};

export default Membership;
