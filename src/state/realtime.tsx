import React, { createContext, useContext, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { API_URL } from '../api/client';
import { getToken } from './tokenStore';
import { useSession } from './session';

// RNF-12/16/17: canal WebSocket para estados, chat, ubicación y reprogramaciones.
// Si se cae, reintenta con espera creciente; las pantallas también recargan al enfocarse.
type Handler = (data: any) => void;

class RealtimeBus {
  private handlers = new Map<string, Set<Handler>>();
  private ws: WebSocket | null = null;
  private retry = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private active = false;
  private connecting = false;

  on(event: string, fn: Handler) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(fn);
    return () => this.handlers.get(event)?.delete(fn);
  }

  private dispatch(event: string, data: unknown) {
    this.handlers.get(event)?.forEach((fn) => fn(data));
    this.handlers.get('*')?.forEach((fn) => fn({ event, data }));
  }

  async start() {
    this.active = true;
    // connecting cubre el await: dos llamadas seguidas (inicio de sesión y regreso a primer plano) abrirían dos sockets.
    if (this.connecting || (this.ws && (this.ws.readyState === 0 || this.ws.readyState === 1))) return;
    this.connecting = true;
    let token: string | null;
    try {
      token = await getToken();
    } finally {
      this.connecting = false;
    }
    if (!token || !this.active || !API_URL) return;
    const url = `${API_URL.replace(/^http/, 'ws')}/ws?token=${encodeURIComponent(token)}`;
    try {
      const ws = new WebSocket(url);
      this.ws = ws;
      ws.onopen = () => { this.retry = 0; };
      ws.onmessage = (msg) => {
        if (this.ws !== ws) return;
        try {
          const parsed = JSON.parse(String(msg.data));
          if (parsed?.event) this.dispatch(parsed.event, parsed.data);
        } catch { /* mensaje inválido */ }
      };
      ws.onclose = (ev) => {
        if (this.ws !== ws) return;
        this.ws = null;
        // 4401: el servidor cortó el canal porque la sesión terminó (cerrada, revocada o con otra contraseña).
        if (ev?.code === 4401) this.dispatch('sesion.terminada', null);
        this.schedule();
      };
      ws.onerror = () => { try { ws.close(); } catch { /* ya cerrado */ } };
    } catch {
      this.schedule();
    }
  }

  private schedule() {
    if (!this.active) return;
    if (this.timer) clearTimeout(this.timer);
    const delay = Math.min(30000, 1000 * 2 ** this.retry);
    this.retry += 1;
    this.timer = setTimeout(() => this.start(), delay);
  }

  stop() {
    this.active = false;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
    }
    this.ws = null;
  }
}

const bus = new RealtimeBus();
const RealtimeContext = createContext<RealtimeBus>(bus);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { status, refresh } = useSession();
  // RF-12/RNF-10: si el servidor avisa que la sesión terminó, se consulta /api/me; su 401 cierra la sesión aquí
  // al momento, en vez de esperar a la siguiente acción de la persona.
  useEffect(() => {
    const off = bus.on('sesion.terminada', () => { refresh(); });
    return () => { off(); };
  }, [refresh]);
  useEffect(() => {
    if (status === 'signedIn') bus.start();
    else bus.stop();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active' && status === 'signedIn') bus.start();
    });
    return () => sub.remove();
  }, [status]);
  return <RealtimeContext.Provider value={bus}>{children}</RealtimeContext.Provider>;
}

// Suscribe la pantalla a uno o varios eventos mientras está montada.
export function useRealtime(events: string | string[], handler: Handler) {
  const ctx = useContext(RealtimeContext);
  const ref = useRef(handler);
  ref.current = handler;
  const key = Array.isArray(events) ? events.join('|') : events;
  useEffect(() => {
    const offs = key.split('|').map((ev) => ctx.on(ev, (d) => ref.current(d)));
    return () => offs.forEach((off) => off());
  }, [ctx, key]);
}
