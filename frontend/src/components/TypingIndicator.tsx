import AiMentorAvatar from './AiMentorAvatar';

const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      {/* AI Avatar */}
      <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden ring-2 ring-white shadow-soft">
        <AiMentorAvatar className="h-10 w-10" />
      </div>
      
      {/* Typing Bubble */}
      <div className="bg-gradient-to-br from-surface-50 to-surface-100 rounded-3xl rounded-bl-lg px-5 py-4 shadow-soft border border-surface-200">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot" style={{ animationDelay: '0s' }}></span>
          <span className="typing-dot" style={{ animationDelay: '0.2s' }}></span>
          <span className="typing-dot" style={{ animationDelay: '0.4s' }}></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
