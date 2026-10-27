import { useCallback, useEffect, useState } from 'react';
import { solicitudesApi } from '../../api/endpoints';
import type { Categoria, Solicitud } from '../../api/types';
import { useLoader } from '../../lib/useLoader';
import { isActive } from '../../lib/estado';
import { useRealtime } from '../../state/realtime';

// Una orden con recarga en tiempo real cuando cambia su estado, llega un mensaje o se mueve el técnico.
export function useSolicitud(id: string | number | undefined) {
  const loader = useLoader(() => solicitudesApi.detalle(String(id)).then((r) => r.solicitud), [id]);
  const { setData, reload } = loader;

  useRealtime(['solicitud.actualizada', 'reprogramacion.propuesta', 'billetera.actualizada'], (d: { id_solicitud?: number }) => {
    if (d?.id_solicitud && String(d.id_solicitud) === String(id)) reload();
  });

  useRealtime('tecnico.ubicacion', (d: { id_solicitud: number; latitud: number; longitud: number; distancia_km: number | null; eta_min: number | null }) => {
    if (String(d.id_solicitud) !== String(id)) return;
    setData((prev) => (prev ? {
      ...prev,
      tecnico_ubicacion: { latitud: d.latitud, longitud: d.longitud, actualizado: new Date().toISOString(), distancia_km: d.distancia_km ?? 0, eta_min: d.eta_min },
    } : prev));
  });

  return loader;
}

// Lista de órdenes del cliente con recarga en tiempo real.
export function useMisSolicitudes() {
  const loader = useLoader(() => solicitudesApi.delCliente().then((r) => r.solicitudes), []);
  useRealtime('solicitud.actualizada', () => loader.reload());
  return loader;
}

let categoriasCache: Categoria[] | null = null;

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasCache || []);
  const load = useCallback(async () => {
    try {
      const { categorias: c } = await solicitudesApi.categorias();
      categoriasCache = c;
      setCategorias(c);
    } catch { /* se reintenta al volver a la pantalla */ }
  }, []);
  useEffect(() => { if (!categoriasCache) load(); }, [load]);
  return categorias;
}

export function activeOrders(list: Solicitud[] | null | undefined): Solicitud[] {
  return (list || []).filter((s) => isActive(s.estado));
}

export function needsClientAction(s: Solicitud): boolean {
  return ['ESPERANDO_APROBACION', 'POR_CONFIRMAR', 'SUSPENDIDA'].includes(s.estado) || (!!s.reprogramacion && !s.reprogramacion.propuesta_por_mi);
}
