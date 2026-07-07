import { useMemo, useState } from 'react';
import { STORAGE_KEYS } from '../constants/storageKeys';
import * as authService from '../services/authService';
import AuthContext from './AuthContext';

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(STORAGE_KEYS.accessToken));
  const [role, setRole] = useState(() => localStorage.getItem(STORAGE_KEYS.role));

  const isAuthenticated = Boolean(accessToken);

  async function signIn(credentials) {
    const response = await authService.login(credentials);
    const auth = response.data;

    localStorage.setItem(STORAGE_KEYS.accessToken, auth.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, auth.refreshToken);
    localStorage.setItem(STORAGE_KEYS.role, auth.role);

    setAccessToken(auth.accessToken);
    setRole(auth.role);

    return auth;
  }

  function signOut() {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
    localStorage.removeItem(STORAGE_KEYS.role);
    setAccessToken(null);
    setRole(null);
  }

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
