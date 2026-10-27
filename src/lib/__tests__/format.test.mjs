import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMoney, isoFromDmy, dmyFromIso, parseMoneyInput, formatTime12, formatDistance, formatDate } from '../format.ts';

test('formatMoney da formato de pesos a la cadena del servidor sin aritmética', () => {
  assert.equal(formatMoney('1160.0000'), '$1,160.00');
  assert.equal(formatMoney('943.00'), '$943.00');
  assert.equal(formatMoney('1234567.5'), '$1,234,567.50');
  assert.equal(formatMoney('0'), '$0.00');
  assert.equal(formatMoney(null), '—');
});

test('isoFromDmy valida fechas reales', () => {
  assert.equal(isoFromDmy('10/05/1995'), '1995-05-10');
  assert.equal(isoFromDmy('31/02/2000'), null);
  assert.equal(isoFromDmy('1/5/95'), null);
  assert.equal(dmyFromIso('1995-05-10'), '10/05/1995');
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
