import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  HelpCircle,
  Navigation,
  Map,
  Calendar,
  MessageCircle,
  Globe,
  Crown,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Lightbulb,
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const Help = () => {
  const { t } = useLanguage();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const guides = [
    {
      icon: Navigation,
      title: t('help.navigation'),
      description: t('help.navigationDesc'),
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Map,
      title: t('help.roadmap'),
      description: t('help.roadmapDesc'),
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Calendar,
      title: t('help.dailyCoach'),
      description: t('help.dailyCoachDesc'),
      color: 'bg-orange-100 text-orange-600',
    },
    {
      icon: MessageCircle,
      title: t('help.aiTutor'),
      description: t('help.aiTutorDesc'),
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Globe,
      title: t('help.language'),
      description: t('help.languageDesc'),
      color: 'bg-pink-100 text-pink-600',
    },
    {
      icon: Crown,
      title: t('help.membership'),
      description: t('help.membershipDesc'),
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  const faqs: FAQItem[] = [
    {
      question: t('help.faqDailyReset'),
      answer: t('help.faqDailyResetAnswer'),
    },
    {
      question: t('help.faqRoadmapGenerated'),
      answer: t('help.faqRoadmapGeneratedAnswer'),
    },
    {
      question: t('help.faqAiDifferent'),
      answer: t('help.faqAiDifferentAnswer'),
    },
    {
      question: t('help.faqLinkedinSearch'),
      answer: t('help.faqLinkedinSearchAnswer'),
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
          <HelpCircle className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{t('help.title')}</h1>
        <p className="mt-2 text-gray-600">{t('help.subtitle')}</p>
      </div>

      {/* How-To Guides */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Getting Started</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {guides.map((guide, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${guide.color}`}>
                  <guide.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{guide.title}</h3>
                  <p className="text-sm text-gray-600">{guide.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">{t('help.faq')}</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                {openFAQ === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openFAQ === index ? 'max-h-48' : 'max-h-0'
                }`}
              >
                <div className="p-4 pt-0 text-gray-600 text-sm">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl p-6 text-white text-center">
        <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
        <p className="opacity-90 mb-4">Our support team is here to help you succeed.</p>
        <a
          href="mailto:support@qineguide.com"
          className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Contact Support
        </a>
      </div>
    </div>
  );
};

export default Help;
