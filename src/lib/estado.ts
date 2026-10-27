// Cómo se anuncia cada estado de una orden en su placa de rótulo, según quién la mira.
// Sin dependencias para poder probarlo con node --test.

export type EstadoOrden =
  | 'PENDIENTE' | 'ASIGNADA' | 'EN_CAMINO' | 'EN_SITIO' | 'ESPERANDO_APROBACION'
  | 'EN_PROCESO' | 'POR_CONFIRMAR' | 'FINALIZADA' | 'SUSPENDIDA' | 'CANCELADA';

type Tone = 'cobalt' | 'chrome' | 'verde' | 'bermellon' | 'carbon' | 'neutral';
type Info = { label: string; tone: Tone; icon: string; hint: string };

const CLIENTE: Record<EstadoOrden, Info> = {
  PENDIENTE: { label: 'Buscando técnico', tone: 'chrome', icon: 'magnify', hint: 'Avisamos a técnicos cercanos de la especialidad.' },
  ASIGNADA: { label: 'Técnico asignado', tone: 'cobalt', icon: 'account-check-outline', hint: 'Tu técnico confirmó el servicio.' },
  EN_CAMINO: { label: 'En camino', tone: 'cobalt', icon: 'navigation-variant-outline', hint: 'Sigue su ubicación en el mapa.' },
  EN_SITIO: { label: 'En tu domicilio', tone: 'cobalt', icon: 'home-account', hint: 'El técnico está revisando la falla.' },
  ESPERANDO_APROBACION: { label: 'Aprueba la cotización', tone: 'chrome', icon: 'file-document-edit-outline', hint: 'Revisa los conceptos antes de que empiece el trabajo.' },
  EN_PROCESO: { label: 'Trabajando', tone: 'cobalt', icon: 'hammer-wrench', hint: 'El técnico está haciendo el trabajo.' },
  POR_CONFIRMAR: { label: 'Confirma y paga', tone: 'chrome', icon: 'check-decagram-outline', hint: 'Revisa la evidencia y confirma que quedó.' },
  FINALIZADA: { label: 'Pagado', tone: 'verde', icon: 'check-circle-outline', hint: 'Servicio confirmado. Tienes 90 días de garantía.' },
  SUSPENDIDA: { label: 'Suspendida', tone: 'bermellon', icon: 'alert-octagon-outline', hint: 'Hay un reporte abierto. Elige cómo resolverlo.' },
  CANCELADA: { label: 'Cancelado', tone: 'carbon', icon: 'close-circle-outline', hint: 'Esta orden se canceló sin cargo.' },
};

const TECNICO: Record<EstadoOrden, Info> = {
  ...CLIENTE,
  PENDIENTE: { label: 'Nueva', tone: 'chrome', icon: 'bell-ring-outline', hint: 'Acepta o descarta esta solicitud.' },
  ASIGNADA: { label: 'Asignada', tone: 'cobalt', icon: 'calendar-check-outline', hint: 'Avisa cuando vayas en camino.' },
  EN_CAMINO: { label: 'En camino', tone: 'cobalt', icon: 'navigation-variant-outline', hint: 'Tu ubicación se comparte con el cliente.' },
  EN_SITIO: { label: 'En sitio', tone: 'cobalt', icon: 'map-marker-check-outline', hint: 'Revisa la falla y envía la cotización.' },
  ESPERANDO_APROBACION: { label: 'Cotización enviada', tone: 'chrome', icon: 'timer-sand', hint: 'Esperando que el cliente la apruebe.' },
  EN_PROCESO: { label: 'En proceso', tone: 'cobalt', icon: 'hammer-wrench', hint: 'Marca tareas y sube evidencia antes de terminar.' },
  POR_CONFIRMAR: { label: 'Por confirmar', tone: 'chrome', icon: 'timer-sand', hint: 'El cliente debe confirmar y pagar.' },
  FINALIZADA: { label: 'Cobrado', tone: 'verde', icon: 'cash-check', hint: 'El pago ya está en tu billetera.' },
};

export function estadoInfo(estado: EstadoOrden, rol: 'cliente' | 'tecnico' | string): Info {
  return (rol === 'tecnico' ? TECNICO : CLIENTE)[estado] || { label: estado, tone: 'neutral', icon: 'help-circle-outline', hint: '' };
}

export const STEPS: { key: string; label: string }[] = [
  { key: 'solicitud', label: 'Solicitud enviada' },
  { key: 'asignada', label: 'Técnico asignado' },
  { key: 'camino', label: 'En camino' },
  { key: 'sitio', label: 'Llegó y cotizó' },
  { key: 'trabajo', label: 'Trabajo en proceso' },
  { key: 'confirmar', label: 'Confirmación y pago' },
  { key: 'garantia', label: 'Garantía de 90 días' },
];

const ORDER: Record<EstadoOrden, number> = {
  PENDIENTE: 0, ASIGNADA: 1, EN_CAMINO: 2, EN_SITIO: 3, ESPERANDO_APROBACION: 3,
  EN_PROCESO: 4, POR_CONFIRMAR: 5, FINALIZADA: 7, SUSPENDIDA: 0, CANCELADA: 0,
};

// Índice de la etapa en curso. Una orden suspendida se queda en la etapa donde estaba.
export function stepIndex(estado: EstadoOrden, previo?: EstadoOrden | null): number {
  if (estado === 'SUSPENDIDA' && previo) return ORDER[previo] ?? 0;
  return ORDER[estado] ?? 0;
}

const CLOSED: EstadoOrden[] = ['FINALIZADA', 'CANCELADA'];

export function isActive(estado: EstadoOrden): boolean {
  return !CLOSED.includes(estado);
}

export const INCIDENCIA_TIPOS: { value: string; label: string; icon: string }[] = [
  { value: 'NO_SE_PRESENTO', label: 'El técnico no llegó', icon: 'account-off-outline' },
  { value: 'COBRO_INDEBIDO', label: 'Me quieren cobrar de más', icon: 'cash-remove' },
  { value: 'MALA_CALIDAD', label: 'El trabajo quedó mal', icon: 'thumb-down-outline' },
  { value: 'DANOS', label: 'Hubo daños en mi domicilio', icon: 'home-alert-outline' },
  { value: 'SEGURIDAD', label: 'Me sentí inseguro', icon: 'shield-alert-outline' },
  { value: 'GARANTIA', label: 'Reclamar garantía', icon: 'shield-check-outline' },
  { value: 'OTRO', label: 'Otro problema', icon: 'dots-horizontal-circle-outline' },
];
