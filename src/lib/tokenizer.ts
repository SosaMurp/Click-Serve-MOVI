import { cardBrand, onlyDigits } from './validators';

// RNF-02: la tarjeta se tokeniza en el teléfono; el backend de Click & Serve nunca recibe el número ni el CVV.
// Con EXPO_PUBLIC_CONEKTA_PUBLIC_KEY se usa la API de tokens de Conekta. Sin llave (desarrollo)
// solo se aceptan las tarjetas de prueba publicadas por Conekta y se envía su token de prueba.
const TEST_TOKENS: Record<string, string> = {
  '4242424242424242': 'tok_test_visa_4242',
  '5555555555554444': 'tok_test_mastercard_4444',
  '378282246310005': 'tok_test_amex_0005',
  '4000000000000002': 'tok_test_card_declined',
  '4000000000009995': 'tok_test_insufficient_funds',
};

export type TokenizedCard = { token: string; marca: string; ultimos_4: string; sandbox: boolean };

export const isSandboxPayments = !process.env.EXPO_PUBLIC_CONEKTA_PUBLIC_KEY;

function base64(s: string): string {
  if (typeof btoa === 'function') return btoa(s);
  return s;
}

export async function tokenizeCard(card: { number: string; name: string; expiry: string; cvc: string }): Promise<TokenizedCard> {
  const digits = onlyDigits(card.number);
  const marca = cardBrand(digits) || 'VISA';
  const [mm, yy] = card.expiry.split('/');
  const key = process.env.EXPO_PUBLIC_CONEKTA_PUBLIC_KEY;

  if (!key) {
    const token = TEST_TOKENS[digits];
    if (!token) throw new Error('Pagos en modo de prueba: usa la tarjeta 4242 4242 4242 4242 (o 4000 0000 0000 0002 para simular un rechazo).');
    return { token, marca, ultimos_4: digits.slice(-4), sandbox: true };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch('https://api.conekta.io/tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/vnd.conekta-v2.1.0+json',
        Authorization: `Basic ${base64(`${key}:`)}`,
      },
      body: JSON.stringify({ card: { number: digits, name: card.name, exp_month: mm, exp_year: `20${yy}`, cvc: card.cvc } }),
      signal: controller.signal,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.id) throw new Error(json?.details?.[0]?.message || 'El banco no pudo validar la tarjeta.');
    return { token: json.id, marca, ultimos_4: digits.slice(-4), sandbox: false };
  } finally {
    clearTimeout(timer);
  }
}
