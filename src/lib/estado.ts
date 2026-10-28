// Cómo se anuncia cada estado de una orden en su placa de rótulo, según quién la mira.
// Sin dependencias para poder probarlo con node --test.

export type EstadoOrden =
  | 'PENDIENTE' | 'ASIGNADA' | 'EN_CAMINO' | 'EN_SITIO' | 'ESPERANDO_APROBACION'
  | 'EN_PROCESO' | 'POR_CONFIRMAR' | 'FINALIZADA' | 'SUSPENDIDA' | 'CANCELADA';

type Tone = 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'navy' | 'neutral';
type Info = { label: string; tone: Tone; icon: string; hint: string };

const CLIENTE: Record<EstadoOrden, Info> = {
  PENDIENTE: { label: 'Buscando técnico', tone: 'brand', icon: 'search', hint: 'Avisamos a técnicos cercanos de la especialidad.' },
  ASIGNADA: { label: 'Técnico asignado', tone: 'brand', icon: 'user-check', hint: 'Tu técnico confirmó el servicio.' },
  EN_CAMINO: { label: 'En camino', tone: 'brand', icon: 'navigation', hint: 'Sigue su ubicación en el mapa.' },
  EN_SITIO: { label: 'En tu domicilio', tone: 'brand', icon: 'home', hint: 'El técnico está revisando la falla.' },
  ESPERANDO_APROBACION: { label: 'Aprueba la cotización', tone: 'warning', icon: 'edit-3', hint: 'Revisa los conceptos antes de que empiece el trabajo.' },
  EN_PROCESO: { label: 'Trabajando', tone: 'brand', icon: 'tool', hint: 'El técnico está haciendo el trabajo.' },
  POR_CONFIRMAR: { label: 'Confirma y paga', tone: 'warning', icon: 'award', hint: 'Revisa la evidencia y confirma que quedó.' },
  FINALIZADA: { label: 'Pagado', tone: 'success', icon: 'check-circle', hint: 'Servicio confirmado. Tienes 90 días de garantía.' },
  SUSPENDIDA: { label: 'Suspendida', tone: 'danger', icon: 'alert-octagon', hint: 'Hay un reporte abierto. Elige cómo resolverlo.' },
  CANCELADA: { label: 'Cancelado', tone: 'neutral', icon: 'x-circle', hint: 'Esta orden se canceló sin cargo.' },
};

const TECNICO: Record<EstadoOrden, Info> = {
  ...CLIENTE,
  PENDIENTE: { label: 'Nueva', tone: 'accent', icon: 'bell', hint: 'Acepta o descarta esta solicitud.' },
  ASIGNADA: { label: 'Asignada', tone: 'brand', icon: 'calendar', hint: 'Avisa cuando vayas en camino.' },
  EN_CAMINO: { label: 'En camino', tone: 'brand', icon: 'navigation', hint: 'Tu ubicación se comparte con el cliente.' },
  EN_SITIO: { label: 'En sitio', tone: 'brand', icon: 'map-pin', hint: 'Revisa la falla y envía la cotización.' },
  ESPERANDO_APROBACION: { label: 'Cotización enviada', tone: 'warning', icon: 'clock', hint: 'Esperando que el cliente la apruebe.' },
  EN_PROCESO: { label: 'En proceso', tone: 'brand', icon: 'tool', hint: 'Marca tareas y sube evidencia antes de terminar.' },
  POR_CONFIRMAR: { label: 'Por confirmar', tone: 'warning', icon: 'clock', hint: 'El cliente debe confirmar y pagar.' },
  FINALIZADA: { label: 'Cobrado', tone: 'success', icon: 'dollar-sign', hint: 'El pago ya está en tu billetera.' },
};

export function estadoInfo(estado: EstadoOrden, rol: 'cliente' | 'tecnico' | string): Info {
  return (rol === 'tecnico' ? TECNICO : CLIENTE)[estado] || { label: estado, tone: 'neutral', icon: 'help-circle', hint: '' };
}

type ClientText = { titulo: string; detalle: string; accion?: string };

// Pantallas del cliente (enfoque CILIM): el estado en una frase llana y, si le toca hacer algo,
// el texto del único botón principal.
export function clientStatusText(s: { estado: EstadoOrden; tecnico?: { nombre: string } | null }): ClientText {
  const quien = s.tecnico?.nombre || 'Tu técnico';
  const textos: Record<EstadoOrden, ClientText> = {
    PENDIENTE: { titulo: 'Buscando técnico', detalle: 'Te avisamos en cuanto un técnico acepte.' },
    ASIGNADA: { titulo: 'Tu técnico confirmó', detalle: `${quien} va a atenderte. Te avisamos cuando salga.` },
    EN_CAMINO: { titulo: 'Tu técnico va en camino', detalle: 'Puedes ver por dónde va en el mapa.' },
    EN_SITIO: { titulo: 'Tu técnico llegó', detalle: 'Está revisando la falla para darte el precio.' },
    ESPERANDO_APROBACION: { titulo: 'Revisa el precio', detalle: `${quien} te mandó el precio. Apruébalo para que empiece.`, accion: 'Revisar el precio' },
    EN_PROCESO: { titulo: 'Están trabajando', detalle: `${quien} está haciendo el trabajo.` },
    POR_CONFIRMAR: { titulo: 'Confirma que quedó', detalle: 'Revisa el trabajo y paga solo si quedó bien.', accion: 'Confirmar y pagar' },
    FINALIZADA: { titulo: 'Servicio terminado', detalle: 'Tienes 90 días de garantía.' },
    SUSPENDIDA: { titulo: 'Servicio detenido', detalle: 'Hay un reporte abierto. Elige cómo resolverlo.', accion: 'Ver qué pasó' },
    CANCELADA: { titulo: 'Servicio cancelado', detalle: 'No se hizo ningún cargo.' },
  };
  return textos[s.estado] || { titulo: s.estado, detalle: '' };
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
  { value: 'NO_SE_PRESENTO', label: 'El técnico no llegó', icon: 'user-x' },
  { value: 'COBRO_INDEBIDO', label: 'Me quieren cobrar de más', icon: 'x-circle' },
  { value: 'MALA_CALIDAD', label: 'El trabajo quedó mal', icon: 'thumbs-down' },
  { value: 'DANOS', label: 'Hubo daños en mi domicilio', icon: 'alert-triangle' },
  { value: 'SEGURIDAD', label: 'Me sentí inseguro', icon: 'shield-off' },
  { value: 'GARANTIA', label: 'Reclamar garantía', icon: 'shield' },
  { value: 'OTRO', label: 'Otro problema', icon: 'more-horizontal' },
];
