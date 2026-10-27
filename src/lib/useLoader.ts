import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { errorMessage } from '../api/client';

// Carga datos al enfocar la pantalla, con "jalar para actualizar" y recarga silenciosa (sin parpadeo).
export function useLoader<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasData = useRef(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(async (mode: 'initial' | 'refresh' | 'silent') => {
    if (mode === 'initial') setLoading(true);
    if (mode === 'refresh') setRefreshing(true);
    try {
      const result = await fn();
      setData(result);
      hasData.current = true;
      setError(null);
    } catch (e) {
      if (!hasData.current || mode !== 'silent') setError(errorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, deps);

  useFocusEffect(useCallback(() => { load(hasData.current ? 'silent' : 'initial'); }, [load]));

  return {
    data,
    setData,
    loading,
    refreshing,
    error,
    reload: useCallback(() => load('silent'), [load]),
    refresh: useCallback(() => load('refresh'), [load]),
  };
}
