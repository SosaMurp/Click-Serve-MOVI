import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton } from '../../design/Button';
import { color, elevation, radius } from '../../design/tokens';
import { leafletHtml, MapEvent, MapPayload } from './leafletHtml';
import { useMapSync } from './useMapSync';
import type { MapViewProps } from './MapView';

let seq = 0;

// Versión web: el mismo mapa Leaflet en un iframe srcdoc (mismo origen), con mensajes filtrados por id.
export function MapView({ center, zoom, markers = [], pickable, fit, height = 240, style, onMarkerPress, onPick, recenterTo, focusTo, controlsBottom = 8 }: MapViewProps) {
  const frame = useRef<HTMLIFrameElement | null>(null);
  const id = useMemo(() => `map${(seq += 1)}`, []);
  const html = useMemo(() => leafletHtml({ id, center, zoom, markers, pickable, fit }), [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const apply = (p: MapPayload) => {
    const win = frame.current?.contentWindow as (Window & { __csApply?: (p: MapPayload) => void }) | null;
    win?.__csApply?.(p);
  };
  const onReady = useMapSync(apply, { center, zoom, markers, fit, focusTo });
  const handlers = useRef({ onMarkerPress, onPick, onReady });
  handlers.current = { onMarkerPress, onPick, onReady };

  useEffect(() => {
    const listener = (ev: MessageEvent) => {
      if (ev.source !== frame.current?.contentWindow) return;
      const data = ev.data as { __csmap?: boolean; id?: string; payload?: MapEvent };
      if (!data?.__csmap || data.id !== id || !data.payload) return;
      if (data.payload.type === 'ready') handlers.current.onReady();
      if (data.payload.type === 'marker') handlers.current.onMarkerPress?.(data.payload.id);
      if (data.payload.type === 'pick') handlers.current.onPick?.(data.payload.lat, data.payload.lng);
    };
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [id]);


  return (
    <View style={[styles.wrap, { height }, style]}>
      {React.createElement('iframe', {
        ref: frame,
        srcDoc: html,
        title: 'Mapa',
        style: { border: 0, width: '100%', height: '100%', display: 'block' },
      })}
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
  recenter: { position: 'absolute', right: 8, bottom: 8, borderRadius: 24, ...elevation[1] },
});
