import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL, onApiEvent } from '../api/client';
import { Icon } from '../design/Icon';
import { Text } from '../design/Text';
import { color, space } from '../design/tokens';

// RNF-19/28: si el servidor no responde o está en mantenimiento, la app lo dice de inmediato.
type Net = 'online' | 'offline' | 'maintenance';

const ConnectivityContext = createContext<Net>('online');
export const useConnectivity = () => useContext(ConnectivityContext);

export function ConnectivityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Net>('online');
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => onApiEvent((e) => {
    if (e.type === 'offline') setState('offline');
    else if (e.type === 'maintenance') setState('maintenance');
    else if (e.type === 'online') setState('online');
  }), []);

  // Mientras no haya conexión, se revisa cada 8 s para quitar el aviso en cuanto vuelva.
  useEffect(() => {
    if (state === 'online') {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
      return undefined;
    }
    timer.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/salud`);
        if (res.ok) setState('online');
      } catch { /* sigue sin conexión */ }
    }, 8000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [state]);

  return <ConnectivityContext.Provider value={state}>{children}</ConnectivityContext.Provider>;
}

export function ConnectivityBanner() {
  const state = useConnectivity();
  const insets = useSafeAreaInsets();
  if (state === 'online') return null;
  const maintenance = state === 'maintenance';
  return (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top + 64 }]} accessibilityLiveRegion="assertive">
      <View style={[styles.banner, { backgroundColor: maintenance ? color.warning : color.navy }]}>
        <Icon name={maintenance ? 'tool' : 'wifi-off'} size={18} color={maintenance ? color.ink : color.inkOnColor} />
        <Text variant="bodySm" weight="600" style={{ color: maintenance ? color.ink : color.inkOnColor, flex: 1 }}>
          {maintenance ? 'Click & Serve está en mantenimiento. Intenta en unos minutos.' : 'Sin conexión con el servidor. Las acciones no se guardarán hasta que vuelva.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', paddingHorizontal: space.md },
  banner: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, paddingVertical: space.sm, borderRadius: 999, maxWidth: 600 },
});
