// Validación en tiempo real (RNF-29). El servidor vuelve a validar todo; esto es retroalimentación inmediata.

const BANKS: Record<string, string> = {
  '002': 'BANAMEX', '006': 'BANCOMEXT', '009': 'BANOBRAS', '012': 'BBVA MÉXICO', '014': 'SANTANDER',
  '019': 'BANJÉRCITO', '021': 'HSBC', '030': 'BAJÍO', '036': 'INBURSA', '042': 'MIFEL', '044': 'SCOTIABANK',
  '058': 'BANREGIO', '059': 'INVEX', '060': 'BANSI', '062': 'AFIRME', '072': 'BANORTE', '106': 'BANK OF AMERICA',
  '113': 'VE POR MÁS', '127': 'BANCO AZTECA', '128': 'AUTOFIN', '130': 'COMPARTAMOS', '136': 'INTERCAM',
  '137': 'BANCOPPEL', '138': 'ABC CAPITAL', '140': 'CONSUBANCO', '143': 'CIBANCO', '145': 'BBASE',
  '147': 'BANKAOOL', '148': 'PAGATODO', '152': 'BANCREA', '154': 'BANCO COVALTO', '155': 'ICBC',
  '156': 'SABADELL', '157': 'SHINHAN', '158': 'MIZUHO', '166': 'BANCO DEL BIENESTAR', '638': 'NU MÉXICO',
  '646': 'STP', '722': 'MERCADO PAGO', '728': 'SPIN BY OXXO',
};

export function onlyDigits(value: string | null | undefined): string {
  return String(value ?? '').replace(/\D/g, '');
}

export function isValidClabe(value: string): boolean {
  const clabe = onlyDigits(value);
  if (clabe.length !== 18) return false;
  const weights = [3, 7, 1];
  let sum = 0;
  for (let i = 0; i < 17; i += 1) sum += (Number(clabe[i]) * weights[i % 3]) % 10;
  return (10 - (sum % 10)) % 10 === Number(clabe[17]);
}

export function bankFromClabe(value: string): string | null {
  return BANKS[onlyDigits(value).slice(0, 3)] || null;
}

export function luhn(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length < 12 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

export type CardBrand = 'VISA' | 'MASTERCARD' | 'AMEX' | 'CARNET' | null;

export function cardBrand(value: string): CardBrand {
  const d = onlyDigits(value);
  if (/^4/.test(d)) return 'VISA';
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(d)) return 'MASTERCARD';
  if (/^3[47]/.test(d)) return 'AMEX';
  if (/^(506[2-9]|5064|6275)/.test(d)) return 'CARNET';
  return null;
}

export function formatCardNumber(value: string): string {
  const d = onlyDigits(value).slice(0, 19);
  if (cardBrand(d) === 'AMEX') return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 15)].filter(Boolean).join(' ');
  return d.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function isExpiryValid(mmYY: string): boolean {
  const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(String(mmYY ?? '').trim());
  if (!m) return false;
  const year = 2000 + Number(m[2]);
  const endOfMonth = new Date(year, Number(m[1]), 1);
  return endOfMonth > new Date();
}

export function passwordIssues(value: string): string[] {
  const s = String(value ?? '');
  const out: string[] = [];
  if (s.length < 8) out.push('8 caracteres');
  if (!/[A-Z]/.test(s)) out.push('una mayúscula');
  if (!/[a-z]/.test(s)) out.push('una minúscula');
  if (!/\d/.test(s)) out.push('un número');
  return out;
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value ?? '').trim());
}

export function isPhoneMx(value: string): boolean {
  return onlyDigits(value).length === 10;
}
