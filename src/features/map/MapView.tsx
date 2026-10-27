import React, { useMemo, useRef } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { WebView as RNWebView } from 'react-native-webview';

// Los tipos de react-native-webview 14 no son compatibles con los de React 19.
const WebView = RNWebView as unknown as React.ComponentType<Record<string, unknown> & { ref?: React.Ref<{ injectJavaScript: (js: string) => void }> }>;
import { IconButton } from '../../design/Button';
import { color, radius, elevation } from '../../design/tokens';
import { leafletHtml, MapEvent, MapMarker, MapPayload } from './leafletHtml';
import { useMapSync } from './useMapSync';

export type MapViewProps = {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  pickable?: boolean;
  fit?: boolean;
  height?: number;
  style?: ViewStyle;
  onMarkerPress?: (id: string) => void;
  onPick?: (lat: number, lng: number) => void;
  // RF-105: botón para volver a centrar en la posición propia.
  recenterTo?: { lat: number; lng: number } | null;
  // Mueve la cámara a este punto cada vez que cambia (p. ej. al elegir una tarjeta del carrusel).
  focusTo?: { lat: number; lng: number } | null;
  // Distancia del botón de recentrar al borde inferior (para no quedar bajo un carrusel).
  controlsBottom?: number;
};

let seq = 0;

// Versión nativa: WebView con el mapa Leaflet; los cambios se inyectan como JSON.
export function MapView({ center, zoom, markers = [], pickable, fit, height = 240, style, onMarkerPress, onPick, recenterTo, focusTo, controlsBottom = 8 }: MapViewProps) {
  const ref = useRef<{ injectJavaScript: (js: string) => void }>(null);
  const id = useMemo(() => `map${(seq += 1)}`, []);
  const html = useMemo(() => leafletHtml({ id, center, zoom, markers, pickable, fit }), [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const apply = (p: MapPayload) => ref.current?.injectJavaScript(`window.__csApply && window.__csApply(${JSON.stringify(p)}); true;`);
  const onReady = useMapSync(apply, { center, zoom, markers, fit, focusTo });

  return (
    <View style={[styles.wrap, { height }, style]}>
      <WebView
        ref={ref}
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled
        setSupportMultipleWindows={false}
        onMessage={(e: { nativeEvent: { data: string } }) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data) as MapEvent;
            if (msg.type === 'ready') onReady();
            if (msg.type === 'marker') onMarkerPress?.(msg.id);
            if (msg.type === 'pick') onPick?.(msg.lat, msg.lng);
          } catch { /* mensaje ajeno */ }
        }}
        style={styles.web}
      />
      {recenterTo ? (
        <View style={[styles.recenter, { bottom: controlsBottom }]}>
          <IconButton icon="crosshair" label="Centrar en mi ubicación" background={color.surface} tint={color.brandInk} onPress={() => apply({ type: 'center', lat: recenterTo.lat, lng: recenterTo.lng, zoom: 16 })} />
        </View>
      ) : null}
    </View>
  );
}


const styles = StyleSheet.create({
  wrap: { borderRadius: radius.md, overflow: 'hidden', backgroundColor: color.groundAlt },
  web: { flex: 1, backgroundColor: color.groundAlt },
  recenter: { position: 'absolute', right: 8, bottom: 8, borderRadius: 24, ...elevation[1] },
});
