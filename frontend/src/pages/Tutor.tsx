import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { tutorApi } from '../api';
import ChatBubble from '../components/ChatBubble';
import MicrophoneButton from '../components/MicrophoneButton';
import TypingIndicator from '../components/TypingIndicator';
import QuickActions from '../components/QuickActions';
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
    unsupportedMessage: ttsUnsupportedMessage,
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
    } catch (error) {
      console.error('Failed to get response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
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
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowHistory(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white">
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
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Chat History"
              >
                <History className="h-5 w-5 text-gray-600" />
              </button>
            )}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 mb-2">
                <MessageCircle className="h-4 w-4" />
                AI Tutor
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{t('tutor.title')}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Voice Mode Toggle - Only show for supported languages */}
            {ttsSupported && ttsLanguageSupported && (
              <button
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setVoiceMode(!voiceMode);
                }}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  voiceMode
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {voiceMode ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                Voice {voiceMode ? 'On' : 'Off'}
              </button>
            )}
            {/* Show message when language doesn't support TTS */}
            {ttsSupported && !ttsLanguageSupported && ttsUnsupportedMessage && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                <VolumeX className="h-4 w-4" />
                <span className="hidden sm:inline">Voice not available</span>
              </div>
            )}
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="h-20 w-20 rounded-full overflow-hidden mb-4 shadow-lg">
                <AiMentorAvatar className="h-20 w-20" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
              <p className="text-gray-500 max-w-sm">
                Ask me anything about STEM concepts, career advice, or your learning journey. I can respond in English, Amharic, Oromiffa, Tigrigna, or Somali!
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {[
                  'Explain machine learning',
                  'What is recursion?',
                  'How do databases work?',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatBubble
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                />
              ))}
              {loading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="mt-4 flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('tutor.placeholder')}
              rows={1}
              className="w-full resize-none rounded-xl border border-gray-200 py-3 pl-4 pr-12 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            {isListening && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-500 animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                {transcript ? transcript.slice(0, 30) + (transcript.length > 30 ? '...' : '') : t('tutor.listening')}
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
            className="rounded-full bg-primary-600 p-3 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Quick Actions */}
        {messages.length > 0 && (
          <QuickActions
            onAction={(prompt) => {
              setInput(prompt);
              handleSend();
            }}
            disabled={loading}
            context={messages[messages.length - 1]?.content}
          />
        )}
      </div>
    </div>
  );
};

export default Tutor;
