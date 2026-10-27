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

// Normaliza lo que la persona escribe ("1,160.5") a una cadena con dos decimales ("1160.50").
export function parseMoneyInput(text: string): string | null {
  const s = String(text ?? '').replace(/[,\s$]/g, '');
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(s)) return null;
  const [i, d = ''] = s.split('.');
  const normalized = `${i.replace(/^0+(?=\d)/, '')}.${(d + '00').slice(0, 2)}`;
  if (/^0+\.00$/.test(normalized)) return null;
  return normalized;
}

export function isoFromDmy(dmy: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(dmy ?? '').trim());
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

export function dmyFromIso(iso: string | null | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso ?? ''));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
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

export function initials(nombre?: string | null, apellido?: string | null): string {
  const a = String(nombre || '').trim().charAt(0);
  const b = String(apellido || '').trim().charAt(0);
  return `${a}${b}`.toUpperCase() || '?';
}
