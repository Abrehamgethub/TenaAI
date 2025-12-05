import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { tutorApi } from '../api';
import ChatBubble from '../components/ChatBubble';
import MicrophoneButton from '../components/MicrophoneButton';
import TypingIndicator from '../components/TypingIndicator';
import ChatHistorySidebar from '../components/ChatHistorySidebar';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { Send, Loader2, MessageCircle, Trash2, Volume2, VolumeX, History } from 'lucide-react';
import AiMentorAvatar from '../components/AiMentorAvatar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: string;
  isTyping?: boolean;
}

const Tutor = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyId, setHistoryId] = useState<string | undefined>();
  const [voiceMode, setVoiceMode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { t, language } = useLanguage();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    transcript,
    finalTranscript,
    isListening,
    isSupported: speechSupported,
    startListening,
    stopListening,
    clearTranscript,
  } = useSpeechRecognition(language);

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isSupported: ttsSupported,
    isLanguageSupported: ttsLanguageSupported,
  } = useTextToSpeech(language);

  const location = useLocation();

  // Stop speech when route changes
  useEffect(() => {
    stopSpeaking();
  }, [location.pathname, stopSpeaking]);

  // Update input only when we get a FINAL transcript (not interim)
  useEffect(() => {
    if (finalTranscript) {
      setInput((prev) => prev + (prev ? ' ' : '') + finalTranscript);
      // Clear the transcript after adding to input to prevent duplicates
      clearTranscript();
    }
  }, [finalTranscript, clearTranscript]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
      language: language, // Store the language with the message
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await tutorApi.chat(userMessage.content, language, historyId);

      if (response.success && response.data) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date().toISOString(),
          language: language, // Store the language with the response
        };
        setMessages((prev) => [...prev, aiMessage]);

        if (response.data.historyId) {
          setHistoryId(response.data.historyId);
        }

        // Speak the response if voice mode is enabled and language is supported
        if (voiceMode && ttsSupported && ttsLanguageSupported) {
          speak(response.data.response);
        }
      }
    } catch (error: unknown) {
      console.error('Failed to get response:', error);
      
      // Map error codes to user-friendly messages
      const errorResponse = error as { response?: { data?: { code?: string; error?: string } } };
      const errorCode = errorResponse?.response?.data?.code;
      
      let userMessage = t('tutor.errorGeneric');
      if (errorCode === 'AI_TIMEOUT') {
        userMessage = t('tutor.errorTimeout');
      } else if (errorCode === 'AI_QUOTA') {
        userMessage = t('tutor.errorQuota');
      } else if (errorCode === 'AI_NO_ANSWER') {
        userMessage = t('tutor.errorNoAnswer');
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: userMessage,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setHistoryId(undefined);
  };

  const handleSelectHistory = (selectedHistoryId: string, historyMessages: Message[]) => {
    setMessages(historyMessages);
    setHistoryId(selectedHistoryId);
    setShowHistory(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setHistoryId(undefined);
    setShowHistory(false);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] animate-fade-in gap-4">
      {/* Chat History Sidebar - Desktop */}
      {user && showHistory && (
        <div className="hidden md:block w-72 flex-shrink-0">
          <ChatHistorySidebar
            currentHistoryId={historyId}
            onSelectHistory={handleSelectHistory}
            onNewChat={handleNewChat}
            isOpen={showHistory}
            onToggle={() => setShowHistory(!showHistory)}
          />
        </div>
      )}

      {/* Mobile History Sidebar */}
      {user && showHistory && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" onClick={() => setShowHistory(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-soft-lg animate-slide-in">
            <ChatHistorySidebar
              currentHistoryId={historyId}
              onSelectHistory={handleSelectHistory}
              onNewChat={handleNewChat}
              isOpen={showHistory}
              onToggle={() => setShowHistory(false)}
            />
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Friendly and Warm */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {user && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2.5 hover:bg-surface-100 rounded-xl transition-all duration-200 hover:scale-105"
                title={t('tutor.chatHistory') || 'Past conversations'}
              >
                <History className="h-5 w-5 text-text-secondary" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{t('tutor.title') || 'Your AI Tutor'}</h1>
              <p className="text-sm text-text-muted">{t('tutor.subtitle') || 'Ask me anything, I\'m here to help!'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Voice Mode Toggle */}
            {ttsSupported && ttsLanguageSupported && (
              <button
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setVoiceMode(!voiceMode);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-[1.02] ${
                  voiceMode
                    ? 'bg-primary-100 text-primary-600 shadow-soft'
                    : 'bg-surface-100 text-text-secondary hover:bg-surface-200'
                }`}
              >
                {voiceMode ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span className="hidden sm:inline">{voiceMode ? t('tutor.voiceOn') || 'Voice On' : t('tutor.voiceOff') || 'Voice Off'}</span>
              </button>
            )}
            {/* TTS Not Available Notice - Soft and Non-intrusive */}
            {ttsSupported && !ttsLanguageSupported && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-50 text-amber-700 text-sm">
                <VolumeX className="h-4 w-4" />
                <span>{t('tutor.voiceNotAvailable') || 'Voice not available for this language yet'}</span>
              </div>
            )}
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-100 text-text-secondary text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t('tutor.clear') || 'Start fresh'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Chat Area - Modern and Clean */}
        <div className="flex-1 overflow-y-auto rounded-3xl bg-white shadow-card p-6 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fade-in-up">
              {/* Friendly Mentor Avatar */}
              <div className="relative mb-6">
                <div className="h-24 w-24 rounded-full overflow-hidden shadow-soft-lg ring-4 ring-primary-100">
                  <AiMentorAvatar className="h-24 w-24" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-accent-300 rounded-full flex items-center justify-center shadow-soft">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                {t('tutor.startConversation') || 'Hi! I\'m here to help you learn'}
              </h3>
              <p className="text-text-secondary max-w-md mb-8 leading-relaxed">
                {t('tutor.askAnything') || 'Ask me anything about your studies, career path, or just say hello. I speak English, Amharic, Oromiffa, Tigrigna, and Somali!'}
              </p>
              
              {/* Friendly Suggestions */}
              <div className="flex flex-wrap justify-center gap-3 max-w-lg">
                {[
                  { text: t('tutor.suggestion1') || 'Help me understand coding', icon: '💻' },
                  { text: t('tutor.suggestion2') || 'What career suits me?', icon: '🎯' },
                  { text: t('tutor.suggestion3') || 'Explain this concept simply', icon: '💡' },
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion.text)}
                    className="flex items-center gap-2 px-5 py-3 rounded-full bg-surface-50 border border-surface-200 text-text-secondary hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 transition-all duration-200 hover:scale-[1.02] hover:shadow-soft"
                  >
                    <span>{suggestion.icon}</span>
                    <span className="text-sm font-medium">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={message.id} 
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ChatBubble
                    role={message.role}
                    content={message.content}
                    timestamp={message.timestamp}
                  />
                </div>
              ))}
              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Warm and Inviting */}
        <div className="mt-4 flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('tutor.placeholder') || 'Type your question here...'}
              rows={1}
              className="w-full resize-none rounded-2xl bg-white border border-surface-200 py-4 pl-5 pr-14 text-text-primary placeholder-text-muted shadow-soft focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100/50 transition-all duration-200"
              style={{ minHeight: '56px', maxHeight: '120px' }}
            />
            {isListening && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute h-3 w-3 rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-xs text-red-500 font-medium">
                  {transcript ? transcript.slice(0, 20) + (transcript.length > 20 ? '...' : '') : t('tutor.listening') || 'Listening...'}
                </span>
              </div>
            )}
          </div>
          <MicrophoneButton
            isListening={isListening}
            isSupported={speechSupported}
            onClick={handleMicClick}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="btn-primary !p-4 !rounded-2xl shadow-button disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Quick Actions - Friendly and Helpful */}
        {messages.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: t('tutor.explainSimply') || 'Explain simply', icon: '✨' },
              { label: t('tutor.giveExample') || 'Give me an example', icon: '📝' },
              { label: t('tutor.showSteps') || 'Show me the steps', icon: '📋' },
            ].map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(action.label);
                }}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-50 border border-surface-200 text-sm text-text-secondary hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 disabled:opacity-50 transition-all duration-200"
              >
                <span>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tutor;
