import * as Location from 'expo-location';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface ReverseGeocodeResult {
  address: string;
  coords: LocationCoords;
}

// Fallback por defecto: Lázaro Cárdenas, Michoacán
export const FALLBACK_LOCATION: LocationCoords = {
  latitude: 17.9583,
  longitude: -102.2000,
};

/**
 * Solicita permisos en primer plano y obtiene la posición actual.
 * Si el usuario rechaza o falla el GPS, retorna la posición fallback.
 */
export async function getCurrentLocation(): Promise<{ coords: LocationCoords; isFallback: boolean }> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Permiso de ubicación denegado por el usuario. Usando ubicación por defecto.');
      return { coords: FALLBACK_LOCATION, isFallback: true };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      isFallback: false,
    };
  } catch (error) {
    console.warn('Error al obtener la posición GPS actual:', error);
    return { coords: FALLBACK_LOCATION, isFallback: true };
  }
}

/**
 * Realiza geocodificación inversa para obtener una dirección legible a partir de coordenadas.
 */
export async function reverseGeocode(coords: LocationCoords): Promise<string> {
  try {
    const [addressObj] = await Location.reverseGeocodeAsync(coords);
    if (!addressObj) {
      return `Lat: ${coords.latitude.toFixed(4)}, Lon: ${coords.longitude.toFixed(4)}`;
    }

    const street = addressObj.street || addressObj.name || '';
    const streetNumber = addressObj.streetNumber ? ` #${addressObj.streetNumber}` : '';
    const district = addressObj.district || addressObj.subregion || '';
    const city = addressObj.city || addressObj.region || '';

    const parts = [
      `${street}${streetNumber}`.trim(),
      district,
      city,
    ].filter(Boolean);

    return parts.length > 0
      ? parts.join(', ')
      : `Lat: ${coords.latitude.toFixed(4)}, Lon: ${coords.longitude.toFixed(4)}`;
  } catch (error) {
    console.warn('Error en reverseGeocode:', error);
    return `Lat: ${coords.latitude.toFixed(4)}, Lon: ${coords.longitude.toFixed(4)}`;
  }
}
