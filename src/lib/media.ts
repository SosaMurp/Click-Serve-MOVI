import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import type { LocalFile } from '../api/types';

// RNF-13: las fotos se reducen a 1600 px y se comprimen antes de subirlas.
async function compress(asset: ImagePicker.ImagePickerAsset): Promise<LocalFile> {
  try {
    const ctx = ImageManipulator.manipulate(asset.uri);
    if ((asset.width || 0) > 1600) ctx.resize({ width: 1600 });
    const image = await ctx.renderAsync();
    const out = await image.saveAsync({ compress: 0.72, format: SaveFormat.JPEG });
    return { uri: out.uri, name: `foto-${Date.now()}.jpg`, type: 'image/jpeg' };
  } catch {
    return { uri: asset.uri, name: asset.fileName || `foto-${Date.now()}.jpg`, type: asset.mimeType || 'image/jpeg' };
  }
}

// Foto tomada fuera del selector (cámara de la INE): misma compresión a 1600 px.
export const compressImage = (uri: string, width?: number) => compress({ uri, width } as ImagePicker.ImagePickerAsset);

export class MediaPermissionError extends Error {}

export async function pickImages(opts: { camera?: boolean; front?: boolean; multiple?: boolean; max?: number } = {}): Promise<LocalFile[]> {
  let result: ImagePicker.ImagePickerResult;
  if (opts.camera && Platform.OS !== 'web') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) throw new MediaPermissionError('Permite el acceso a la cámara en los ajustes de tu teléfono para tomar la foto.');
    result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85, cameraType: opts.front ? ImagePicker.CameraType.front : ImagePicker.CameraType.back });
  } else {
    result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: !!opts.multiple,
      selectionLimit: opts.max ?? 1,
      quality: 0.85,
    });
  }
  if (result.canceled) return [];
  return Promise.all(result.assets.slice(0, opts.max ?? 5).map(compress));
}

// Adjuntos de chat y soporte: fotos o PDF (RF-108).
export async function pickDocument(): Promise<LocalFile | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true, multiple: false });
  if (res.canceled || !res.assets?.[0]) return null;
  const a = res.assets[0];
  return { uri: a.uri, name: a.name || 'archivo', type: a.mimeType || 'application/octet-stream' };
}

// RNF-30: vibración solo después de que el servidor confirmó la acción.
export function hapticSuccess() {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export function hapticWarning() {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}

export type Coords = { latitude: number; longitude: number };

// Lázaro Cárdenas, Michoacán: centro del mapa cuando no hay ubicación (se indica como aproximada).
export const LZC_CENTER: Coords = { latitude: 17.9583, longitude: -102.2 };

export async function currentLocation(): Promise<Coords | null> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') return null;
    const pos = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
    ]);
    if (!pos) return null;
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch {
    return null;
  }
}

// Ubicación sin volver a pedir permiso (latido y ruta del técnico): última conocida o actual.
export async function quietLocation(): Promise<Coords | null> {
  try {
    const perm = await Location.getForegroundPermissionsAsync();
    if (perm.status !== 'granted') return null;
    if (Platform.OS !== 'web') {
      const last = await Location.getLastKnownPositionAsync({ maxAge: 15000 });
      if (last) return { latitude: last.coords.latitude, longitude: last.coords.longitude };
    }
    return currentLocation();
  } catch {
    return null;
  }
}

export async function addressFromCoords(c: Coords): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  try {
    const [a] = await Location.reverseGeocodeAsync(c);
    if (!a) return null;
    const parts = [[a.street || a.name, a.streetNumber].filter(Boolean).join(' '), a.district || a.subregion, a.city || a.region].filter(Boolean);
    return parts.length ? parts.join(', ') : null;
  } catch {
    return null;
  }
}
