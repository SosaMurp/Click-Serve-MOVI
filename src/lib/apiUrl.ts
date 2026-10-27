// RNF-01/03: fuera de desarrollo solo se habla con el servidor por HTTPS. Una URL HTTP en
// producción se descarta (cadena vacía) y el cliente responde con error de configuración.
export function resolveApiUrl(raw: string | undefined, dev: boolean): string {
  const url = String(raw || (dev ? 'http://localhost:3001' : '')).replace(/\/$/, '');
  if (!dev && !url.startsWith('https://')) return '';
  return url;
}
