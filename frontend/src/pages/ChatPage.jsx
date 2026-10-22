/**
 * AdastraSky Frontend - Página de Chat Conversacional
 * Interfaz minimalista con el Agente Astronómico.
 *
 * Memoria: el session_id de la conversación se guarda por usuario en
 * localStorage y se envía en cada mensaje; el backend recupera los turnos
 * previos de esa sesión (solo del usuario autenticado) y se los pasa al agente.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Send, User, Star, Plus, History, Trash2, BookOpen, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import RichText from '../components/RichText';
import axios from 'axios';
import { API_URL } from '../config/api';

const MAX_LENGTH = 4000;
const sessionKey = (userId) => `adastra.chat.session.${userId || 'anon'}`;

const readSession = (userId) => {
  try {
    return localStorage.getItem(sessionKey(userId));
  } catch {
    return null;
  }
};
const writeSession = (userId, sid) => {
  try {
    if (sid) localStorage.setItem(sessionKey(userId), sid);
    else localStorage.removeItem(sessionKey(userId));
  } catch {
    /* almacenamiento no disponible */
  }
};

export const errorKeyFor = (error) => {
  const status = error?.response?.status;
  const code = error?.response?.data?.code;
  if (status === 429) return 'chat.errors.busy';
  if (code === 'AI_SERVICE_UNAVAILABLE' || code === 'AI_SERVICE_TIMEOUT' || error?.code === 'ECONNABORTED') return 'chat.errors.starting';
  if (status === 401 || status === 403) return 'chat.errors.session';
  if (code === 'MESSAGE_TOO_LONG') return 'chat.errors.tooLong';
  return 'chat.errors.generic';
};

