import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface MapMarkerItem {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  color?: string;
}

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
  height?: number | string;
  latitude?: number;
  longitude?: number;
  markers?: MapMarkerItem[];
  zoom?: number;
  interactive?: boolean;
  onLocationSelect?: (coords: { latitude: number; longitude: number }) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// Carga defensiva y segura de WebView
let WebViewComponent: any = null;
let isWebViewSupported = false;

try {
  const RNWebView = require('react-native-webview');
  if (RNWebView && (RNWebView.WebView || RNWebView.default)) {
    WebViewComponent = RNWebView.WebView || RNWebView.default;
    isWebViewSupported = true;
  }
} catch {
  WebViewComponent = null;
  isWebViewSupported = false;
}

export class SafeMapWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: !isWebViewSupported };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.warn('SafeMapWrapper: Error capturado al renderizar WebView:', error, errorInfo);
    this.setState({ hasError: true, error });
  }

  generateLeafletHtml(lat: number, lng: number, markersList: MapMarkerItem[], zoom: number, interactive: boolean) {
    const markersJs = markersList
      .map((m, idx) => {
        const color = m.color || '#FF6B1A';
        const title = m.title || `Punto ${idx + 1}`;
        const desc = m.description || '';
        return `
          (function() {
            var iconHtml = '<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.35);"></div>';
            var customIcon = L.divIcon({
              className: 'custom-pin',
              html: iconHtml,
              iconSize: [26, 26],
              iconAnchor: [13, 13]
            });
            var marker = L.marker([${m.latitude}, ${m.longitude}], { icon: customIcon }).addTo(map);
            marker.bindPopup('<b>${title}</b>${desc ? '<br/>' + desc : ''}');
          })();
        `;
      })
      .join('\n');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
        <style>
          * { box-sizing: border-box; }
          html, body, #map {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #F8FAFC;
          }
          .leaflet-control-attribution {
            font-size: 8px !important;
            background: rgba(255,255,255,0.7) !important;
          }
          .custom-pin {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          try {
            var map = L.map('map', {
              zoomControl: ${interactive ? 'true' : 'false'},
              dragging: ${interactive ? 'true' : 'false'},
              touchZoom: ${interactive ? 'true' : 'false'},
              scrollWheelZoom: ${interactive ? 'true' : 'false'},
              doubleClickZoom: ${interactive ? 'true' : 'false'},
              boxZoom: false
            }).setView([${lat}, ${lng}], ${zoom});

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap'
            }).addTo(map);

            ${markersJs}

            ${
              interactive
                ? `
              map.on('click', function(e) {
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'CLICK',
                    latitude: e.latlng.lat,
                    longitude: e.latlng.lng
                  }));
                }
              });
            `
                : ''
            }
          } catch(err) {
            console.error('Error inicializando Leaflet:', err);
          }
        </script>
      </body>
      </html>
    `;
  }

  handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === 'CLICK' && this.props.onLocationSelect) {
        this.props.onLocationSelect({
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
        });
      }
    } catch {
      // Ignorar
    }
  };

  handleOpenExternalMap = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir la aplicación de mapas.');
    });
  };

  renderFallback(lat: number, lng: number) {
    const { fallbackTitle, fallbackSubtitle, height = 200 } = this.props;

    return (
      <View style={[styles.fallbackContainer, { minHeight: typeof height === 'number' ? height : 200 }]}>
        <View style={styles.iconCircle}>
          <Feather name="map-pin" size={26} color="#FF6B1A" />
        </View>

        <Text style={styles.title}>{fallbackTitle || 'Ubicación GPS'}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {fallbackSubtitle || 'Coordenadas registradas de forma segura'}
        </Text>

        <View style={styles.coordsBadge}>
          <Feather name="navigation" size={13} color="#059669" style={{ marginRight: 6 }} />
          <Text style={styles.coordsText}>
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.externalButton}
          onPress={() => this.handleOpenExternalMap(lat, lng)}
          activeOpacity={0.8}
        >
          <Feather name="external-link" size={14} color="#FF6B1A" style={{ marginRight: 6 }} />
          <Text style={styles.externalButtonText}>Ver en Google Maps</Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    const {
      height = 200,
      latitude = 17.9583,
      longitude = -102.2000,
      markers,
      zoom = 15,
      interactive = true,
    } = this.props;

    if (this.state.hasError || !WebViewComponent) {
      return this.renderFallback(latitude, longitude);
    }

    try {
      const effectiveMarkers: MapMarkerItem[] =
        markers && markers.length > 0
          ? markers
          : [
              {
                latitude,
                longitude,
                title: this.props.fallbackTitle || 'Ubicación',
                description: this.props.fallbackSubtitle || '',
                color: '#FF6B1A',
              },
            ];

      const htmlContent = this.generateLeafletHtml(latitude, longitude, effectiveMarkers, zoom, interactive);
      const CurrentWebView = WebViewComponent;

      return (
        <View style={[styles.mapContainer, { height: typeof height === 'number' ? height : 200 }]}>
          <CurrentWebView
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={styles.webView}
            scrollEnabled={false}
            onMessage={this.handleMessage}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onError={() => this.setState({ hasError: true })}
            renderError={() => this.renderFallback(latitude, longitude)}
          />
        </View>
      );
    } catch (err) {
      console.warn('SafeMapWrapper: Error en renderizado WebView:', err);
      return this.renderFallback(latitude, longitude);
    }
  }
}

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  fallbackContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  coordsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 10,
  },
  coordsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  externalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFD8BE',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  externalButtonText: {
    color: '#FF6B1A',
    fontSize: 11,
    fontWeight: '800',
  },
});
