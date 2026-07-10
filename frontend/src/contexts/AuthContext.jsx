import { useEffect, useMemo, useState } from 'react';
import { STORAGE_KEYS } from '../constants/storageKeys';
import * as authService from '../services/authService';
import { AUTH_EXPIRED_EVENT, clearAuthSession, storeAuthSession } from '../utils/authSession';
import AuthContext from './AuthContext';

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(STORAGE_KEYS.accessToken));
  const [role, setRole] = useState(() => localStorage.getItem(STORAGE_KEYS.role));

  const isAuthenticated = Boolean(accessToken);

  async function signIn(credentials) {
    const auth = await authService.login(credentials);

    storeAuthSession(auth);

    setAccessToken(auth.accessToken);
    setRole(auth.role);

    return auth;
  }

  function signOut() {
    clearAuthSession();
    setAccessToken(null);
    setRole(null);
  }

  useEffect(() => {
    function handleAuthExpired() {
      setAccessToken(null);
      setRole(null);
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, []);

  const value = useMemo(
    () => ({
      accessToken,
      role,
      isAuthenticated,
      signIn,
      signOut,
    }),
    [accessToken, isAuthenticated, role],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