const SourceList = ({ sources, t }) => {
  if (!sources?.length) return null;
  return (
    <div className="mt-3 pt-2 border-t border-white/10">
      <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-gray-400 mb-1">
        <BookOpen className="w-3 h-3" aria-hidden="true" /> {t('chat.sources')}
      </p>
      <ul className="flex flex-wrap gap-1.5">
        {sources.map((s, i) => (
          <li key={`${s.title}-${s.section}-${i}`} className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
            {s.source?.startsWith('http') ? (
              <a href={s.source} target="_blank" rel="noopener noreferrer" className="hover:text-white underline">{s.title}</a>
            ) : (
              <>{s.title}{s.section ? ` · ${s.section}` : ''}</>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const ChatPage = () => {
  const { t, i18n } = useTranslation();
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState('connecting');
  const [sessionId, setSessionId] = useState(() => readSession(user?.id));
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [sessions, setSessions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Despierta el servicio de IA (plan gratuito: arranque en frío)
  useEffect(() => {
    let cancelled = false;
    const warmUp = async () => {
      try {
        const res = await fetch(`${API_URL}/api/chat/warmup`);
        if (!cancelled) setAiStatus(res.ok ? 'ready' : 'connecting');
      } catch {
        if (!cancelled) setAiStatus('connecting');
      }
    };
    warmUp();
    const interval = setInterval(warmUp, 45000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const loadConversation = useCallback(async (sid) => {
    if (!sid || !token) return;
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/chat/history/${sid}`, { headers: { Authorization: `Bearer ${token}` }, params: { order: 'asc', limit: 100 } });
      const rows = res.data?.data?.history || [];
      setMessages(rows.flatMap((r) => [
        { role: 'user', content: r.message },
        ...(r.response ? [{ role: 'assistant', content: r.response, sources: r.sources || [] }] : []),
      ]));
    } catch {
      setMessages([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [token]);

  // Recupera la conversación activa al entrar
  // Recupera la conversación activa en cuanto se conoce el usuario
  const restoredFor = useRef(null);
  useEffect(() => {
    if (!user?.id || restoredFor.current === user.id) return;
    restoredFor.current = user.id;
    const sid = readSession(user.id);
    if (sid) {
      setSessionId(sid);
      loadConversation(sid);
    }
  }, [user?.id, loadConversation]);

  const startNewConversation = () => {
    setSessionId(null);
    writeSession(user?.id, null);
    setMessages([]);
    setShowSessions(false);
    inputRef.current?.focus();
  };

  const openSessions = async () => {
    setShowSessions((v) => !v);
    try {
      const res = await axios.get(`${API_URL}/api/chat/sessions`, authHeaders);
      setSessions(res.data?.data?.sessions || []);
    } catch {
      setSessions([]);
    }
  };

  const selectSession = (sid) => {
    setSessionId(sid);
    writeSession(user?.id, sid);
    setShowSessions(false);
    loadConversation(sid);
  };

  const deleteSessionById = async (sid) => {
    if (!window.confirm(t('chat.confirmDelete'))) return;
    try {
      await axios.delete(`${API_URL}/api/chat/history/${sid}`, authHeaders);
      setSessions((list) => list.filter((s) => s.session_id !== sid));
      if (sid === sessionId) startNewConversation();
    } catch {
      /* se mantiene la lista */
    }
  };

  const sendMessage = async (text, attempt = 0) => {
    const userMessage = (text ?? '').trim();
    if (!userMessage || (isLoading && attempt === 0)) return;
    if (attempt === 0) {
      setInput('');
      setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/chat`,
        { message: userMessage, language: i18n.language || 'es', ...(sessionId && { session_id: sessionId }) },
        { ...authHeaders, timeout: 120000 }
      );
      const data = response.data.data;
      if (data.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id);
        writeSession(user?.id, data.session_id);
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response, sources: data.sources || [] }]);
      setAiStatus('ready');
      setIsLoading(false);
    } catch (error) {
      const retriable = error.code === 'ECONNABORTED' || [502, 503, 504].includes(error.response?.status);
      if (attempt < 2 && retriable) {
        setTimeout(() => sendMessage(userMessage, attempt + 1), 2000 * (attempt + 1));
        return;
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: t(errorKeyFor(error)), isError: true }]);
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent?.isComposing) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const suggestions = [t('chat.suggestions.roque'), t('chat.suggestions.saturn'), t('chat.suggestions.law')];

  return (
    <div className="h-screen w-full bg-astroDark flex overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col p-3 overflow-hidden min-w-0">
        {/* Cabecera */}
        <header className="bg-astroCard border-b border-white/10 p-4 rounded-t-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-solarFlare to-nebulaPink rounded-full flex items-center justify-center shadow-[0_0_16px_rgba(245,158,11,0.3)]">
                <Star className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-white">{t('chat.title')}</h1>
                <p className="text-xs text-gray-400 truncate" aria-live="polite">
                  {aiStatus === 'connecting' ? t('chat.connecting') : t('chat.connectedAs', { email: user?.email })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button type="button" onClick={openSessions} aria-expanded={showSessions} aria-controls="chat-sessions"
                className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10" title={t('chat.history')}>
                <History className="w-5 h-5" aria-hidden="true" />
                <span className="sr-only">{t('chat.history')}</span>
              </button>
              <button type="button" onClick={startNewConversation}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-white bg-white/10 hover:bg-white/20">
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t('chat.newConversation')}</span>
                <span className="sr-only sm:hidden">{t('chat.newConversation')}</span>
              </button>
            </div>
          </div>

          {showSessions && (
            <div id="chat-sessions" className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-white/10 bg-astroDark/60">
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                <h2 className="text-sm font-medium text-white">{t('chat.history')}</h2>
                <button type="button" onClick={() => setShowSessions(false)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" aria-hidden="true" /><span className="sr-only">{t('common.close')}</span>
                </button>
              </div>
              {sessions.length === 0 ? (
                <p className="px-3 py-4 text-sm text-gray-400">{t('chat.noHistory')}</p>
              ) : (
                <ul>
                  {sessions.map((s) => (
                    <li key={s.session_id} className={`flex items-center gap-2 px-3 py-2 text-sm border-b border-white/5 ${s.session_id === sessionId ? 'bg-white/10' : ''}`}>
                      <button type="button" onClick={() => selectSession(s.session_id)} className="flex-1 text-left text-gray-200 hover:text-white truncate">
                        {s.title || t('chat.untitled')}
                        <span className="block text-[11px] text-gray-500">
                          {new Date(s.last_message_at).toLocaleString(i18n.language)} · {t('chat.messagesCount', { count: s.messages })}
                        </span>
                      </button>
                      <button type="button" onClick={() => deleteSessionById(s.session_id)} className="p-1 text-gray-500 hover:text-red-400" title={t('chat.delete')}>
                        <Trash2 className="w-4 h-4" aria-hidden="true" /><span className="sr-only">{t('chat.delete')}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </header>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite" aria-busy={isLoading || historyLoading}>
          {historyLoading ? (
            <p className="text-center text-sm text-gray-400">{t('common.loading')}</p>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-gradient-to-br from-solarFlare/20 to-nebulaPink/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-solarFlare/20">
                  <Star className="w-10 h-10 text-solarFlare" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">{t('chat.title')}</h2>
                <p className="text-gray-400">{t('chat.emptyDescription')}</p>
                <div className="mt-5 flex flex-col gap-2">
                  {suggestions.map((s) => (
                    <button key={s} type="button" onClick={() => sendMessage(s)}
                      className="text-sm text-left px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 hover:text-white">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] sm:max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-astroAccent text-white'
                    : message.isError
                      ? 'bg-red-500/10 text-red-100 border border-red-500/30'
                      : 'bg-astroCard text-gray-100 border border-white/10'
                }`}>
                  <div className="flex items-start gap-3">
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-solarFlare/20 to-nebulaPink/20 rounded-full flex items-center justify-center flex-shrink-0 border border-solarFlare/20" aria-hidden="true">
                        <Star className="w-4 h-4 text-solarFlare" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="sr-only">{message.role === 'user' ? t('chat.you') : t('chat.title')}: </span>
                      {message.role === 'assistant' ? <RichText text={message.content} /> : <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>}
                      {message.role === 'assistant' && <SourceList sources={message.sources} t={t} />}
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-astroCard border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1" aria-hidden="true">
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

        {/* Entrada */}
        <form onSubmit={handleSubmit} className="bg-astroCard border-t border-white/10 p-4 rounded-b-xl">
          <div className="flex gap-3 items-end">
            <label htmlFor="chat-input" className="sr-only">{t('chat.placeholder')}</label>
            <textarea
              id="chat-input"
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={MAX_LENGTH}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder')}
              className="flex-1 resize-none max-h-40 px-4 py-3 bg-astroDark/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-astroAccent focus:ring-2 focus:ring-astroAccent/20 transition-all duration-300"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-astroAccent hover:bg-astroAccent/90 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" aria-hidden="true" />
              <span className="hidden sm:inline">{t('chat.send')}</span>
              <span className="sr-only sm:hidden">{t('chat.send')}</span>
            </button>
          </div>
          <p className="mt-1 text-[11px] text-gray-500 flex justify-between">
            <span>{t('chat.hint')}</span>
            {input.length > MAX_LENGTH * 0.8 && <span>{input.length}/{MAX_LENGTH}</span>}
          </p>
        </form>
      </main>
    </div>
  );
};

export default ChatPage;
