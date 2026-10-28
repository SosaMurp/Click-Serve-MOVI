// Formato para la interfaz. RNF-37/39: los importes llegan del servidor como cadenas
// y aquí solo se les da formato; la app nunca suma, resta ni redondea dinero.

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function groupThousands(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatMoney(value: string | number | null | undefined, opts: { currency?: boolean } = {}): string {
  if (value === null || value === undefined || value === '') return '—';
  const raw = String(value).trim();
  const negative = raw.startsWith('-');
  const clean = negative ? raw.slice(1) : raw;
  const [intPartRaw, decRaw = ''] = clean.split('.');
  const intPart = (intPartRaw || '0').replace(/^0+(?=\d)/, '');
  const dec = (decRaw + '00').slice(0, 2);
  const out = `${negative ? '-' : ''}$${groupThousands(intPart)}.${dec}`;
  return opts.currency ? `${out} MXN` : out;
}

// Las dos operaciones de dinero que la app sí hace (atajos de retiro y vista previa de una cotización)
// van en centavos enteros: con flotantes se pierde un centavo ("1.15" * 1 → "1.14").
function toCents(value: string | null | undefined): number {
  const [i = '0', d = ''] = String(value || '0').trim().split('.');
  return Number(i || '0') * 100 + Number((d + '00').slice(0, 2));
}

function fromCents(cents: number): string {
  return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`;
}

// Todo (1) o la mitad (0.5) de un saldo del servidor. La mitad de un número impar de centavos baja.
export function moneyPortion(value: string | null | undefined, part: 1 | 0.5): string {
  const cents = toCents(value);
  return fromCents(part === 1 ? cents : Math.floor(cents / 2));
}

// Vista previa de la suma de conceptos; el total oficial lo calcula el servidor.
export function sumMoney(values: (string | null | undefined)[]): string {
  return fromCents(values.reduce((acc, v) => acc + toCents(v), 0));
}

// Normaliza lo que la persona escribe ("1,160.5") a una cadena con dos decimales ("1160.50").
export function parseMoneyInput(text: string): string | null {
  const s = String(text ?? '').replace(/[,\s$]/g, '');
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(s)) return null;
  const [i, d = ''] = s.split('.');
  const normalized = `${i.replace(/^0+(?=\d)/, '')}.${(d + '00').slice(0, 2)}`;
  if (/^0+\.00$/.test(normalized)) return null;
  return normalized;
}

function toDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  // Una fecha sin hora (YYYY-MM-DD) se interpreta como fecha local, no como medianoche UTC.
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(value);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '';
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatShortDate(value: string | Date | null | undefined): string {
  if (!value) return '';
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return '';
  const today = new Date();
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, today)) return 'Hoy';
  if (sameDay(d, tomorrow)) return 'Mañana';
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatTime12(hhmm: string | null | undefined): string {
  const m = /^(\d{2}):(\d{2})/.exec(String(hhmm ?? ''));
  if (!m) return '';
  const h = Number(m[1]);
  const suffix = h >= 12 ? 'p. m.' : 'a. m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m[2]} ${suffix}`;
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '';
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${formatShortDate(d)}, ${formatTime12(`${hh}:${mm}`)}`;
}

export function formatRelative(value: string | Date | null | undefined): string {
  if (!value) return '';
  const d = toDate(value);
  const diff = Math.round((Date.now() - d.getTime()) / 1000);
  if (diff < 45) return 'ahora';
  if (diff < 3600) return `hace ${Math.round(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.round(diff / 3600)} h`;
  if (diff < 7 * 86400) return `hace ${Math.round(diff / 86400)} d`;
  return formatDate(d);
}

export function formatDistance(km: number | null | undefined): string {
  if (km === null || km === undefined || Number.isNaN(Number(km))) return '';
  const n = Number(km);
  if (n < 1) return `${Math.max(50, Math.round((n * 1000) / 50) * 50)} m`;
  return `${n.toFixed(1)} km`;
}

// Llegada estimada como la calcula el servidor: 25 km/h en ciudad, al menos 1 minuto.
export function etaMinutes(km: number | null | undefined): number | null {
  if (km === null || km === undefined || !Number.isFinite(Number(km))) return null;
  return Math.max(1, Math.round((Number(km) / 25) * 60));
}

export function initials(nombre?: string | null, apellido?: string | null): string {
  const a = String(nombre || '').trim().charAt(0);
  const b = String(apellido || '').trim().charAt(0);
  return `${a}${b}`.toUpperCase() || '?';
}
