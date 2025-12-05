import { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage, Language } from '../context/LanguageContext';
import { Check, ChevronUp, ChevronDown, X } from 'lucide-react';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  greeting: string;
  shortCode: string; // 2-letter display code
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', greeting: 'Hello!', shortCode: 'EN' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', greeting: 'ሰላም!', shortCode: 'አማ' },
  { code: 'om', name: 'Afan Oromo', nativeName: 'Afaan Oromoo', greeting: 'Akkam!', shortCode: 'OM' },
  { code: 'tg', name: 'Tigrigna', nativeName: 'ትግርኛ', greeting: 'ሰላም!', shortCode: 'ትግ' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', greeting: 'Salaan!', shortCode: 'SO' },
];

interface LanguagePillSelectorProps {
  variant?: 'sidebar' | 'header' | 'mobile';
  onLanguageChange?: (lang: Language) => void;
}

const LanguagePillSelector = ({ variant = 'sidebar', onLanguageChange }: LanguagePillSelectorProps) => {
  const { language, setLanguage } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredLang, setHoveredLang] = useState<Language | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((l) => l.code === language) || languages[0];
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setFocusedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isExpanded) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsExpanded(true);
        setFocusedIndex(languages.findIndex(l => l.code === language));
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % languages.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + languages.length) % languages.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          handleSelectLanguage(languages[focusedIndex].code);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsExpanded(false);
        setFocusedIndex(-1);
        break;
    }
  }, [isExpanded, focusedIndex, language]);

  const handleSelectLanguage = (code: Language) => {
    setLanguage(code);
    setIsExpanded(false);
    setShowMobileModal(false);
    setFocusedIndex(-1);
    onLanguageChange?.(code);
  };

  const handleToggle = () => {
    if (isMobile && variant !== 'header') {
      setShowMobileModal(true);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  // Mobile Modal
  if (showMobileModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className="w-full max-w-md bg-white rounded-t-3xl rounded-b-xl shadow-xl animate-slide-up">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-surface-200">
            <h3 className="text-lg font-semibold text-text-primary">Select Language</h3>
            <button
              onClick={() => setShowMobileModal(false)}
              className="p-2 rounded-full hover:bg-surface-100 transition-colors"
              aria-label="Close language selector"
            >
              <X className="h-5 w-5 text-text-muted" />
            </button>
          </div>
          
          {/* Language Options */}
          <div className="p-2 max-h-[60vh] overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
                  language === lang.code
                    ? 'bg-primary-50 border-2 border-primary-200'
                    : 'hover:bg-surface-50 border-2 border-transparent'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold text-sm">
                  {lang.shortCode}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-text-primary">{lang.nativeName}</p>
                  <p className="text-sm text-text-muted">{lang.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-secondary italic">{lang.greeting}</p>
                  {language === lang.code && (
                    <Check className="h-5 w-5 text-primary-500 ml-auto mt-1" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Sidebar Vertical Pill (Default)
  if (variant === 'sidebar') {
    return (
      <div 
        ref={containerRef} 
        className="relative"
        role="listbox"
        aria-label="Select language"
        aria-expanded={isExpanded}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Collapsed State - Vertical Pill Stack */}
        <div 
          className={`flex flex-col items-stretch gap-1 transition-all duration-300 ${isExpanded ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}
        >
          <button
            onClick={handleToggle}
            className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl bg-gradient-to-r from-surface-50 to-surface-100 hover:from-primary-50 hover:to-primary-100 border border-surface-200 hover:border-primary-200 transition-all duration-200"
            aria-label={`Current language: ${currentLanguage.nativeName}. Click to change.`}
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
              {currentLanguage.shortCode}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{currentLanguage.nativeName}</p>
              <p className="text-xs text-text-muted">{currentLanguage.greeting}</p>
            </div>
            <ChevronUp className="h-4 w-4 text-text-muted group-hover:text-primary-500 transition-colors" />
          </button>
        </div>

        {/* Expanded State - Full List */}
        <div 
          ref={listRef}
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-2xl shadow-soft-lg border border-surface-200 overflow-hidden transition-all duration-300 ${
            isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
          style={{ zIndex: 100 }}
        >
          <div className="p-1">
            {languages.map((lang, index) => (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                onMouseEnter={() => setHoveredLang(lang.code)}
                onMouseLeave={() => setHoveredLang(null)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  language === lang.code
                    ? 'bg-primary-50 text-primary-700'
                    : focusedIndex === index
                    ? 'bg-surface-100'
                    : 'hover:bg-surface-50'
                }`}
                role="option"
                aria-selected={language === lang.code}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  language === lang.code ? 'bg-primary-200 text-primary-700' : 'bg-surface-200 text-text-secondary'
                }`}>
                  {lang.shortCode}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className={`text-sm font-medium ${language === lang.code ? 'text-primary-700' : 'text-text-primary'}`}>
                    {lang.nativeName}
                  </p>
                </div>
                {/* Hover Preview */}
                <span className={`text-xs italic transition-opacity duration-200 ${
                  hoveredLang === lang.code || language === lang.code ? 'opacity-100 text-text-muted' : 'opacity-0'
                }`}>
                  {lang.greeting}
                </span>
                {language === lang.code && (
                  <Check className="h-4 w-4 text-primary-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
          
          {/* Close hint */}
          <div className="px-3 py-2 border-t border-surface-100 bg-surface-50">
            <button
              onClick={() => setIsExpanded(false)}
              className="w-full flex items-center justify-center gap-1 text-xs text-text-muted hover:text-text-secondary"
            >
              <ChevronDown className="h-3 w-3" />
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Header compact variant
  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-100 hover:bg-surface-200 transition-all duration-200"
        aria-label={`Language: ${currentLanguage.nativeName}`}
      >
        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
          {currentLanguage.shortCode}
        </div>
        <span className="text-sm font-medium text-text-primary hidden sm:inline">{currentLanguage.nativeName}</span>
        <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-soft-lg border border-surface-200 overflow-hidden z-50 animate-fade-in">
          <div className="p-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  language === lang.code
                    ? 'bg-primary-50 text-primary-700'
                    : 'hover:bg-surface-50'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  language === lang.code ? 'bg-primary-200 text-primary-700' : 'bg-surface-200 text-text-secondary'
                }`}>
                  {lang.shortCode}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{lang.nativeName}</p>
                  <p className="text-xs text-text-muted">{lang.name}</p>
                </div>
                {language === lang.code && <Check className="h-4 w-4 text-primary-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguagePillSelector;
