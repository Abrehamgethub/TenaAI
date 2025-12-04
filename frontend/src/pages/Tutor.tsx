import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { tutorApi } from '../api';
import ChatBubble from '../components/ChatBubble';
import MicrophoneButton from '../components/MicrophoneButton';
import TypingIndicator from '../components/TypingIndicator';
import QuickActions from '../components/QuickActions';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { Send, Loader2, MessageCircle, Trash2, Volume2, VolumeX } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isTyping?: boolean;
}

const Tutor = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyId, setHistoryId] = useState<string | undefined>();
  const [voiceMode, setVoiceMode] = useState(false);

  const { t, language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    transcript,
    isListening,
    isSupported: speechSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition(language);

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isSupported: ttsSupported,
  } = useTextToSpeech(language);

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInput((prev) => prev + (prev ? ' ' : '') + transcript);
    }
  }, [transcript]);

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
        };
        setMessages((prev) => [...prev, aiMessage]);

        if (response.data.historyId) {
          setHistoryId(response.data.historyId);
        }

        // Speak the response if voice mode is enabled
        if (voiceMode && ttsSupported) {
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

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700 mb-2">
            <MessageCircle className="h-4 w-4" />
            AI Tutor
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('tutor.title')}</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Voice Mode Toggle */}
          {ttsSupported && (
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
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-4">
              <MessageCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
            <p className="text-gray-500 max-w-sm">
              Ask me anything about STEM concepts, career advice, or your learning journey. I can respond in English, Amharic, or Afan Oromo!
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
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-500 animate-pulse">
              {t('tutor.listening')}
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
  );
};

export default Tutor;
