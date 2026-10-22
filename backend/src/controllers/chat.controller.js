/**
 * AdastraSky Backend - Controlador de Chat
 * Proxy hacia el microservicio de IA (Python FastAPI) con memoria conversacional.
 *
 * Memoria: la tabla chat_history es la única fuente de verdad. En cada mensaje
 * se cargan los últimos turnos de ESA sesión y de ESE usuario (user_id del JWT)
 * y se envían al ai-service, que no guarda estado. Un usuario nunca puede
 * recibir el historial de otro aunque conozca su session_id.
 *
 * Las guardas de contenido (inyección de prompt, insultos, fuera de tema) viven
 * en el ai-service (agent/rules/guard_rules.json), en es/en/de y con tests.
 */

import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { fn, col } from 'sequelize';
import ChatHistory from '../models/ChatHistory.js';
import { aiPost } from '../utils/aiClient.js';
import { sendAiError } from '../utils/aiErrors.js';

const HISTORY_TURNS = parseInt(process.env.CHAT_HISTORY_TURNS, 10) || 6;
const LANGS = ['es', 'en', 'de'];

/** Últimos turnos de la sesión del usuario, en orden cronológico. */
export async function loadHistory(userId, sessionId, turns = HISTORY_TURNS) {
  const rows = await ChatHistory.findAll({
    where: { user_id: userId, session_id: sessionId },
    order: [['created_at', 'DESC']],
    limit: turns,
    attributes: ['message', 'response', 'created_at']
  });
  const history = [];
  for (const row of rows.reverse()) {
    history.push({ role: 'user', content: row.message });
    if (row.response) history.push({ role: 'assistant', content: row.response });
  }
  return history;
}

/**
 * Enviar mensaje al agente de IA
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { message, session_id } = req.body;
    const language = LANGS.includes(req.body.language) ? req.body.language : 'es';
    const user_id = req.user.id;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ status: 'error', code: 'EMPTY_MESSAGE', message: 'El mensaje no puede estar vacío' });
    }
    if (message.length > 4000) {
      return res.status(400).json({ status: 'error', code: 'MESSAGE_TOO_LONG', message: 'El mensaje no puede exceder 4000 caracteres' });
    }
    if (session_id && !uuidValidate(session_id)) {
      return res.status(400).json({ status: 'error', code: 'INVALID_SESSION_ID', message: 'El formato de session_id no es válido' });
    }

    // Conversación nueva: se crea el id aquí para usar el MISMO en el ai-service y en la BD.
    const sessionId = session_id || uuidv4();
    let history = [];
    let historyError = false;
    if (session_id) {
      try {
        history = await loadHistory(user_id, sessionId);
      } catch (err) {
        // Si falla la lectura se responde igualmente, sin contexto previo.
        historyError = true;
        console.error('No se pudo leer el historial de chat:', err.message);
      }
    }

    let aiResponse;
    try {
      aiResponse = await aiPost('/api/chat', { message, language, user_id, session_id: sessionId, history });
    } catch (error) {
      if (sendAiError(error, res)) return;
      throw error;
    }

    const data = aiResponse.data || {};
    const metadata = { ...(data.metadata || {}), history_error: historyError || undefined };
    try {
      await ChatHistory.create({
        user_id,
        session_id: sessionId,
        message,
        response: data.response,
        language,
        sources: data.sources || [],
        metadata
      });
    } catch (err) {
      // La respuesta ya existe: se entrega aunque no se haya podido guardar.
      console.error('No se pudo guardar el historial de chat:', err.message);
      metadata.persisted = false;
    }

    res.status(200).json({
      status: 'success',
      data: { response: data.response, session_id: sessionId, sources: data.sources || [], metadata }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener historial de chat del usuario (todas las sesiones o una concreta)
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const session_id = req.params.session_id || req.query.session_id;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    const order = req.query.order === 'asc' ? 'ASC' : 'DESC';

    const whereClause = { user_id };
    if (session_id) {
      if (!uuidValidate(session_id)) {
        return res.status(400).json({ status: 'error', code: 'INVALID_SESSION_ID', message: 'El formato de session_id no es válido' });
      }
      whereClause.session_id = session_id;
    }

    const { rows: history, count: total } = await ChatHistory.findAndCountAll({
      where: whereClause,
      order: [['created_at', order]],
      limit,
      offset
    });

    res.status(200).json({ status: 'success', pagination: { total, limit, offset }, data: { history } });
  } catch (error) {
    next(error);
  }
};

/**
 * Lista las conversaciones del usuario (una fila por sesión)
 */
export const listSessions = async (req, res, next) => {
  try {
    const sessions = await ChatHistory.findAll({
      where: { user_id: req.user.id },
      attributes: [
        'session_id',
        [fn('MIN', col('created_at')), 'started_at'],
        [fn('MAX', col('created_at')), 'last_message_at'],
        [fn('COUNT', col('id')), 'messages']
      ],
      group: ['session_id'],
      order: [[fn('MAX', col('created_at')), 'DESC']],
      limit: Math.min(parseInt(req.query.limit, 10) || 20, 100),
      raw: true
    });
    // Título: primera pregunta de cada sesión
    const firsts = await Promise.all(sessions.map((s) => ChatHistory.findOne({
      where: { user_id: req.user.id, session_id: s.session_id },
      order: [['created_at', 'ASC']],
      attributes: ['message', 'language']
    })));
    const data = sessions.map((s, i) => ({
      ...s,
      messages: Number(s.messages),
      title: (firsts[i]?.message || '').slice(0, 80),
      language: firsts[i]?.language
    }));
    res.status(200).json({ status: 'success', data: { sessions: data } });
  } catch (error) {
    next(error);
  }
};

/**
 * Borra una conversación del usuario (solo las suyas)
 */
export const deleteSession = async (req, res, next) => {
  try {
    const { session_id } = req.params;
    if (!uuidValidate(session_id)) {
      return res.status(400).json({ status: 'error', code: 'INVALID_SESSION_ID', message: 'El formato de session_id no es válido' });
    }
    const deleted = await ChatHistory.destroy({ where: { user_id: req.user.id, session_id } });
    if (!deleted) return res.status(404).json({ status: 'error', code: 'SESSION_NOT_FOUND', message: 'Conversación no encontrada' });
    res.status(200).json({ status: 'success', data: { deleted } });
  } catch (error) {
    next(error);
  }
};
