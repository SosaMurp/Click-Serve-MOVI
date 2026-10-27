import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { authApi, cuentaApi } from '../api/endpoints';
import { ApiError, onApiEvent } from '../api/client';
import type { User } from '../api/types';
import { getCachedUser, getToken, setCachedUser, setToken, wipeLocalData } from './tokenStore';
import { toast } from '../ui/toast';

type Status = 'loading' | 'signedOut' | 'signedIn';

type SessionValue = {
  status: Status;
  user: User | null;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: (opts?: { remote?: boolean; message?: string }) => Promise<void>;
  refresh: () => Promise<User | null>;
  setUser: (user: User) => void;
  replaceToken: (token: string) => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function useSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession fuera de SessionProvider');
  return ctx;
}

async function registerPushToken() {
  if (Platform.OS === 'web') return;
  try {
    const Notifications = await import('expo-notifications');
    const Constants = (await import('expo-constants')).default;
    const perm = await Notifications.getPermissionsAsync();
    const status = perm.status === 'granted' ? perm.status : (await Notifications.requestPermissionsAsync()).status;
    if (status !== 'granted') return;
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const { data } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    if (data) await cuentaApi.pushToken(data);
  } catch {
    // Las notificaciones push requieren un build nativo con EAS; no bloquean el inicio de sesión.
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUserState] = useState<User | null>(null);

  const setUser = useCallback((u: User) => {
    setUserState(u);
    setCachedUser(u);
  }, []);

  const clear = useCallback(async () => {
    await wipeLocalData();
    setUserState(null);
    setStatus('signedOut');
  }, []);

  // Al abrir la app: si hay token, validar con /api/me; sin red, mostrar el perfil en caché.
  useEffect(() => {
    let alive = true;
    (async () => {
      const token = await getToken();
      if (!token) {
        if (alive) setStatus('signedOut');
        return;
      }
      try {
        const { usuario } = await authApi.me();
        if (!alive) return;
        setUser(usuario);
        setStatus('signedIn');
      } catch (error) {
        if (!alive) return;
        if (error instanceof ApiError && (error.code === 'NETWORK' || error.code === 'TIMEOUT' || error.code === 'MAINTENANCE')) {
          const cached = await getCachedUser<User>();
          if (cached) {
            setUserState(cached);
            setStatus('signedIn');
            return;
          }
        }
        await clear();
      }
    })();
    return () => { alive = false; };
  }, [clear, setUser]);

  useEffect(() => onApiEvent((e) => {
    if (e.type === 'session-expired') {
      getToken().then((t) => {
        if (!t) return;
        clear();
        toast.warning(e.message);
      });
    }
  }), [clear]);

  const signIn = useCallback(async (token: string, u: User) => {
    await setToken(token);
    setUser(u);
    setStatus('signedIn');
    registerPushToken();
  }, [setUser]);

  const signOut = useCallback(async (opts: { remote?: boolean; message?: string } = {}) => {
    if (opts.remote !== false) {
      try { await authApi.logout(); } catch { /* la sesión local se borra de todos modos */ }
    }
    await clear();
    if (opts.message) toast.show(opts.message);
  }, [clear]);

  const refresh = useCallback(async () => {
    try {
      const { usuario } = await authApi.me();
      setUser(usuario);
      return usuario;
    } catch {
      return null;
    }
  }, [setUser]);

  const replaceToken = useCallback(async (token: string) => { await setToken(token); }, []);

  const value = useMemo(() => ({ status, user, signIn, signOut, refresh, setUser, replaceToken }), [status, user, signIn, signOut, refresh, setUser, replaceToken]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
