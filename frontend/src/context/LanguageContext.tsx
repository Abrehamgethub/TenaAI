import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'am' | 'om' | 'tg' | 'so';

export const languageNames: Record<Language, string> = {
  en: 'English',
  am: 'አማርኛ (Amharic)',
  om: 'Oromiffa',
  tg: 'ትግርኛ (Tigrigna)',
  so: 'Soomaali (Somali)',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.career': 'Career Goal',
    'nav.roadmap': 'My Roadmap',
    'nav.tutor': 'AI Tutor',
    'nav.opportunities': 'Opportunities',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',

    // Landing
    'landing.title': 'Your AI-Powered Learning Partner',
    'landing.subtitle': 'Personalized learning paths and career guidance for Ethiopian youth',
    'landing.cta': 'Get Started',
    'landing.login': 'Sign In',

    // Career Goal
    'career.title': 'What career do you want to pursue?',
    'career.placeholder': 'e.g., Software Developer, Data Scientist, UI/UX Designer',
    'career.submit': 'Generate My Roadmap',
    'career.loading': 'Creating your personalized roadmap...',

    // Roadmap
    'roadmap.title': 'Your Learning Roadmap',
    'roadmap.empty': 'Set a career goal to see your roadmap',
    'roadmap.stage': 'Stage',
    'roadmap.resources': 'Resources',
    'roadmap.save': 'Save Roadmap',

    // Tutor
    'tutor.title': 'AI Tutor',
    'tutor.placeholder': 'Ask me anything about your learning journey...',
    'tutor.send': 'Send',
    'tutor.speak': 'Speak',
    'tutor.listening': 'Listening...',

    // Opportunities
    'opportunities.title': 'Opportunities For You',
    'opportunities.generate': 'Find Opportunities',
    'opportunities.save': 'Save',
    'opportunities.saved': 'Saved',

    // Profile
    'profile.title': 'Your Profile',
    'profile.savedRoadmaps': 'Saved Roadmaps',
    'profile.savedOpportunities': 'Saved Opportunities',
    'profile.language': 'Language Preference',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.retry': 'Retry',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
  },
  am: {
    // Navigation
    'nav.home': 'መነሻ',
    'nav.career': 'የስራ ግብ',
    'nav.roadmap': 'የእኔ መንገድ',
    'nav.tutor': 'AI አስተማሪ',
    'nav.opportunities': 'እድሎች',
    'nav.profile': 'መገለጫ',
    'nav.logout': 'ውጣ',

    // Landing
    'landing.title': 'በAI የተደገፈ የትምህርት አጋርዎ',
    'landing.subtitle': 'ለኢትዮጵያ ወጣቶች ግላዊ የትምህርት መንገዶች እና የስራ መመሪያ',
    'landing.cta': 'ጀምር',
    'landing.login': 'ግባ',

    // Career Goal
    'career.title': 'ምን ሙያ መከተል ይፈልጋሉ?',
    'career.placeholder': 'ለምሳሌ: ሶፍትዌር ገንቢ፣ ዳታ ሳይንቲስት',
    'career.submit': 'የእኔን መንገድ አዘጋጅ',
    'career.loading': 'ግላዊ መንገድዎን በማዘጋጀት ላይ...',

    // Roadmap
    'roadmap.title': 'የትምህርት መንገድዎ',
    'roadmap.empty': 'የስራ ግብ ያስቀምጡ መንገድዎን ለማየት',
    'roadmap.stage': 'ደረጃ',
    'roadmap.resources': 'ግብዓቶች',
    'roadmap.save': 'መንገድ አስቀምጥ',

    // Tutor
    'tutor.title': 'AI አስተማሪ',
    'tutor.placeholder': 'ስለ ትምህርትዎ ማንኛውንም ጥያቄ ይጠይቁ...',
    'tutor.send': 'ላክ',
    'tutor.speak': 'ተናገር',
    'tutor.listening': 'በማዳመጥ ላይ...',

    // Opportunities
    'opportunities.title': 'ለእርስዎ እድሎች',
    'opportunities.generate': 'እድሎችን ፈልግ',
    'opportunities.save': 'አስቀምጥ',
    'opportunities.saved': 'ተቀምጧል',

    // Profile
    'profile.title': 'የእርስዎ መገለጫ',
    'profile.savedRoadmaps': 'የተቀመጡ መንገዶች',
    'profile.savedOpportunities': 'የተቀመጡ እድሎች',
    'profile.language': 'የቋንቋ ምርጫ',

    // Common
    'common.loading': 'በመጫን ላይ...',
    'common.error': 'ችግር ተፈጠረ',
    'common.retry': 'እንደገና ሞክር',
    'common.save': 'አስቀምጥ',
    'common.cancel': 'ሰርዝ',
    'common.delete': 'ሰርዝ',
  },
  om: {
    // Navigation
    'nav.home': 'Jalqaba',
    'nav.career': 'Kaayyoo Hojii',
    'nav.roadmap': 'Karaa Koo',
    'nav.tutor': 'Barsiisaa AI',
    'nav.opportunities': 'Carraalee',
    'nav.profile': 'Ibsa',
    'nav.logout': 'Bahi',

    // Landing
    'landing.title': 'Hiriyaa Barnoota AI\'n Deeggaramu',
    'landing.subtitle': 'Karaalee barnoota dhuunfaa fi qajeelfama hojii dargaggoota Itoophiyaatiif',
    'landing.cta': 'Jalqabi',
    'landing.login': 'Seeni',

    // Career Goal
    'career.title': 'Hojii kam hordofuu barbaadda?',
    'career.placeholder': 'Fkn: Software Developer, Data Scientist',
    'career.submit': 'Karaa Koo Uumi',
    'career.loading': 'Karaa dhuunfaa kee uumaa jira...',

    // Roadmap
    'roadmap.title': 'Karaa Barnoota Kee',
    'roadmap.empty': 'Kaayyoo hojii galchi karaa kee ilaaluuf',
    'roadmap.stage': 'Sadarkaa',
    'roadmap.resources': 'Qabeenya',
    'roadmap.save': 'Karaa Olkaa\'i',

    // Tutor
    'tutor.title': 'Barsiisaa AI',
    'tutor.placeholder': 'Waa\'ee barnoota kee waan kamiyyuu naaf gaafadhu...',
    'tutor.send': 'Ergi',
    'tutor.speak': 'Dubbadhu',
    'tutor.listening': 'Dhaggeeffachaa jira...',

    // Opportunities
    'opportunities.title': 'Carraalee Siif',
    'opportunities.generate': 'Carraalee Barbaadi',
    'opportunities.save': 'Olkaa\'i',
    'opportunities.saved': 'Olkaa\'ameera',

    // Profile
    'profile.title': 'Ibsa Kee',
    'profile.savedRoadmaps': 'Karaalee Olkaa\'aman',
    'profile.savedOpportunities': 'Carraalee Olkaa\'aman',
    'profile.language': 'Filannoo Afaanii',

    // Common
    'common.loading': 'Fe\'aa jira...',
    'common.error': 'Rakkoon uumame',
    'common.retry': 'Irra deebi\'i yaali',
    'common.save': 'Olkaa\'i',
    'common.cancel': 'Dhiisi',
    'common.delete': 'Haqi',
  },
  tg: {
    // Navigation - Tigrigna
    'nav.home': 'መበገሲ',
    'nav.career': 'ዕላማ ስራሕ',
    'nav.roadmap': 'መገደይ',
    'nav.tutor': 'AI መምህር',
    'nav.opportunities': 'ዕድላት',
    'nav.profile': 'መግለጺ',
    'nav.logout': 'ውጻእ',

    // Landing
    'landing.title': 'ብAI ዝድገፍ መሻርኽቲ ትምህርቲ',
    'landing.subtitle': 'ንመንእሰያት ኢትዮጵያ ውልቃዊ መገድታት ትምህርቲን መምርሒ ስራሕን',
    'landing.cta': 'ጀምር',
    'landing.login': 'እቶ',

    // Career Goal
    'career.title': 'ኣየናይ ሞያ ክትስዕብ ትደሊ?',
    'career.placeholder': 'ንኣብነት: Software Developer, Data Scientist',
    'career.submit': 'መገደይ ኣዳሉ',
    'career.loading': 'ውልቃዊ መገድኻ እናዳለኹ ኣለኹ...',

    // Roadmap
    'roadmap.title': 'መገዲ ትምህርትኻ',
    'roadmap.empty': 'መገድኻ ንምርኣይ ዕላማ ስራሕ ኣእቱ',
    'roadmap.stage': 'ደረጃ',
    'roadmap.resources': 'ጸጋታት',
    'roadmap.save': 'መገዲ ዓቅብ',

    // Tutor
    'tutor.title': 'AI መምህር',
    'tutor.placeholder': 'ብዛዕባ ትምህርትኻ ዝኾነ ሕቶ ሕተት...',
    'tutor.send': 'ስደድ',
    'tutor.speak': 'ተዛረብ',
    'tutor.listening': 'እሰምዕ ኣለኹ...',

    // Opportunities
    'opportunities.title': 'ንዓኻ ዕድላት',
    'opportunities.generate': 'ዕድላት ድለ',
    'opportunities.save': 'ዓቅብ',
    'opportunities.saved': 'ተዓቂቡ',

    // Profile
    'profile.title': 'መግለጺኻ',
    'profile.savedRoadmaps': 'ዝተዓቀቡ መገድታት',
    'profile.savedOpportunities': 'ዝተዓቀቡ ዕድላት',
    'profile.language': 'ምርጫ ቋንቋ',

    // Common
    'common.loading': 'ይጽዓን ኣሎ...',
    'common.error': 'ጸገም ኣጋጢሙ',
    'common.retry': 'ደጊምካ ፈትን',
    'common.save': 'ዓቅብ',
    'common.cancel': 'ሰርዝ',
    'common.delete': 'ደምስስ',
  },
  so: {
    // Navigation - Somali
    'nav.home': 'Guriga',
    'nav.career': 'Hadafka Shaqada',
    'nav.roadmap': 'Dariiqdayda',
    'nav.tutor': 'Macalinka AI',
    'nav.opportunities': 'Fursadaha',
    'nav.profile': 'Astaanta',
    'nav.logout': 'Ka bax',

    // Landing
    'landing.title': 'Saaxiibkaaga Waxbarashada AI',
    'landing.subtitle': 'Waddooyinka waxbarashada shakhsiga ah iyo hagista shaqada ee dhallinyarada Itoobiya',
    'landing.cta': 'Bilow',
    'landing.login': 'Gal',

    // Career Goal
    'career.title': 'Shaqo noocee ah ayaad rabtaa inaad raacdo?',
    'career.placeholder': 'Tusaale: Software Developer, Data Scientist',
    'career.submit': 'Samee Dariiqdayda',
    'career.loading': 'Waan samaynayaa dariiqdaada gaarka ah...',

    // Roadmap
    'roadmap.title': 'Dariiqdaada Waxbarashada',
    'roadmap.empty': 'Geli hadafka shaqada si aad u aragto dariiqdaada',
    'roadmap.stage': 'Heer',
    'roadmap.resources': 'Ilaha',
    'roadmap.save': 'Kaydi Dariiqa',

    // Tutor
    'tutor.title': 'Macalinka AI',
    'tutor.placeholder': 'Wax kasta ii weydii waxbarashada...',
    'tutor.send': 'Dir',
    'tutor.speak': 'Hadal',
    'tutor.listening': 'Waan dhegaysanayaa...',

    // Opportunities
    'opportunities.title': 'Fursadaha Adiga',
    'opportunities.generate': 'Raadi Fursadaha',
    'opportunities.save': 'Kaydi',
    'opportunities.saved': 'Waa la keydiyay',

    // Profile
    'profile.title': 'Astaantaada',
    'profile.savedRoadmaps': 'Waddooyinka La Keydiyay',
    'profile.savedOpportunities': 'Fursadaha La Keydiyay',
    'profile.language': 'Doorashada Luqadda',

    // Common
    'common.loading': 'Waa la rarrayaa...',
    'common.error': 'Wax qalad ah ayaa dhacay',
    'common.retry': 'Isku day mar kale',
    'common.save': 'Kaydi',
    'common.cancel': 'Jooji',
    'common.delete': 'Tirtir',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('qineguide-language');
    return (saved as Language) || 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('qineguide-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
