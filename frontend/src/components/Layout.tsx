import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useIdleLogout } from '../hooks/useIdleLogout';
import {
  MessageCircle,
  Briefcase,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  Users,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { useState } from 'react';
import LanguagePillSelector from './LanguagePillSelector';

const Layout = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-logout after 15 minutes of inactivity
  useIdleLogout({
    idleTime: 15 * 60 * 1000,
    enabled: !!user,
  });

  // Friendly navigation with clean icons and simple labels
  const navItems = [
    { path: '/career-goal', icon: Compass, label: t('nav.roadmap') || 'My Roadmap' },
    { path: '/daily-coach', icon: Sparkles, label: t('nav.dailyCoach') || 'Daily Coach' },
    { path: '/tutor', icon: MessageCircle, label: t('nav.tutor') || 'AI Tutor' },
    { path: '/opportunities', icon: Briefcase, label: t('nav.opportunities') || 'Opportunities' },
    { path: '/mentors', icon: Users, label: t('nav.mentors') || 'Mentors' },
    { path: '/profile', icon: User, label: t('nav.account') || 'Account' },
    { path: '/help', icon: HelpCircle, label: t('nav.help') || 'Help' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Desktop Sidebar - Modern, Clean Design */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 bg-white/80 backdrop-blur-xl border-r border-surface-200 md:block">
        <div className="flex h-full flex-col">
          {/* Logo - Clickable, navigates to Home */}
          <Link 
            to="/" 
            className="flex h-20 items-center gap-3 px-6 hover:bg-surface-50 transition-colors"
            aria-label="QineGuide Home"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold text-lg shadow-button">
              Q
            </div>
            <div>
              <span className="text-xl font-bold text-text-primary">QineGuide</span>
              <p className="text-xs text-text-muted">{t('nav.tagline') || 'Your learning companion'}</p>
            </div>
          </Link>

          {/* Navigation - Clean Icons with Friendly Labels */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item, index) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-600 shadow-soft'
                    : 'text-text-secondary hover:bg-surface-100 hover:text-text-primary'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`p-2 rounded-lg ${isActive(item.path) ? 'bg-primary-100' : 'bg-surface-100'}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Section - Warm and Personal */}
          <div className="p-4 space-y-4">
            {/* Language Selector - New Pill Design */}
            <LanguagePillSelector variant="sidebar" />
            
            {/* User Profile Card */}
            <div className="bg-gradient-to-br from-surface-50 to-surface-100 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white font-semibold text-lg shadow-soft">
                  {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {user?.displayName || t('nav.user') || 'Welcome!'}
                  </p>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-4 flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                {t('nav.logout') || 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header - Clean and Simple */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between bg-white/90 backdrop-blur-lg border-b border-surface-200 px-4 md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold shadow-button">
            Q
          </div>
          <span className="text-lg font-bold text-text-primary">QineGuide</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-xl text-text-secondary hover:bg-surface-100 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu - Smooth Slide-in */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div className="fixed right-0 top-0 h-full w-72 bg-white shadow-soft-lg animate-slide-in-right">
            <div className="flex h-16 items-center justify-between px-4 border-b border-surface-200">
              <span className="font-semibold text-text-primary">{t('nav.menu') || 'Menu'}</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl text-text-secondary hover:bg-surface-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-text-secondary hover:bg-surface-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-surface-200 bg-white">
              <LanguagePillSelector variant="mobile" />
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-red-600 hover:bg-red-50 transition-all"
              >
                <LogOut className="h-4 w-4" />
                {t('nav.logout') || 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Clean and Spacious */}
      <main className="min-h-screen pt-16 md:ml-72 md:pt-0">
        <div className="mx-auto max-w-4xl p-4 md:p-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
