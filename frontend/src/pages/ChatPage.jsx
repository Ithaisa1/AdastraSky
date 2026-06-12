/**
 * AdastraSky Frontend - Página de Chat Conversacional
 * Interfaz minimalista con el Agente Astronómico
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Send, Bot, User, Star } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://aadastra-sky-backend.onrender.com';

const ChatPage = () => {
  const { t, i18n } = useTranslation();
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/chat`,
        {
          message: userMessage,
          language: i18n.language || 'es',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const aiMessage = response.data.data.response;
      setMessages((prev) => [...prev, { role: 'assistant', content: aiMessage }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen w-full bg-astroDark flex overflow-hidden">
      {/* Sidebar de Navegación */}
      <Sidebar />

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col p-3 overflow-y-auto">
        {/* Header */}
        <div className="bg-astroCard border-b border-white/10 p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-solarFlare to-nebulaPink rounded-full flex items-center justify-center shadow-[0_0_16px_rgba(245,158,11,0.3)]">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">{t('chat.title')}</h1>
                <p className="text-xs text-gray-400 truncate max-w-[200px] sm:max-w-none">Conectado como {user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-solarFlare/20 to-nebulaPink/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-solarFlare/20">
                  <Star className="w-10 h-10 text-solarFlare" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {t('chat.title')}
                </h3>
                <p className="text-gray-400 max-w-md">
                  Pregunta sobre los cielos de Canarias, observatorios, condiciones meteorológicas
                  o cualquier tema astronómico.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 ${
                    message.role === 'user'
                      ? 'bg-astroAccent text-white'
                      : 'bg-astroCard text-gray-100 border border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-solarFlare/20 to-nebulaPink/20 rounded-full flex items-center justify-center flex-shrink-0 border border-solarFlare/20">
                        <Star className="w-4 h-4 text-solarFlare" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Thinking Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-astroCard border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-solarFlare/20 to-nebulaPink/20 rounded-full flex items-center justify-center border border-solarFlare/20">
                    <Star className="w-4 h-4 text-solarFlare" />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-solarFlare rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-solarFlare rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-solarFlare rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-gray-400">{t('chat.thinking')}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-astroCard border-t border-white/10 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chat.placeholder')}
              className="flex-1 px-4 py-3 bg-astroDark/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-astroAccent focus:ring-2 focus:ring-astroAccent/20 transition-all duration-300"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">{t('chat.send')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
