// Valores de un solo uso entre pantallas de acceso (reset_token de recuperación, reto de 2FA).
// No viajan como parámetros de ruta: en la versión web terminarían en la barra de direcciones y el historial.
// Viven solo en memoria; si la página se recarga se pierden y la persona vuelve a pedir el código.
type Key = 'reset_token' | 'reto_2fa';
const store = new Map<Key, string>();

export function handOff(key: Key, value: string) {
  store.set(key, value);
}

export function peekHandoff(key: Key): string | null {
  return store.get(key) ?? null;
}

export function clearHandoff(key: Key) {
  store.delete(key);
}
