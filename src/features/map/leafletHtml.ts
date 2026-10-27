// Mapa Leaflet + OpenStreetMap que se muestra dentro de un WebView (nativo) o un iframe (web).
// Los datos viajan como JSON y las etiquetas se escriben con textContent: nada se interpola como HTML
// (corrige el XSS del SafeMapWrapper anterior, que metía texto sin escapar en el HTML).

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  kind: 'cliente' | 'tecnico' | 'solicitud' | 'yo' | 'punto' | 'propuesta';
  label?: string;
  draggable?: boolean;
};

export type MapState = {
  id: string;
  center: { lat: number; lng: number };
  zoom?: number;
  markers: MapMarker[];
  pickable?: boolean;
  fit?: boolean;
};

export type MapPayload =
  | { type: 'markers'; markers: MapMarker[]; fit?: boolean }
  | { type: 'center'; lat: number; lng: number; zoom?: number };

export type MapEvent = { type: 'ready' } | { type: 'marker'; id: string } | { type: 'pick'; lat: number; lng: number };

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

export function leafletHtml(state: MapState): string {
  return `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
<style>
  html, body, #map { height: 100%; margin: 0; background: #E8EBF1; font-family: system-ui, -apple-system, Roboto, sans-serif; }
  .leaflet-control-attribution { font-size: 10px; }
  .pin { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; font-weight: 800; font-size: 11px;
         letter-spacing: .3px; text-transform: uppercase; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,.25); transform: translate(-50%, -100%); }
  .pin::after { content: ''; position: absolute; left: 50%; bottom: -6px; margin-left: -6px; border: 6px solid transparent; border-bottom: 0; }
  .pin { position: relative; }
  .pin-cliente, .pin-punto { background: #1D3FBF; color: #fff; } .pin-cliente::after, .pin-punto::after { border-top-color: #1D3FBF; }
  .pin-tecnico { background: #FFC21A; color: #16181D; } .pin-tecnico::after { border-top-color: #FFC21A; }
  .pin-solicitud { background: #FFFFFF; color: #16181D; border: 2px solid #16181D; } .pin-solicitud::after { border-top-color: #16181D; }
  .pin-propuesta { background: #D7261E; color: #fff; } .pin-propuesta::after { border-top-color: #D7261E; }
  .yo { width: 18px; height: 18px; border-radius: 50%; background: #1D3FBF; border: 3px solid #fff; box-shadow: 0 0 0 6px rgba(29,63,191,.25); transform: translate(-50%, -50%); }
</style>
</head><body>
<div id="map" role="application" aria-label="Mapa"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script>
(function () {
  var state = ${safeJson(state)};
  function send(msg) {
    var s = JSON.stringify(msg);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent && window.parent !== window) window.parent.postMessage({ __csmap: true, id: state.id, payload: msg }, '*');
  }
  if (!window.L) { document.body.textContent = 'No se pudo cargar el mapa. Revisa tu conexión.'; return; }
  var map = L.map('map', { zoomControl: false }).setView([state.center.lat, state.center.lng], state.zoom || 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
  var layer = L.layerGroup().addTo(map);

  function makeIcon(m) {
    var el = document.createElement('div');
    if (m.kind === 'yo') { el.className = 'yo'; return L.divIcon({ html: el, className: '', iconSize: [0, 0] }); }
    el.className = 'pin pin-' + m.kind;
    el.textContent = m.label || '';
    return L.divIcon({ html: el, className: '', iconSize: [0, 0] });
  }

  function render(markers, fit) {
    layer.clearLayers();
    var pts = [];
    (markers || []).forEach(function (m) {
      var mk = L.marker([m.lat, m.lng], { icon: makeIcon(m), draggable: !!m.draggable, keyboard: true, title: m.label || '' });
      mk.on('click', function () { send({ type: 'marker', id: String(m.id) }); });
      mk.on('dragend', function (e) { var p = e.target.getLatLng(); send({ type: 'pick', lat: p.lat, lng: p.lng }); });
      mk.addTo(layer);
      pts.push([m.lat, m.lng]);
    });
    if (fit && pts.length > 1) map.fitBounds(pts, { padding: [48, 48], maxZoom: 16 });
  }

  map.on('click', function (e) { if (state.pickable) send({ type: 'pick', lat: e.latlng.lat, lng: e.latlng.lng }); });

  window.__csApply = function (p) {
    if (!p) return;
    if (p.type === 'markers') render(p.markers, p.fit);
    if (p.type === 'center') map.setView([p.lat, p.lng], p.zoom || map.getZoom(), { animate: true });
  };

  render(state.markers, state.fit);
  send({ type: 'ready' });
})();
</script>
</body></html>`;
}
