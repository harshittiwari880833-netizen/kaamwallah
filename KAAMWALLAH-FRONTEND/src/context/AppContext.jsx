import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from '../i18n/translations';

const STORAGE_KEYS = {
  language: 'kaam_wallah_language',
  role: 'kaam_wallah_role',
  user: 'kaam_wallah_user',
  token: 'kaam_wallah_token',
  notifications: 'kaam_wallah_notifications',
};

const AppContext = createContext(null);

function readStoredValue(key, fallback = null) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function getStoredToken() {
  return window.localStorage.getItem(STORAGE_KEYS.token);
}

export function getRoleRedirect(role) {
  return role === 'worker' ? '/dashboard' : '/';
}

export function AppProvider({ children }) {
  const [language, setLanguage] = useState(() => readStoredValue(STORAGE_KEYS.language, 'en'));
  const [role, setRole] = useState(() => readStoredValue(STORAGE_KEYS.role, null));
  const [user, setUser] = useState(() => readStoredValue(STORAGE_KEYS.user, null));
  const [token, setToken] = useState(() => getStoredToken());
  const [authLoading, setAuthLoading] = useState(false);
  const [notifications, setNotifications] = useState(() =>
    readStoredValue(STORAGE_KEYS.notifications, [])
  );

  // Persist language
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.language, JSON.stringify(language));
  }, [language]);

  // Persist role
  useEffect(() => {
    if (role) {
      window.localStorage.setItem(STORAGE_KEYS.role, JSON.stringify(role));
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.role);
    }
  }, [role]);

  // Persist user
  useEffect(() => {
    if (user) {
      window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.user);
    }
  }, [user]);

  // Persist token
  useEffect(() => {
    if (token) {
      window.localStorage.setItem(STORAGE_KEYS.token, token);
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.token);
    }
  }, [token]);

  // Persist notifications
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications));
  }, [notifications]);

  // Handle 401 unauthorized
  useEffect(() => {
    function handleUnauthorized() {
      setToken(null);
      setUser(null);
    }
    window.addEventListener('kaamwallah:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('kaamwallah:unauthorized', handleUnauthorized);
  }, []);

  const setAuthSession = useCallback(({ token: nextToken, user: nextUser }) => {
    setToken(nextToken || null);
    setUser(nextUser || null);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setRole(null);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'hi' : 'en'));
  }, []);

  // Translation function
  const translate = useCallback(
    (key) => {
      return translations[language]?.[key] ?? translations.en?.[key] ?? key;
    },
    [language]
  );

  // Notification helpers
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [
      { ...notification, id: Date.now(), read: false, timestamp: new Date().toISOString(), roleTarget: role },
      ...prev,
    ]);
  }, [role]);

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => (!n.roleTarget || n.roleTarget === role) ? { ...n, read: true } : n));
  }, [role]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read && (!n.roleTarget || n.roleTarget === role)).length,
    [notifications, role]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      role,
      setRole,
      user,
      setUser,
      token,
      setToken,
      authLoading,
      setAuthLoading,
      setAuthSession,
      isAuthenticated: Boolean(token && user),
      logout,
      t: translate,
      notifications,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      unreadCount,
    }),
    [
      language,
      toggleLanguage,
      role,
      user,
      token,
      authLoading,
      logout,
      setAuthSession,
      translate,
      notifications,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      unreadCount,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
