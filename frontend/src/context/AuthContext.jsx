/**
 * AdastraSky Frontend - Contexto de Autenticación
 * Gestión global del estado de autenticación y usuario
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showHeroTransition, setShowHeroTransition] = useState(false);
  const [role, setRole] = useState(null);

  // Cargar token y usuario del localStorage al montar
  useEffect(() => {
    const storedToken = localStorage.getItem('adastra_session');
    const storedUser = localStorage.getItem('adastra_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setRole(userData.role || 'user');
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // Configurar axios interceptor para incluir token en las peticiones
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      const { user: userData, token: newToken } = response.data.data;

      setUser(userData);
      setToken(newToken);
      setRole(userData.role || 'user');
      setIsAuthenticated(true);

      localStorage.setItem('adastra_session', newToken);
      localStorage.setItem('adastra_user', JSON.stringify(userData));

      navigate('/explorador');

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar sesión',
      };
    }
  };

  const register = async (email, password, firstName, lastName, preferredLanguage = 'es') => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        preferred_language: preferredLanguage,
      });

      const { user: userData, token: newToken } = response.data.data;

      setUser(userData);
      setToken(newToken);
      setRole(userData.role || 'user');
      setIsAuthenticated(true);

      localStorage.setItem('adastra_session', newToken);
      localStorage.setItem('adastra_user', JSON.stringify(userData));

      setShowHeroTransition(true);

      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrarse',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem('adastra_session');
    localStorage.removeItem('adastra_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUserData = (userData) => {
    setUser(userData);
    setRole(userData.role || 'user');
    localStorage.setItem('adastra_user', JSON.stringify(userData));
  };

  const completeHeroTransition = () => {
    setShowHeroTransition(false);
  };

  const value = {
    user,
    token,
    role,
    isAuthenticated,
    isLoading,
    showHeroTransition,
    login,
    register,
    logout,
    updateUserData,
    completeHeroTransition,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
