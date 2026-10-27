import { solicitudesApi, tecnicoApi } from '../../api/endpoints';
import { useLoader } from '../../lib/useLoader';
import { useRealtime } from '../../state/realtime';

export type Vista = 'nuevas' | 'en_curso' | 'historial';

const LIST_EVENTS = ['solicitud.nueva', 'solicitud.propuesta', 'solicitud.actualizada'];

// Resumen del panel del técnico (ganancias, contadores, saldo) con recarga en tiempo real.
export function useResumenTecnico() {
  const loader = useLoader(() => tecnicoApi.resumen(), []);
  useRealtime([...LIST_EVENTS, 'billetera.actualizada', 'calificacion.recibida'], () => loader.reload());
  return loader;
}

// Lista de trabajos por pestaña (RF-58/111/122/123).
export function useTrabajos(vista: Vista) {
  const loader = useLoader(() => solicitudesApi.delTecnico(vista), [vista]);
  useRealtime(LIST_EVENTS, () => loader.reload());
  return loader;
}
