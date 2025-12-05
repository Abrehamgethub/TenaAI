import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Compass,
  Sparkles,
  MessageCircle,
  Briefcase,
  Users,
  BarChart3,
  Brain,
  ArrowRight,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const quickActions = [
    {
      icon: Compass,
      title: t('nav.roadmap') || 'My Roadmap',
      description: t('dashboard.roadmapDesc') || 'View your career learning path',
      path: '/career-goal',
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      icon: Sparkles,
      title: t('nav.dailyCoach') || 'Daily Coach',
      description: t('dashboard.coachDesc') || 'Your personalized daily tasks',
      path: '/daily-coach',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
    },
    {
      icon: MessageCircle,
      title: t('nav.tutor') || 'AI Tutor',
      description: t('dashboard.tutorDesc') || 'Ask questions and learn',
      path: '/tutor',
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50',
    },
    {
      icon: Brain,
      title: t('nav.quiz') || 'Take Quiz',
      description: t('dashboard.quizDesc') || 'Test your knowledge',
      path: '/quiz',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50',
    },
    {
      icon: Briefcase,
      title: t('nav.opportunities') || 'Opportunities',
      description: t('dashboard.oppsDesc') || 'Find jobs and scholarships',
      path: '/opportunities',
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: Users,
      title: t('nav.mentors') || 'Mentors',
      description: t('dashboard.mentorsDesc') || 'Connect with professionals',
      path: '/mentors',
      color: 'from-cyan-500 to-blue-500',
      bgColor: 'bg-cyan-50',
    },
  ];

  const displayName = user?.displayName || user?.email?.split('@')[0] || t('nav.user') || 'there';

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header with user greeting */}
      <header className="bg-white border-b border-surface-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold shadow-button">
              Q
            </div>
            <span className="text-xl font-bold text-text-primary">QineGuide</span>
          </Link>
          
          {/* Username in top-right */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-100 rounded-full">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                {displayName[0].toUpperCase()}
              </div>
              <span className="text-sm font-medium text-text-primary hidden sm:inline">
                {displayName}
              </span>
            </div>
            <Link
              to="/profile"
              className="p-2 rounded-xl hover:bg-surface-100 transition-colors"
              aria-label="View profile"
            >
              <BarChart3 className="h-5 w-5 text-text-muted" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-3xl p-8 text-white shadow-soft-lg mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t('dashboard.welcome') || 'Welcome back'}, {displayName}! 👋
          </h1>
          <p className="text-white/80 text-lg">
            {t('dashboard.subtitle') || "Ready to continue your learning journey?"}
          </p>
          
          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-white/70 text-sm">{t('dashboard.streak') || 'Learning Streak'}</p>
              <p className="text-2xl font-bold">3 {t('analytics.days') || 'days'}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-white/70 text-sm">{t('dashboard.progress') || 'Progress'}</p>
              <p className="text-2xl font-bold">25%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-white/70 text-sm">{t('dashboard.tasks') || 'Tasks Today'}</p>
              <p className="text-2xl font-bold">4</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-white/70 text-sm">{t('dashboard.quizzes') || 'Quizzes'}</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <h2 className="text-xl font-semibold text-text-primary mb-4">
          {t('dashboard.quickActions') || 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="group bg-white rounded-2xl p-6 shadow-card border border-surface-200 hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${action.bgColor}`}>
                  <action.icon className={`h-6 w-6 bg-gradient-to-br ${action.color} bg-clip-text text-transparent`} style={{ stroke: 'url(#gradient)' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-text-primary group-hover:text-primary-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-text-muted mt-1">{action.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-text-muted group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>

        {/* CTA to start */}
        <div className="mt-8 bg-gradient-to-r from-accent-50 to-primary-50 rounded-3xl p-8 border border-accent-100 text-center">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {t('dashboard.ctaTitle') || 'Continue where you left off'}
          </h3>
          <p className="text-text-secondary mb-4">
            {t('dashboard.ctaDesc') || 'Pick up your daily tasks and keep building your skills.'}
          </p>
          <Link
            to="/daily-coach"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full font-medium shadow-button hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <Sparkles className="h-5 w-5" />
            {t('dashboard.startLearning') || 'Start Learning'}
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
