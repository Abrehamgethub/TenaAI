import { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Languages, 
  FileQuestion,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface QuickActionsProps {
  onAction: (action: string) => void;
  disabled?: boolean;
  context?: string;
}

const QuickActions = ({ onAction, disabled, context }: QuickActionsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const actions = [
    { id: 'summarize', icon: Sparkles, label: 'Summarize', prompt: `Summarize this briefly: ${context}` },
    { id: 'simplify', icon: BookOpen, label: 'Simplify', prompt: `Explain this in simpler terms: ${context}` },
    { id: 'translate', icon: Languages, label: 'Translate', prompt: `Translate this to Amharic: ${context}` },
    { id: 'quiz', icon: FileQuestion, label: 'Quiz Me', prompt: `Create a quick quiz about: ${context}` },
  ];

  if (!context) return null;

  return (
    <div className="fixed bottom-24 right-6 z-40">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-2 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all"
      >
        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
      </button>

      {/* Actions */}
      {isExpanded && (
        <div className="flex flex-col gap-2 animate-fade-in">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                onAction(action.prompt);
                setIsExpanded(false);
              }}
              disabled={disabled}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-md hover:bg-gray-50 hover:border-primary-300 transition-all disabled:opacity-50"
            >
              <action.icon className="h-4 w-4 text-primary-600" />
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickActions;
