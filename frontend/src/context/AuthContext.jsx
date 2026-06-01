import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';
import { normalizeEmail } from '../utils/apiError';
import { normalizeUsername, sanitizeUsername } from '../utils/authValidation';

const AuthContext = createContext(null);

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function persistSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const { data } = await authAPI.me();
    setUser(data);
    localStorage.setItem(USER_KEY, JSON.stringify(data));
    return data;
  }, []);

  const logout = useCallback(() => {
    authAPI.logout().catch(() => {});
    clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    refreshUser()
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (usernameOrEmail, password) => {
    const identifier = usernameOrEmail.includes('@')
      ? normalizeEmail(usernameOrEmail)
      : normalizeUsername(usernameOrEmail);

    const { data } = await authAPI.login(identifier, password);
    persistSession(data.access_token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const signup = useCallback(async ({ username, email, password }) => {
    const em = normalizeEmail(email);
    const { data } = await authAPI.signup({
      username: sanitizeUsername(username || em.split('@')[0], em),
      email: em,
      password,
    });
    persistSession(data.access_token, data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        signup,
        logout,
        refreshUser,
        isAdmin,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
