import { ChevronDown, ChevronUp, BookOpen, Clock, Zap, Check, Play, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

interface RoadmapStageProps {
  stageNumber: number;
  title: string;
  description: string;
  resources: string[];
  duration?: string;
  skills?: string[];
  isCompleted?: boolean;
  onToggleComplete?: () => void;
  totalStages?: number;
}

const RoadmapStageCard = ({
  stageNumber,
  title,
  description,
  resources,
  duration,
  skills,
  isCompleted = false,
  onToggleComplete,
  totalStages = 5,
}: RoadmapStageProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Calculate progress for the circular indicator
  const progressPercent = (stageNumber / totalStages) * 100;
  const circumference = 2 * Math.PI * 18; // radius = 18
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div
      className={`rounded-2xl border-2 transition-all duration-300 ${
        isCompleted 
          ? 'border-accent-200 bg-gradient-to-r from-accent-50/50 to-white shadow-soft' 
          : 'border-surface-200 bg-white hover:border-primary-200 hover:shadow-soft'
      }`}
    >
      {/* Header - Accordion Style */}
      <div
        className="flex cursor-pointer items-center justify-between p-5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          {/* Progress Ring with Stage Number */}
          <div className="relative flex-shrink-0">
            <svg className="h-12 w-12 -rotate-90">
              {/* Background circle */}
              <circle
                cx="24"
                cy="24"
                r="18"
                fill="none"
                stroke={isCompleted ? '#A7F3D0' : '#E2E8F0'}
                strokeWidth="4"
              />
              {/* Progress circle */}
              <circle
                cx="24"
                cy="24"
                r="18"
                fill="none"
                stroke={isCompleted ? '#70C29B' : '#4A8EF0'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={isCompleted ? 0 : strokeDashoffset}
                className="transition-all duration-500"
              />
            </svg>
            {/* Number or Check */}
            <div className={`absolute inset-0 flex items-center justify-center ${
              isCompleted ? 'text-accent-500' : 'text-primary-500'
            }`}>
              {isCompleted ? (
                <Check className="h-5 w-5" />
              ) : (
                <span className="font-bold text-sm">{stageNumber}</span>
              )}
            </div>
          </div>

          {/* Title & Description Preview */}
          <div className="min-w-0">
            <h3 className={`font-semibold ${isCompleted ? 'text-accent-700' : 'text-text-primary'}`}>
              {title.replace(/^Stage \d+:?\s*/i, '')}
            </h3>
            {!isExpanded && (
              <p className="text-sm text-text-muted line-clamp-1 mt-0.5">{description}</p>
            )}
          </div>
        </div>

        {/* Expand Button */}
        <div className={`p-2 rounded-xl transition-all ${isExpanded ? 'bg-primary-50' : 'hover:bg-surface-100'}`}>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-primary-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-text-muted" />
          )}
        </div>
      </div>

      {/* Expanded Content - Accordion Body */}
      <div className={`overflow-hidden transition-all duration-300 ${
        isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-5 pb-5 pt-0 border-t border-surface-100">
          {/* Description */}
          <p className="mt-4 text-sm text-text-secondary leading-relaxed">{description}</p>

          {/* Duration & Skills Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {duration && (
              <div className="flex items-center gap-1.5 text-xs font-medium bg-primary-50 text-primary-600 px-3 py-1.5 rounded-full">
                <Clock className="h-3.5 w-3.5" />
                <span>{duration}</span>
              </div>
            )}
            {skills && skills.slice(0, 3).map((skill, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs font-medium bg-surface-100 text-text-secondary px-3 py-1.5 rounded-full">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>{skill}</span>
              </div>
            ))}
          </div>

          {/* Resources */}
          {resources.length > 0 && (
            <div className="mt-4">
              <h4 className="flex items-center gap-2 text-sm font-medium text-text-primary mb-3">
                <BookOpen className="h-4 w-4 text-primary-500" />
                {t('roadmap.resources') || 'Learning Resources'}
              </h4>
              <div className="space-y-2">
                {resources.slice(0, 3).map((resource, index) => {
                  // Detect and sanitize external URLs
                  const isExternalUrl = /^https?:\/\//i.test(resource) || 
                                        resource.startsWith('//') ||
                                        /^\/https?:\/\//i.test(resource);
                  
                  // Clean URL: remove leading slash before http(s)
                  let cleanUrl = resource;
                  if (/^\/https?:\/\//i.test(resource)) {
                    cleanUrl = resource.substring(1);
                  } else if (resource.startsWith('//')) {
                    cleanUrl = 'https:' + resource;
                  }
                  
                  // Final URL - external or Google search
                  const href = isExternalUrl 
                    ? cleanUrl 
                    : `https://www.google.com/search?q=${encodeURIComponent(resource)}`;
                  
                  // Display text
                  const displayText = isExternalUrl 
                    ? (t('roadmap.visitResource') || 'Visit resource')
                    : resource;
                  
                  return (
                    <a
                      key={index}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-xl transition-colors"
                      onClick={(e) => e.stopPropagation()}
                      title={isExternalUrl ? cleanUrl : resource}
                    >
                      <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{isExternalUrl ? displayText : resource}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            {/* Start This Step Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/daily-coach');
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium shadow-button hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
            >
              <Play className="h-4 w-4" />
              {t('roadmap.startStep') || 'Start This Step'}
            </button>
            
            {/* Complete Toggle */}
            {onToggleComplete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete();
                }}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isCompleted
                    ? 'bg-accent-100 text-accent-700 hover:bg-accent-200'
                    : 'bg-surface-100 text-text-secondary hover:bg-surface-200'
                }`}
              >
                {isCompleted ? (
                  <>
                    <Check className="h-4 w-4" />
                    {t('roadmap.completed') || 'Completed!'}
                  </>
                ) : (
                  t('roadmap.markComplete') || 'Mark Done'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapStageCard;
