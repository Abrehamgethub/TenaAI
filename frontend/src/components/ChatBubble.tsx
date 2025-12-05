import { User } from 'lucide-react';
import AiMentorAvatar from './AiMentorAvatar';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

const ChatBubble = ({ role, content, timestamp }: ChatBubbleProps) => {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in-up`}>
      {/* Avatar - Warm and Personal */}
      {isUser ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-soft">
          <User className="h-5 w-5" />
        </div>
      ) : (
        <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden ring-2 ring-white shadow-soft">
          <AiMentorAvatar className="h-10 w-10" />
        </div>
      )}

      {/* Message Bubble - Soft and Modern */}
      <div className={`flex max-w-[75%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-5 py-3 shadow-soft ${
            isUser
              ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-3xl rounded-br-lg'
              : 'bg-gradient-to-br from-surface-50 to-surface-100 text-text-primary rounded-3xl rounded-bl-lg border border-surface-200'
          }`}
        >
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{content}</p>
        </div>
        {timestamp && (
          <span className="mt-1.5 text-xs text-text-muted px-1">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
