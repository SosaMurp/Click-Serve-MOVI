import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMoney, moneyPortion, sumMoney, parseMoneyInput, formatTime12, formatDistance, formatDate } from '../format.ts';

test('formatMoney da formato de pesos a la cadena del servidor sin aritmética', () => {
  assert.equal(formatMoney('1160.0000'), '$1,160.00');
  assert.equal(formatMoney('943.00'), '$943.00');
  assert.equal(formatMoney('1234567.5'), '$1,234,567.50');
  assert.equal(formatMoney('0'), '$0.00');
  assert.equal(formatMoney(null), '—');
});

test('parseMoneyInput acepta hasta dos decimales y devuelve cadena normalizada', () => {
  assert.equal(parseMoneyInput('1,160.5'), '1160.50');
  assert.equal(parseMoneyInput('800'), '800.00');
  assert.equal(parseMoneyInput('10.123'), null);
  assert.equal(parseMoneyInput('-5'), null);
  assert.equal(parseMoneyInput('0'), null);
});

test('formatTime12 convierte 24 h a formato legible', () => {
  assert.equal(formatTime12('14:30'), '2:30 p. m.');
  assert.equal(formatTime12('00:05'), '12:05 a. m.');
  assert.equal(formatTime12(null), '');
});

test('formatDistance usa metros bajo 1 km', () => {
  assert.equal(formatDistance(0.85), '850 m');
  assert.equal(formatDistance(1.24), '1.2 km');
  assert.equal(formatDistance(null), '');
});

test('formatDate en español de México', () => {
  assert.equal(formatDate('2026-10-27'), '27 oct 2026');
});

test('moneyPortion toma todo o la mitad del saldo en centavos, sin flotantes', () => {
  assert.equal(moneyPortion('1.1500', 1), '1.15');
  assert.equal(moneyPortion('0.2900', 1), '0.29');
  assert.equal(moneyPortion('4.35', 1), '4.35');
  assert.equal(moneyPortion('943.0000', 0.5), '471.50');
  assert.equal(moneyPortion('1.15', 0.5), '0.57');
  assert.equal(moneyPortion(null, 1), '0.00');
});

test('sumMoney suma importes en centavos (vista previa de la cotización)', () => {
  assert.equal(sumMoney(['0.10', '0.70']), '0.80');
  assert.equal(sumMoney(['800.00', '360.00']), '1160.00');
  assert.equal(sumMoney(['1.005', null, '']), '1.00');
  assert.equal(sumMoney([]), '0.00');
});

test('la llegada estimada usa 25 km/h y al menos 1 minuto, como el servidor', async () => {
  const { etaMinutes } = await import('../format.ts');
  assert.equal(etaMinutes(5), 12);
  assert.equal(etaMinutes(0.1), 1);
  assert.equal(etaMinutes(null), null);
  assert.equal(etaMinutes(undefined), null);
});
