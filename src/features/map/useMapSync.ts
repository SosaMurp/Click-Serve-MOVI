import { useEffect, useRef } from 'react';
import type { MapMarker, MapPayload } from './leafletHtml';

type LatLng = { lat: number; lng: number };
type SyncProps = { center: LatLng; zoom?: number; markers: MapMarker[]; fit?: boolean; focusTo?: LatLng | null };

// Mantiene el mapa al día con sus props. Lo que se aplica antes de que Leaflet cargue se pierde, así que
// al recibir 'ready' se reenvía el estado más reciente; después, cada cambio se aplica al momento.
// Con fit y varios marcadores manda el encuadre de los marcadores, no el centro.
export function useMapSync(apply: (p: MapPayload) => void, props: SyncProps): () => void {
  const latest = useRef(props);
  latest.current = props;
  const fitsMarkers = (p: SyncProps) => !!p.fit && p.markers.length > 1;

  useEffect(() => { apply({ type: 'markers', markers: props.markers, fit: props.fit }); }, [JSON.stringify(props.markers)]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!fitsMarkers(latest.current)) apply({ type: 'center', lat: props.center.lat, lng: props.center.lng, zoom: props.zoom });
  }, [props.center.lat, props.center.lng]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (props.focusTo) apply({ type: 'center', lat: props.focusTo.lat, lng: props.focusTo.lng, zoom: 15 });
  }, [props.focusTo?.lat, props.focusTo?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  return () => {
    const p = latest.current;
    apply({ type: 'markers', markers: p.markers, fit: p.fit });
    if (p.focusTo) apply({ type: 'center', lat: p.focusTo.lat, lng: p.focusTo.lng, zoom: 15 });
    else if (!fitsMarkers(p)) apply({ type: 'center', lat: p.center.lat, lng: p.center.lng, zoom: p.zoom });
  };
}
