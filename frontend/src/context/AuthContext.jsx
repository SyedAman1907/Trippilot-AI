import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('trippilot_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.data?.user) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      const { token: authToken, user: authUser } = res.data;
      localStorage.setItem('trippilot_token', authToken);
      setToken(authToken);
      setUser(authUser);
      return authUser;
    }
  };

  const register = async (name, email, password, preferences) => {
    const res = await api.post('/auth/register', { name, email, password, preferences });
    if (res.success && res.data) {
      const { token: authToken, user: authUser } = res.data;
      localStorage.setItem('trippilot_token', authToken);
      setToken(authToken);
      setUser(authUser);
      return authUser;
    }
  };

  const quickDemoLogin = async () => {
    return login('demo@trippilot.ai', 'password123');
  };

  const logout = () => {
    localStorage.removeItem('trippilot_token');
    setToken(null);
    setUser(null);
  };

  const updatePreferences = async (newPreferences) => {
    const res = await api.put('/profile', newPreferences);
    if (res.success && res.data?.preferences) {
      setUser(prev => ({ ...prev, preferences: res.data.preferences }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        loading,
        login,
        register,
        quickDemoLogin,
        logout,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
