/**
 * AdastraSky Backend - Controlador de Chat
 * Proxy hacia el microservicio de IA (Python FastAPI)
 */

import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import ChatHistory from '../models/ChatHistory.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

/**
 * Enviar mensaje al agente de IA
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { message, language = 'es', session_id } = req.body;
    const user_id = req.user.id;

    // Validar mensaje
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        code: 'EMPTY_MESSAGE',
        message: 'El mensaje no puede estar vacío'
      });
    }

    // Enviar solicitud al microservicio de IA
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/chat`, {
      message,
      language,
      user_id,
      session_id
    }, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Guardar en historial
    await ChatHistory.create({
      user_id,
      session_id: session_id || uuidv4(),
      message,
      response: aiResponse.data.response,
      language,
      sources: aiResponse.data.sources || [],
      metadata: aiResponse.data.metadata || {}
    });

    res.status(200).json({
      status: 'success',
      data: aiResponse.data
    });
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        status: 'error',
        code: 'AI_SERVICE_UNAVAILABLE',
        message: 'El servicio de IA no está disponible'
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        status: 'error',
        code: 'AI_SERVICE_TIMEOUT',
        message: 'Timeout del servicio de IA'
      });
    }

    next(error);
  }
};

/**
 * Obtener historial de chat del usuario
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { session_id, limit = 50 } = req.query;

    const whereClause = { user_id };
    if (session_id) {
      whereClause.session_id = session_id;
    }

    const history = await ChatHistory.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });

    res.status(200).json({
      status: 'success',
      count: history.length,
      data: { history }
    });
  } catch (error) {
    next(error);
  }
};
