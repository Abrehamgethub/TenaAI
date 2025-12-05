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
    'nav.dailyCoach': 'Daily Coach',
    'nav.quiz': 'Quiz',
    'nav.mentors': 'Find Mentors',
    'nav.analytics': 'Analytics',
    'nav.help': 'Help / FAQ',
    'nav.membership': 'Become a Member',

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
    'roadmap.generateError': 'Failed to generate roadmap. Please try again.',
    'roadmap.generating': 'Generating your personalized roadmap...',

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

    // Daily Coach
    'dailyCoach.title': 'Daily Learning Coach',
    'dailyCoach.subtitle': 'Your personalized learning tasks for today',
    'dailyCoach.streak': 'day streak',
    'dailyCoach.todayProgress': "Today's Progress",
    'dailyCoach.tasks': 'tasks',
    'dailyCoach.timeInvested': 'Time Invested',
    'dailyCoach.min': 'min',
    'dailyCoach.allComplete': 'All tasks completed! Great job!',
    'dailyCoach.todayTasks': "Today's Tasks",
    'dailyCoach.noTasks': 'No tasks yet. Set your career goal to get started!',
    'dailyCoach.preparing': 'Preparing your daily plan...',
    'dailyCoach.knowledgeCheck': 'Daily Knowledge Check',
    'dailyCoach.testUnderstanding': 'Test your understanding with',
    'dailyCoach.questions': 'quick questions',
    'dailyCoach.startQuiz': 'Start Quiz',
    'dailyCoach.markComplete': 'Mark as complete',
    'dailyCoach.markIncomplete': 'Mark as incomplete',
    'dailyCoach.oneHour': '1 Hour',
    'dailyCoach.dailyTime': 'Daily learning time',

    // Help & FAQ
    'help.title': 'Help & FAQ',
    'help.subtitle': 'Everything you need to know about QineGuide',
    'help.navigation': 'How to Navigate QineGuide',
    'help.navigationDesc': 'Use the sidebar menu to access all features. On mobile, tap the menu icon to open navigation.',
    'help.roadmap': 'How Roadmap Works',
    'help.roadmapDesc': 'Set your career goal and AI will generate a personalized learning path with stages, resources, and skills to learn.',
    'help.dailyCoach': 'How Daily Coach Works',
    'help.dailyCoachDesc': 'Every day you get 1 hour of personalized learning tasks. Complete tasks to build your streak and track progress.',
    'help.aiTutor': 'How to Use AI Tutor',
    'help.aiTutorDesc': 'Ask any question about your career path, coding, or learning. The AI tutor responds in your preferred language.',
    'help.language': 'How to Change Language',
    'help.languageDesc': 'Click the language selector in the sidebar or header to switch between English, Amharic, Oromiffa, Tigrigna, and Somali.',
    'help.membership': 'How to Become a Member',
    'help.membershipDesc': 'Click "Become a Member" to unlock premium features including advanced AI tutoring and priority support.',
    'help.faq': 'Frequently Asked Questions',
    'help.faqDailyReset': 'Why does Daily Coach reset every day?',
    'help.faqDailyResetAnswer': 'Daily Coach creates fresh tasks each day to ensure consistent learning. Your completed tasks contribute to your streak.',
    'help.faqRoadmapGenerated': 'How is my roadmap generated?',
    'help.faqRoadmapGeneratedAnswer': 'AI analyzes your career goal and skill level to create a personalized multi-stage learning path with curated resources.',
    'help.faqAiDifferent': 'Why does AI Tutor give different answers?',
    'help.faqAiDifferentAnswer': 'AI generates contextual responses based on your question. Each answer is tailored to your specific query and learning context.',
    'help.faqLinkedinSearch': 'Why does mentor LinkedIn open a search page?',
    'help.faqLinkedinSearchAnswer': 'We use LinkedIn search to help you find the mentor profile, as direct links may change or become unavailable.',

    // Analytics
    'analytics.title': 'Learning Analytics',
    'analytics.subtitle': 'Track your progress and identify areas for improvement',
    'analytics.loadingAnalytics': 'Loading your analytics...',
    'analytics.noData': 'No analytics data available',
    'analytics.startLearning': 'Start learning to see your progress!',
    'analytics.learningStreak': 'Learning Streak',
    'analytics.days': 'days',
    'analytics.roadmapProgress': 'Roadmap Progress',
    'analytics.completed': 'completed',
    'analytics.confidenceScore': 'Confidence Score',
    'analytics.aiAssessed': 'AI assessed',
    'analytics.timeInvested': 'Time Invested',
    'analytics.hours': 'hours',
    'analytics.aiInsights': 'AI Learning Insights',
    'analytics.progressOverTime': 'Progress Over Time',
    'analytics.quizAccuracy': 'Quiz Accuracy by Category',
    'analytics.skillsRadar': 'Skills Radar',
    'analytics.yourStrengths': 'Your Strengths',
    'analytics.completeMoreQuizzes': 'Complete more quizzes to identify your strengths!',
    'analytics.areasToImprove': 'Areas to Improve',
    'analytics.keepPracticing': 'Keep practicing to identify areas for improvement!',

    // Quiz
    'quiz.title': 'Test Your Knowledge',
    'quiz.subtitle': 'Challenge yourself with quizzes at different difficulty levels',
    'quiz.knowledgeQuiz': 'Knowledge Quiz',
    'quiz.lastResult': 'Last Quiz Result',
    'quiz.correct': 'correct',
    'quiz.dismiss': 'Dismiss',
    'quiz.chooseTopic': 'Choose a Topic',
    'quiz.customTopic': 'Or enter a custom topic...',
    'quiz.selectDifficulty': 'Select Difficulty',
    'quiz.beginner': 'Beginner',
    'quiz.intermediate': 'Intermediate',
    'quiz.advanced': 'Advanced',
    'quiz.beginnerDesc': 'Basic concepts and fundamentals',
    'quiz.intermediateDesc': 'Applied knowledge and deeper understanding',
    'quiz.advancedDesc': 'Complex problems and expert-level challenges',
    'quiz.questions': 'questions',
    'quiz.generatingQuiz': 'Generating Quiz...',
    'quiz.startQuiz': 'Start',
    'quiz.selectTopic': 'Please select or enter a topic',
    'quiz.failedGenerate': 'Failed to generate quiz. Please try again.',

    // Settings
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.notifications': 'Notifications',
    'settings.theme': 'Theme',
    'settings.darkMode': 'Dark Mode',
    'settings.account': 'Account Settings',
    'settings.privacy': 'Privacy',
    'settings.save': 'Save Settings',

    // Mentors
    'mentors.title': 'Find a Mentor',
    'mentors.subtitle': 'Connect with experienced professionals in your field',
    'mentors.search': 'Search mentors...',
    'mentors.filter': 'Filter by expertise',
    'mentors.all': 'All',
    'mentors.available': 'Available',
    'mentors.busy': 'Busy',
    'mentors.limited': 'Limited',
    'mentors.requestMentorship': 'Request Mentorship',
    'mentors.viewLinkedIn': 'View on LinkedIn',
    'mentors.mentees': 'mentees',
    'mentors.experience': 'experience',
    'mentors.noMentors': 'No mentors found',
    'mentors.becomeMentor': 'Become a Mentor',
    'mentors.becomeMentorDesc': 'Help shape the next generation of Ethiopian tech talent',

    // Extended Tutor
    'tutor.startConversation': 'Start a conversation',
    'tutor.askAnything': 'Ask me anything about STEM concepts, career advice, or your learning journey.',
    'tutor.supportedLanguages': 'I can respond in English, Amharic, Oromiffa, Tigrigna, or Somali!',
    'tutor.voiceOn': 'Voice On',
    'tutor.voiceOff': 'Voice Off',
    'tutor.voiceNotAvailable': 'Voice not available',
    'tutor.clear': 'Clear',
    'tutor.chatHistory': 'Chat History',

    // Extended Opportunities  
    'opportunities.subtitle': 'Discover scholarships, internships, and job opportunities',
    'opportunities.loading': 'Finding opportunities for you...',
    'opportunities.noOpportunities': 'No opportunities found',
    'opportunities.setGoalFirst': 'Set a career goal to find relevant opportunities',
    'opportunities.deadline': 'Deadline',
    'opportunities.location': 'Location',
    'opportunities.apply': 'Apply Now',
    'opportunities.learnMore': 'Learn More',

    // Career Goal Extended
    'career.yourGoal': 'Your Career Goal',
    'career.changeGoal': 'Change Goal',
    'career.roadmapStages': 'Roadmap Stages',
    'career.newGoal': 'New Career Goal',
    'career.findOpportunities': 'Find Opportunities',
    'career.viewAnalytics': 'View Analytics',
    'career.takeQuiz': 'Take Quiz',
    'career.talkToTutor': 'Talk to AI Tutor',
    'career.goToDailyCoach': 'Daily Coach',
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

    // Daily Coach
    'dailyCoach.title': 'የዕለት ትምህርት አሰልጣኝ',
    'dailyCoach.subtitle': 'ለዛሬ የተዘጋጀ ግላዊ የትምህርት ስራዎች',
    'dailyCoach.streak': 'ቀናት ተከታታይ',
    'dailyCoach.todayProgress': 'የዛሬ እድገት',
    'dailyCoach.tasks': 'ስራዎች',
    'dailyCoach.timeInvested': 'የተጠቀመው ጊዜ',
    'dailyCoach.min': 'ደቂቃ',
    'dailyCoach.allComplete': 'ሁሉም ስራዎች ተጠናቀቁ! በጣም ጎበዝ!',
    'dailyCoach.todayTasks': 'የዛሬ ስራዎች',
    'dailyCoach.noTasks': 'እስካሁን ስራ የለም። የስራ ግብ ያስቀምጡ!',
    'dailyCoach.preparing': 'የዕለት እቅድዎን በማዘጋጀት ላይ...',
    'dailyCoach.knowledgeCheck': 'የዕለት እውቀት ፈተና',
    'dailyCoach.testUnderstanding': 'ግንዛቤዎን ይፈትኑ በ',
    'dailyCoach.questions': 'ጥያቄዎች',
    'dailyCoach.startQuiz': 'ፈተና ጀምር',

    // Analytics
    'analytics.title': 'የትምህርት ትንታኔ',
    'analytics.subtitle': 'እድገትዎን ይከታተሉ እና መሻሻል ያለባቸውን ቦታዎች ይለዩ',
    'analytics.loadingAnalytics': 'ትንታኔዎን በመጫን ላይ...',
    'analytics.noData': 'የትንታኔ መረጃ የለም',
    'analytics.startLearning': 'እድገትዎን ለማየት መማር ይጀምሩ!',
    'analytics.learningStreak': 'የመማር ተከታታይነት',
    'analytics.days': 'ቀናት',
    'analytics.roadmapProgress': 'የመንገድ እድገት',
    'analytics.completed': 'ተጠናቋል',
    'analytics.confidenceScore': 'የበራስ መተማመን ነጥብ',
    'analytics.aiAssessed': 'በAI የተገመገመ',
    'analytics.timeInvested': 'የተጠቀመው ጊዜ',
    'analytics.hours': 'ሰዓታት',
    'analytics.aiInsights': 'የAI ትምህርት ግንዛቤዎች',
    'analytics.progressOverTime': 'በጊዜ ሂደት እድገት',
    'analytics.quizAccuracy': 'የፈተና ትክክለኛነት በምድብ',
    'analytics.skillsRadar': 'የክህሎት ራዳር',
    'analytics.yourStrengths': 'ጥንካሬዎችዎ',
    'analytics.completeMoreQuizzes': 'ጥንካሬዎችዎን ለመለየት ተጨማሪ ፈተናዎች ይውሰዱ!',
    'analytics.areasToImprove': 'መሻሻል ያለባቸው ቦታዎች',
    'analytics.keepPracticing': 'መሻሻል ያለባቸውን ቦታዎች ለመለየት መለማመድ ይቀጥሉ!',

    // Quiz
    'quiz.title': 'እውቀትዎን ይፈትኑ',
    'quiz.subtitle': 'ራስዎን በተለያየ ደረጃ ፈተናዎች ይፈታተኑ',
    'quiz.knowledgeQuiz': 'የእውቀት ፈተና',
    'quiz.lastResult': 'የመጨረሻ ፈተና ውጤት',
    'quiz.correct': 'ትክክል',
    'quiz.dismiss': 'አስወግድ',
    'quiz.chooseTopic': 'ርዕስ ይምረጡ',
    'quiz.customTopic': 'ወይም ሌላ ርዕስ ያስገቡ...',
    'quiz.selectDifficulty': 'ከባድነት ይምረጡ',
    'quiz.beginner': 'ጀማሪ',
    'quiz.intermediate': 'መካከለኛ',
    'quiz.advanced': 'የላቀ',
    'quiz.beginnerDesc': 'መሰረታዊ ፅንሰ-ሀሳቦች',
    'quiz.intermediateDesc': 'ተግባራዊ እውቀት እና ጥልቅ ግንዛቤ',
    'quiz.advancedDesc': 'ውስብስብ ችግሮች እና የባለሙያ ደረጃ ፈተናዎች',
    'quiz.questions': 'ጥያቄዎች',
    'quiz.generatingQuiz': 'ፈተና በማመንጨት ላይ...',
    'quiz.startQuiz': 'ጀምር',
    'quiz.selectTopic': 'እባክዎ ርዕስ ይምረጡ ወይም ያስገቡ',
    'quiz.failedGenerate': 'ፈተና ማመንጨት አልተሳካም። እንደገና ይሞክሩ።',

    // Settings
    'settings.title': 'ቅንብሮች',
    'settings.language': 'ቋንቋ',
    'settings.notifications': 'ማሳወቂያዎች',
    'settings.theme': 'ገጽታ',
    'settings.darkMode': 'ጨለማ ሁነታ',
    'settings.account': 'የመለያ ቅንብሮች',
    'settings.privacy': 'ግላዊነት',
    'settings.save': 'ቅንብሮችን አስቀምጥ',

    // Mentors
    'mentors.title': 'አማካሪ ፈልግ',
    'mentors.subtitle': 'በመስክዎ ልምድ ካላቸው ባለሙያዎች ጋር ይገናኙ',
    'mentors.search': 'አማካሪዎችን ፈልግ...',
    'mentors.filter': 'በሙያ አጣራ',
    'mentors.all': 'ሁሉም',
    'mentors.available': 'ይገኛሉ',
    'mentors.busy': 'ስራ ላይ',
    'mentors.limited': 'ውስን',
    'mentors.requestMentorship': 'አማካሪነት ጠይቅ',
    'mentors.viewLinkedIn': 'በLinkedIn ይመልከቱ',
    'mentors.mentees': 'ተማሪዎች',
    'mentors.experience': 'ልምድ',
    'mentors.noMentors': 'አማካሪ አልተገኘም',
    'mentors.becomeMentor': 'አማካሪ ይሁኑ',
    'mentors.becomeMentorDesc': 'የኢትዮጵያን ቴክ ትውልድ ቅርጽ ይስጡ',

    // Extended Tutor
    'tutor.startConversation': 'ውይይት ጀምር',
    'tutor.askAnything': 'ስለ STEM ጽንሰ-ሀሳቦች፣ የሙያ ምክር ወይም የትምህርት ጉዞዎ ማንኛውንም ነገር ይጠይቁ።',
    'tutor.supportedLanguages': 'በእንግሊዝኛ፣ አማርኛ፣ ኦሮምኛ፣ ትግርኛ ወይም ሶማሊኛ መልስ መስጠት እችላለሁ!',
    'tutor.voiceOn': 'ድምጽ በርቷል',
    'tutor.voiceOff': 'ድምጽ ጠፍቷል',
    'tutor.voiceNotAvailable': 'ድምጽ የለም',
    'tutor.clear': 'አጥፋ',
    'tutor.chatHistory': 'የውይይት ታሪክ',

    // Extended Opportunities
    'opportunities.subtitle': 'የስኮላርሺፕ፣ ልምምድ እና የስራ እድሎችን ያግኙ',
    'opportunities.loading': 'ለእርስዎ እድሎችን በመፈለግ ላይ...',
    'opportunities.noOpportunities': 'እድል አልተገኘም',
    'opportunities.setGoalFirst': 'ተዛማጅ እድሎችን ለማግኘት የስራ ግብ ያስቀምጡ',
    'opportunities.deadline': 'የመጨረሻ ቀን',
    'opportunities.location': 'ቦታ',
    'opportunities.apply': 'አሁን ያመልክቱ',
    'opportunities.learnMore': 'ተጨማሪ ይወቁ',

    // Extended Daily Coach
    'dailyCoach.oneHour': '1 ሰዓት',
    'dailyCoach.dailyTime': 'ዕለታዊ የትምህርት ጊዜ',
    'dailyCoach.markComplete': 'እንደተጠናቀቀ ምልክት አድርግ',
    'dailyCoach.markIncomplete': 'እንዳልተጠናቀቀ ምልክት አድርግ',

    // Career Goal Extended
    'career.yourGoal': 'የስራ ግብዎ',
    'career.changeGoal': 'ግብ ቀይር',
    'career.roadmapStages': 'የመንገድ ደረጃዎች',
    'career.newGoal': 'አዲስ የስራ ግብ',
    'career.findOpportunities': 'እድሎችን ፈልግ',
    'career.viewAnalytics': 'ትንታኔ ይመልከቱ',
    'career.takeQuiz': 'ፈተና ውሰድ',
    'career.talkToTutor': 'ከAI አስተማሪ ጋር አውራ',
    'career.goToDailyCoach': 'ዕለታዊ አሰልጣኝ',
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

    // Daily Coach
    'dailyCoach.title': 'Leenjisaa Guyyaa',
    'dailyCoach.subtitle': 'Hojii barnoota dhuunfaa kee har\'aaf qophaa\'e',
    'dailyCoach.streak': 'guyyaa walitti aanee',
    'dailyCoach.todayProgress': 'Guddina Har\'aa',
    'dailyCoach.tasks': 'hojii',
    'dailyCoach.timeInvested': 'Yeroo Dabale',
    'dailyCoach.min': 'daqiiqaa',
    'dailyCoach.allComplete': 'Hojiin hundi xumurame! Hojii gaarii!',
    'dailyCoach.todayTasks': 'Hojii Har\'aa',
    'dailyCoach.noTasks': 'Hojiin hin jiru. Kaayyoo hojii galchi!',
    'dailyCoach.preparing': 'Karoora guyyaa kee qopheessaa jira...',
    'dailyCoach.knowledgeCheck': 'Qormaata Beekumsa Guyyaa',
    'dailyCoach.testUnderstanding': 'Hubannoo kee qoradhu',
    'dailyCoach.questions': 'gaaffilee',
    'dailyCoach.startQuiz': 'Qormaata Jalqabi',

    // Analytics
    'analytics.title': 'Xiinxala Barnoota',
    'analytics.subtitle': 'Guddina kee hordofi naannoowwan fooyyessuu qabdu adda baasi',
    'analytics.loadingAnalytics': 'Xiinxala kee fe\'aa jira...',
    'analytics.noData': 'Deetaan xiinxala hin jiru',
    'analytics.startLearning': 'Guddina kee ilaaluuf baruu jalqabi!',
    'analytics.learningStreak': 'Wal-qaqqabsiisa Barnoota',
    'analytics.days': 'guyyaa',
    'analytics.roadmapProgress': 'Guddina Karaa',
    'analytics.completed': 'xumurameera',
    'analytics.confidenceScore': 'Qabxii Ofitti Amanamuu',
    'analytics.aiAssessed': 'AI\'n madaalame',
    'analytics.timeInvested': 'Yeroo Dabale',
    'analytics.hours': 'sa\'aatii',
    'analytics.aiInsights': 'Hubannoo Barnoota AI',
    'analytics.progressOverTime': 'Guddina Yeroo Keessa',
    'analytics.quizAccuracy': 'Sirna Qormaata Ramaddii',
    'analytics.skillsRadar': 'Raadaarii Dandeettii',
    'analytics.yourStrengths': 'Cimina Kee',
    'analytics.completeMoreQuizzes': 'Cimina kee adda baasuuf qormaata dabalataa fudhadhu!',
    'analytics.areasToImprove': 'Naannoowwan Fooyyessuu',
    'analytics.keepPracticing': 'Naannoowwan fooyyessuu qabdu adda baasuuf shaakala itti fufadhu!',

    // Quiz
    'quiz.title': 'Beekumsa Kee Qoradhu',
    'quiz.subtitle': 'Ofuma kee qormaata sadarkaa adda addaatiin qori',
    'quiz.knowledgeQuiz': 'Qormaata Beekumsa',
    'quiz.lastResult': 'Bu\'aa Qormaata Dhumaa',
    'quiz.correct': 'sirrii',
    'quiz.dismiss': 'Dhiisi',
    'quiz.chooseTopic': 'Mata-duree Fili',
    'quiz.customTopic': 'Yookiin mata-duree biraa galchi...',
    'quiz.selectDifficulty': 'Cimina Fili',
    'quiz.beginner': 'Jalqabaa',
    'quiz.intermediate': 'Giddu-galeessa',
    'quiz.advanced': 'Sadarkaa Olaanaa',
    'quiz.beginnerDesc': 'Yaad-rimee bu\'uuraa',
    'quiz.intermediateDesc': 'Beekumsa hojiirra oolchuu fi hubannoo gadi fagoo',
    'quiz.advancedDesc': 'Rakkoo walxaxaa fi qormaata sadarkaa ogeeyyii',
    'quiz.questions': 'gaaffilee',
    'quiz.generatingQuiz': 'Qormaata uumaa jira...',
    'quiz.startQuiz': 'Jalqabi',
    'quiz.selectTopic': 'Maaloo mata-duree fili yookiin galchi',
    'quiz.failedGenerate': 'Qormaata uumuu hin dandeenye. Irra deebi\'i yaali.',

    // Settings
    'settings.title': 'Qindaa\'inoota',
    'settings.language': 'Afaan',
    'settings.notifications': 'Beeksisa',
    'settings.theme': 'Bifa',
    'settings.darkMode': 'Haalata Dukkana',
    'settings.account': 'Qindaa\'ina Herrega',
    'settings.privacy': 'Iccitii',
    'settings.save': 'Qindaa\'inoota Olkaa\'i',

    // Mentors
    'mentors.title': 'Gorsitoota Barbaadi',
    'mentors.subtitle': 'Ogeessota muuxannoo qabu waliin wal qunnamii',
    'mentors.search': 'Gorsitoota barbaadi...',
    'mentors.filter': 'Ogummaadhaan qoodi',
    'mentors.all': 'Hunda',
    'mentors.available': 'Ni argamu',
    'mentors.busy': 'Hojii irra',
    'mentors.limited': 'Daangeffame',
    'mentors.requestMentorship': 'Gorsummaa Gaafadhu',
    'mentors.viewLinkedIn': 'LinkedIn irratti ilaali',
    'mentors.mentees': 'barattootaa',
    'mentors.experience': 'muuxannoo',
    'mentors.noMentors': 'Gorsitoonni hin argamne',
    'mentors.becomeMentor': 'Gorsitaa Ta\'i',
    'mentors.becomeMentorDesc': 'Dhaloota teeknikaa Itoophiyaa boca itti kenni',

    // Extended Tutor
    'tutor.startConversation': 'Haasaa jalqabi',
    'tutor.askAnything': 'Waa\'ee yaad-rimee STEM, gorsa hojii ykn imala barnoota kee waan kamiyyuu gaafadhu.',
    'tutor.supportedLanguages': 'Afaan Ingiliffaa, Amaariffaa, Oromiffaa, Tigrigna ykn Somaalee deebii kennuu nan danda\'a!',
    'tutor.voiceOn': 'Sagaleen Baname',
    'tutor.voiceOff': 'Sagaleen Cufame',
    'tutor.voiceNotAvailable': 'Sagaleen hin jiru',
    'tutor.clear': 'Haqi',
    'tutor.chatHistory': 'Seenaa Haasaa',

    // Extended Opportunities
    'opportunities.subtitle': 'Iskoolarshiippii, leenjii fi carraa hojii argadhu',
    'opportunities.loading': 'Siif carraalee barbaadaa jira...',
    'opportunities.noOpportunities': 'Carraan hin argamne',
    'opportunities.setGoalFirst': 'Carraalee walitti dhufan argachuuf kaayyoo hojii galchi',
    'opportunities.deadline': 'Guyyaa dhumaa',
    'opportunities.location': 'Iddoo',
    'opportunities.apply': 'Amma Iyyadhu',
    'opportunities.learnMore': 'Dabalata Bari',

    // Extended Daily Coach
    'dailyCoach.oneHour': 'Sa\'aatii 1',
    'dailyCoach.dailyTime': 'Yeroo barnoota guyyaa',
    'dailyCoach.markComplete': 'Xumurame jedhi',
    'dailyCoach.markIncomplete': 'Hin xumuramne jedhi',

    // Career Goal Extended
    'career.yourGoal': 'Kaayyoo Hojii Kee',
    'career.changeGoal': 'Kaayyoo Jijjiiri',
    'career.roadmapStages': 'Sadarkaalee Karaa',
    'career.newGoal': 'Kaayyoo Hojii Haaraa',
    'career.findOpportunities': 'Carraalee Barbaadi',
    'career.viewAnalytics': 'Xiinxala Ilaali',
    'career.takeQuiz': 'Qormaata Fudhadhu',
    'career.talkToTutor': 'Barsiisaa AI waliin Haasa\'i',
    'career.goToDailyCoach': 'Leenjisaa Guyyaa',
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

    // Daily Coach
    'dailyCoach.title': 'ናይ ዕለት መምህር',
    'dailyCoach.subtitle': 'ንሎሚ ዝተዳለወ ውልቃዊ ስራሕቲ ትምህርቲ',
    'dailyCoach.streak': 'ተኸታታሊ መዓልታት',
    'dailyCoach.todayProgress': 'ዕቤት ናይ ሎሚ',
    'dailyCoach.tasks': 'ስራሕቲ',
    'dailyCoach.timeInvested': 'ዝተጠቐምናዮ ግዜ',
    'dailyCoach.min': 'ደቒቕ',
    'dailyCoach.allComplete': 'ኩሉ ስራሕቲ ተዛዚሙ! ጽቡቕ ስራሕ!',
    'dailyCoach.todayTasks': 'ስራሕቲ ናይ ሎሚ',
    'dailyCoach.noTasks': 'ክሳብ ሕጂ ስራሕ የለን። ዕላማ ስራሕ ኣእቱ!',
    'dailyCoach.preparing': 'ናይ ዕለት መደብኻ እናዳለኹ ኣለኹ...',
    'dailyCoach.knowledgeCheck': 'ናይ ዕለት ፈተና ፍልጠት',
    'dailyCoach.testUnderstanding': 'ምርዳእካ ፈትን ብ',
    'dailyCoach.questions': 'ሕቶታት',
    'dailyCoach.startQuiz': 'ፈተና ጀምር',

    // Analytics
    'analytics.title': 'ትንተና ትምህርቲ',
    'analytics.subtitle': 'ዕቤትካ ተኸታተል እና ዘድሊ መመሕየሺ ቦታታት ለሊ',
    'analytics.loadingAnalytics': 'ትንተናኻ ይጽዓን ኣሎ...',
    'analytics.noData': 'ናይ ትንተና ሓበሬታ የለን',
    'analytics.startLearning': 'ዕቤትካ ንምርኣይ ምምሃር ጀምር!',
    'analytics.learningStreak': 'ተኸታታሊ ምምሃር',
    'analytics.days': 'መዓልታት',
    'analytics.roadmapProgress': 'ዕቤት መገዲ',
    'analytics.completed': 'ተዛዚሙ',
    'analytics.confidenceScore': 'ነጥቢ ርእሰ-ምትእምማን',
    'analytics.aiAssessed': 'ብAI ዝተገምገመ',
    'analytics.timeInvested': 'ዝተጠቐምናዮ ግዜ',
    'analytics.hours': 'ሰዓታት',
    'analytics.aiInsights': 'ናይ AI ትምህርታዊ ግንዛበታት',
    'analytics.progressOverTime': 'ዕቤት ብግዜ',
    'analytics.quizAccuracy': 'ትኽክለኛነት ፈተና ብምድብ',
    'analytics.skillsRadar': 'ራዳር ክእለት',
    'analytics.yourStrengths': 'ሓይልታትካ',
    'analytics.completeMoreQuizzes': 'ሓይልታትካ ንምፍላጥ ተወሳኺ ፈተናታት ውሰድ!',
    'analytics.areasToImprove': 'ዘድሊ መመሕየሺ ቦታታት',
    'analytics.keepPracticing': 'ዘድሊ መመሕየሺ ቦታታት ንምፍላጥ ምልምማድ ቀጽል!',

    // Quiz
    'quiz.title': 'ፍልጠትካ ፈትን',
    'quiz.subtitle': 'ነብስኻ ብፈተናታት ዝተፈላለየ ደረጃ ፈትን',
    'quiz.knowledgeQuiz': 'ፈተና ፍልጠት',
    'quiz.lastResult': 'ናይ መወዳእታ ውጽኢት ፈተና',
    'quiz.correct': 'ቅኑዕ',
    'quiz.dismiss': 'ኣወግድ',
    'quiz.chooseTopic': 'ኣርእስቲ ምረጽ',
    'quiz.customTopic': 'ወይ ካልእ ኣርእስቲ ኣእቱ...',
    'quiz.selectDifficulty': 'ጽንካረ ምረጽ',
    'quiz.beginner': 'ጀማሪ',
    'quiz.intermediate': 'ማእከላይ',
    'quiz.advanced': 'ልዑል',
    'quiz.beginnerDesc': 'መሰረታዊ ሓሳባት',
    'quiz.intermediateDesc': 'ተግባራዊ ፍልጠትን ዓሚቕ ምርዳእን',
    'quiz.advancedDesc': 'ዝተሓላለኸ ጸገማትን ናይ ክኢላ ደረጃ ፈተናታትን',
    'quiz.questions': 'ሕቶታት',
    'quiz.generatingQuiz': 'ፈተና ይፈጠር ኣሎ...',
    'quiz.startQuiz': 'ጀምር',
    'quiz.selectTopic': 'በጃኻ ኣርእስቲ ምረጽ ወይ ኣእቱ',
    'quiz.failedGenerate': 'ፈተና ምፍጣር ኣይተኻእለን። ደጊምካ ፈትን።',

    // Settings
    'settings.title': 'ቅጥዕታት',
    'settings.language': 'ቋንቋ',
    'settings.notifications': 'መፍለጢታት',
    'settings.theme': 'ቅርጺ',
    'settings.darkMode': 'ጸልማት ሁነታ',
    'settings.account': 'ቅጥዕታት ሕሳብ',
    'settings.privacy': 'ውልቃውነት',
    'settings.save': 'ቅጥዕታት ዓቅብ',

    // Mentors
    'mentors.title': 'ኣማኻሪ ድለ',
    'mentors.subtitle': 'ምስ ልምድታት ክኢላታት ተራኸብ',
    'mentors.search': 'ኣማኻሪታት ድለ...',
    'mentors.filter': 'ብሞያ ጽረ',
    'mentors.all': 'ኩሉ',
    'mentors.available': 'ይርከቡ',
    'mentors.busy': 'ስራሕ ኣለዎም',
    'mentors.limited': 'ውሱን',
    'mentors.requestMentorship': 'ኣማኻርነት ሕተት',
    'mentors.viewLinkedIn': 'ኣብ LinkedIn ርአ',
    'mentors.mentees': 'ተምሃሮ',
    'mentors.experience': 'ልምድ',
    'mentors.noMentors': 'ኣማኻሪ ኣይተረኽበን',
    'mentors.becomeMentor': 'ኣማኻሪ ኹን',
    'mentors.becomeMentorDesc': 'ንዝመጽእ ወለዶ ቴክ ኢትዮጵያ ቅርጺ ሃብ',

    // Extended Tutor
    'tutor.startConversation': 'ዝርርብ ጀምር',
    'tutor.askAnything': 'ብዛዕባ STEM ሓሳባት፣ ምኽሪ ሞያ ወይ ጉዕዞ ትምህርትኻ ዝኾነ ሕተት።',
    'tutor.supportedLanguages': 'ብእንግሊዝኛ፣ ኣምሓርኛ፣ ኦሮሚፋ፣ ትግርኛ ወይ ሶማሊ መልሲ ክህብ እኽእል!',
    'tutor.voiceOn': 'ድምጺ ተኸፊቱ',
    'tutor.voiceOff': 'ድምጺ ተዓጽዩ',
    'tutor.voiceNotAvailable': 'ድምጺ የለን',
    'tutor.clear': 'ኣጽሪ',
    'tutor.chatHistory': 'ታሪኽ ዝርርብ',

    // Extended Opportunities
    'opportunities.subtitle': 'ስኮላርሺፕ፣ ልምምድን ዕድላት ስራሕን ረኸብ',
    'opportunities.loading': 'ንዓኻ ዕድላት እደሊ ኣለኹ...',
    'opportunities.noOpportunities': 'ዕድል ኣይተረኽበን',
    'opportunities.setGoalFirst': 'ዝምልከቱ ዕድላት ንምርካብ ዕላማ ስራሕ ኣእቱ',
    'opportunities.deadline': 'ናይ መወዳእታ ዕለት',
    'opportunities.location': 'ቦታ',
    'opportunities.apply': 'ሕጂ ኣመልክት',
    'opportunities.learnMore': 'ተወሳኺ ፍለጥ',

    // Extended Daily Coach
    'dailyCoach.oneHour': '1 ሰዓት',
    'dailyCoach.dailyTime': 'ዕለታዊ ግዜ ትምህርቲ',
    'dailyCoach.markComplete': 'ከም ዝተዛዘመ ምልክት ግበር',
    'dailyCoach.markIncomplete': 'ከም ዘይተዛዘመ ምልክት ግበር',

    // Career Goal Extended
    'career.yourGoal': 'ዕላማ ስራሕካ',
    'career.changeGoal': 'ዕላማ ቀይር',
    'career.roadmapStages': 'ደረጃታት መገዲ',
    'career.newGoal': 'ሓድሽ ዕላማ ስራሕ',
    'career.findOpportunities': 'ዕድላት ድለ',
    'career.viewAnalytics': 'ትንተና ርአ',
    'career.takeQuiz': 'ፈተና ውሰድ',
    'career.talkToTutor': 'ምስ AI መምህር ተዛረብ',
    'career.goToDailyCoach': 'ዕለታዊ መምህር',
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

    // Daily Coach
    'dailyCoach.title': 'Tababaraha Maalinlaha',
    'dailyCoach.subtitle': 'Hawlahaaga waxbarashada shakhsiga ah ee maanta',
    'dailyCoach.streak': 'maalin isku xigta',
    'dailyCoach.todayProgress': 'Horumarka Maanta',
    'dailyCoach.tasks': 'hawlo',
    'dailyCoach.timeInvested': 'Waqtiga La Isticmaalay',
    'dailyCoach.min': 'daqiiqo',
    'dailyCoach.allComplete': 'Dhammaan hawlaha waa la dhammeeyay! Shaqo wanaagsan!',
    'dailyCoach.todayTasks': 'Hawlaha Maanta',
    'dailyCoach.noTasks': 'Weli hawlo ma jiraan. Hadafka shaqada geli!',
    'dailyCoach.preparing': 'Qorshaha maalinlaha ayaan diyaarinayaa...',
    'dailyCoach.knowledgeCheck': 'Imtixaanka Aqoonta Maalinlaha',
    'dailyCoach.testUnderstanding': 'Fahankaga tijaabi',
    'dailyCoach.questions': 'su\'aalo',
    'dailyCoach.startQuiz': 'Bilow Imtixaanka',

    // Analytics
    'analytics.title': 'Falanqaynta Waxbarashada',
    'analytics.subtitle': 'Raadi horumarka oo aqoonso meelaha la hagaajiyo',
    'analytics.loadingAnalytics': 'Falanqayntaada ayaa la soo rarrayaa...',
    'analytics.noData': 'Xog falanqayn ma jirto',
    'analytics.startLearning': 'Si aad u aragto horumarkaaga waxbarasho bilow!',
    'analytics.learningStreak': 'Isku Xirnaanta Waxbarashada',
    'analytics.days': 'maalin',
    'analytics.roadmapProgress': 'Horumarka Dariiqa',
    'analytics.completed': 'la dhammeeyay',
    'analytics.confidenceScore': 'Dhibcaha Kalsooni',
    'analytics.aiAssessed': 'AI ayaa qiimeeyay',
    'analytics.timeInvested': 'Waqtiga La Isticmaalay',
    'analytics.hours': 'saacadood',
    'analytics.aiInsights': 'Aragti Waxbarasho AI',
    'analytics.progressOverTime': 'Horumarka Waqti Gudihiisa',
    'analytics.quizAccuracy': 'Saxnaanta Imtixaanka Qaybta',
    'analytics.skillsRadar': 'Radar Xirfadaha',
    'analytics.yourStrengths': 'Awoodahaaga',
    'analytics.completeMoreQuizzes': 'Si aad u ogaato awoodahaaga imtixaano dheeri ah qaado!',
    'analytics.areasToImprove': 'Meelaha La Hagaajiyo',
    'analytics.keepPracticing': 'Si aad u ogaato meelaha la hagaajiyo ku sii wad tabababarka!',

    // Quiz
    'quiz.title': 'Tijaabi Aqoontaada',
    'quiz.subtitle': 'Naftaada ku tijaabi imtixaanno heer kala duwan',
    'quiz.knowledgeQuiz': 'Imtixaanka Aqoonta',
    'quiz.lastResult': 'Natiijaada Imtixaanka Ugu Dambeysa',
    'quiz.correct': 'sax',
    'quiz.dismiss': 'Iska daa',
    'quiz.chooseTopic': 'Dooro Mawduuc',
    'quiz.customTopic': 'Ama geli mawduuc kale...',
    'quiz.selectDifficulty': 'Dooro Adkaanta',
    'quiz.beginner': 'Bilowga',
    'quiz.intermediate': 'Dhexdhexaad',
    'quiz.advanced': 'Sare',
    'quiz.beginnerDesc': 'Fikradaha aasaasiga ah',
    'quiz.intermediateDesc': 'Aqoonta la hirgeliyo iyo faham qoto dheer',
    'quiz.advancedDesc': 'Dhibaatooyinka adag iyo imtixaano heer khabiir ah',
    'quiz.questions': 'su\'aalo',
    'quiz.generatingQuiz': 'Imtixaanka waa la samaynayaa...',
    'quiz.startQuiz': 'Bilow',
    'quiz.selectTopic': 'Fadlan dooro ama geli mawduuc',
    'quiz.failedGenerate': 'Samaynta imtixaanka wuu guul daraystay. Mar kale isku day.',

    // Settings
    'settings.title': 'Dejinta',
    'settings.language': 'Luqadda',
    'settings.notifications': 'Ogeysiisyada',
    'settings.theme': 'Muuqaalka',
    'settings.darkMode': 'Habka Madow',
    'settings.account': 'Dejinta Akoonka',
    'settings.privacy': 'Sirta',
    'settings.save': 'Kaydi Dejinta',

    // Mentors
    'mentors.title': 'Raadi La-talin',
    'mentors.subtitle': 'Kala xidhiidh khabiiro waayo-aragnimo leh',
    'mentors.search': 'Raadi la-taliye...',
    'mentors.filter': 'Ku kala sooc aqoonta',
    'mentors.all': 'Dhammaan',
    'mentors.available': 'Waa la heli karaa',
    'mentors.busy': 'Wuu mashquulsan yahay',
    'mentors.limited': 'Xaddidan',
    'mentors.requestMentorship': 'Codso La-talin',
    'mentors.viewLinkedIn': 'Ku arag LinkedIn',
    'mentors.mentees': 'ardayda',
    'mentors.experience': 'waayo-aragnimo',
    'mentors.noMentors': 'La-taliye lama helin',
    'mentors.becomeMentor': 'Noqo La-taliye',
    'mentors.becomeMentorDesc': 'Ka qayb qaado korinta jiilka tech ee Itoobiya',

    // Extended Tutor
    'tutor.startConversation': 'Bilow wadahadal',
    'tutor.askAnything': 'Wax kasta weydii ku saabsan STEM, talo shaqo, ama safarka waxbarashadaada.',
    'tutor.supportedLanguages': 'Waxaan ku jawaabi karaa Ingiriisi, Amxaarig, Oromiffa, Tigrinya, ama Soomaali!',
    'tutor.voiceOn': 'Codka Furan',
    'tutor.voiceOff': 'Codka Xiran',
    'tutor.voiceNotAvailable': 'Cod ma jiro',
    'tutor.clear': 'Nadiifi',
    'tutor.chatHistory': 'Taariikhda Wadahadalka',

    // Extended Opportunities
    'opportunities.subtitle': 'Hel deeq waxbarasho, tababar, iyo fursado shaqo',
    'opportunities.loading': 'Fursado kuu raadiyaa...',
    'opportunities.noOpportunities': 'Fursad lama helin',
    'opportunities.setGoalFirst': 'Geli hadafka shaqada si aad u hesho fursado ku habboon',
    'opportunities.deadline': 'Wakhtiga ugu dambeeya',
    'opportunities.location': 'Goobta',
    'opportunities.apply': 'Hadda Codso',
    'opportunities.learnMore': 'Wax badan Baro',

    // Extended Daily Coach
    'dailyCoach.oneHour': '1 saac',
    'dailyCoach.dailyTime': 'Waqtiga waxbarashada maalinlaha',
    'dailyCoach.markComplete': 'Calaamadee dhammaystiran',
    'dailyCoach.markIncomplete': 'Calaamadee aan dhammaystirnayn',

    // Career Goal Extended
    'career.yourGoal': 'Hadafkaaga Shaqada',
    'career.changeGoal': 'Bedel Hadafka',
    'career.roadmapStages': 'Heerarka Dariiqa',
    'career.newGoal': 'Hadaf Shaqo Cusub',
    'career.findOpportunities': 'Raadi Fursado',
    'career.viewAnalytics': 'Arag Falanqaynta',
    'career.takeQuiz': 'Qaado Imtixaan',
    'career.talkToTutor': 'La hadal Macalinka AI',
    'career.goToDailyCoach': 'Tababaraha Maalinlaha',
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
