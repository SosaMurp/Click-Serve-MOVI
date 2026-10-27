import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// El token de sesión vive en el almacén seguro del sistema (Keychain / Keystore).
// En web no existe ese almacén: se usa localStorage, documentado como limitación de la versión web.
const TOKEN_KEY = 'cs.session.token';
const USER_KEY = 'cs.session.user';
let memoryToken: string | null | undefined;

const secure = Platform.OS !== 'web';

export async function getToken(): Promise<string | null> {
  if (memoryToken !== undefined) return memoryToken;
  try {
    memoryToken = secure ? await SecureStore.getItemAsync(TOKEN_KEY) : await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    memoryToken = null;
  }
  return memoryToken;
}

export async function setToken(token: string | null): Promise<void> {
  memoryToken = token;
  try {
    if (token) {
      if (secure) await SecureStore.setItemAsync(TOKEN_KEY, token);
      else await AsyncStorage.setItem(TOKEN_KEY, token);
    } else if (secure) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  } catch (error) {
    console.warn('No se pudo guardar la sesión:', error);
  }
}

// Perfil básico en caché para mostrar algo sin red. Nunca se guardan datos financieros (RNF-09).
export async function getCachedUser<T>(): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function setCachedUser(user: object | null): Promise<void> {
  try {
    if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    else await AsyncStorage.removeItem(USER_KEY);
  } catch {
    /* sin almacenamiento disponible */
  }
}

// Al cerrar sesión se borra todo lo local de la app (RNF-09/10).
export async function wipeLocalData(): Promise<void> {
  await setToken(null);
  try {
    const keys = await AsyncStorage.getAllKeys();
    const ours = keys.filter((k) => k.startsWith('cs.') || k.startsWith('@user_'));
    if (ours.length) await AsyncStorage.multiRemove(ours);
  } catch {
    /* sin almacenamiento disponible */
  }
}
