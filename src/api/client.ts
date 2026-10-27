import * as Crypto from 'expo-crypto';
import { getToken } from '../state/tokenStore';
import { resolveApiUrl } from '../lib/apiUrl';

// En producción la URL debe ser HTTPS (RNF-01/03); en desarrollo se permite el backend local.
export const API_URL = resolveApiUrl(process.env.EXPO_PUBLIC_API_URL, __DEV__);

if (!API_URL) {
  console.error('EXPO_PUBLIC_API_URL falta o no usa HTTPS: la app no enviará datos a ese servidor.');
}

export class ApiError extends Error {
  status: number;
  code: string;
  field?: string;
  data?: unknown;

  constructor(status: number, code: string, message: string, field?: string, data?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.field = field;
    this.data = data;
  }
}

export type ApiEvent =
  | { type: 'online' }
  | { type: 'offline' }
  | { type: 'maintenance'; message: string }
  | { type: 'session-expired'; message: string };

const listeners = new Set<(e: ApiEvent) => void>();

export function onApiEvent(fn: (e: ApiEvent) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(e: ApiEvent) {
  listeners.forEach((fn) => fn(e));
}

export function newOperationKey(): string {
  return Crypto.randomUUID();
}

type Options = {
  body?: unknown;
  form?: FormData;
  idempotencyKey?: string;
  timeoutMs?: number;
};

const NETWORK_MESSAGE = 'No pudimos conectar con Click & Serve. Revisa tu conexión e intenta de nuevo.';

async function request<T>(method: string, path: string, opts: Options = {}): Promise<T> {
  if (!API_URL) throw new ApiError(0, 'CONFIG', 'La app no tiene configurada la dirección del servidor.');
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = await getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.idempotencyKey) headers['Idempotency-Key'] = opts.idempotencyKey;

  let body: BodyInit | undefined;
  if (opts.form) {
    body = opts.form as unknown as BodyInit;
  } else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.body);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 20000);
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body, signal: controller.signal });
  } catch (error) {
    emit({ type: 'offline' });
    const timeout = (error as Error)?.name === 'AbortError';
    throw new ApiError(0, timeout ? 'TIMEOUT' : 'NETWORK', timeout ? 'El servidor tardó demasiado en responder. Intenta de nuevo.' : NETWORK_MESSAGE);
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  const payload = (data && typeof data === 'object' ? data : {}) as { error?: string; code?: string; field?: string; mensaje?: string };

  if (res.status === 503 && payload.code === 'MAINTENANCE') {
    emit({ type: 'maintenance', message: payload.error || 'En mantenimiento' });
  } else {
    emit({ type: 'online' });
  }

  if (!res.ok) {
    const code = payload.code || `HTTP_${res.status}`;
    const message = payload.error || payload.mensaje || 'Algo salió mal. Intenta de nuevo.';
    // Solo los errores de sesión cierran la sesión; un 401 de negocio (credenciales, 2FA) no.
    if (res.status === 401 && code.startsWith('AUTH_')) emit({ type: 'session-expired', message });
    throw new ApiError(res.status, code, message, payload.field, data);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string, opts?: Options) => request<T>('GET', path, opts),
  post: <T>(path: string, body?: unknown, opts?: Options) => request<T>('POST', path, { ...opts, body }),
  put: <T>(path: string, body?: unknown, opts?: Options) => request<T>('PUT', path, { ...opts, body }),
  patch: <T>(path: string, body?: unknown, opts?: Options) => request<T>('PATCH', path, { ...opts, body }),
  delete: <T>(path: string, body?: unknown, opts?: Options) => request<T>('DELETE', path, { ...opts, body }),
  upload: <T>(method: 'POST' | 'PUT', path: string, form: FormData, opts?: Options) => request<T>(method, path, { ...opts, form, timeoutMs: opts?.timeoutMs ?? 60000 }),
};

// Las rutas firmadas (/api/archivos/...) vencen en minutos; se vuelven absolutas al mostrarse.
export function fileUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path) || path.startsWith('data:') || path.startsWith('file:')) return path;
  return `${API_URL}${path}`;
}


export function errorMessage(error: unknown, fallback = 'Algo salió mal. Intenta de nuevo.'): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
