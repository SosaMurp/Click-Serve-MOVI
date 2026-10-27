import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidClabe, bankFromClabe, luhn, cardBrand, isExpiryValid, passwordIssues, isEmail, isPhoneMx, formatCardNumber } from '../validators.ts';

test('CLABE con dígito verificador', () => {
  assert.equal(isValidClabe('002010077777777771'), true);
  assert.equal(isValidClabe('002010077777777770'), false);
  assert.equal(bankFromClabe('012180012345678912'), 'BBVA MÉXICO');
});

test('Luhn y marca de tarjeta', () => {
  assert.equal(luhn('4242 4242 4242 4242'), true);
  assert.equal(luhn('4242 4242 4242 4241'), false);
  assert.equal(cardBrand('4242'), 'VISA');
  assert.equal(cardBrand('5555 5555 5555 4444'), 'MASTERCARD');
  assert.equal(cardBrand('3782 822463 10005'), 'AMEX');
  assert.equal(formatCardNumber('4242424242424242'), '4242 4242 4242 4242');
});

test('vencimiento MM/AA en el futuro', () => {
  const next = String((new Date().getFullYear() + 2) % 100).padStart(2, '0');
  assert.equal(isExpiryValid(`12/${next}`), true);
  assert.equal(isExpiryValid('01/20'), false);
  assert.equal(isExpiryValid('13/30'), false);
});

test('passwordIssues enumera lo que falta', () => {
  assert.deepEqual(passwordIssues('Prueba#2026'), []);
  assert.deepEqual(passwordIssues('prueba'), ['8 caracteres', 'una mayúscula', 'un número']);
});

test('correo y teléfono', () => {
  assert.equal(isEmail('ana@correo.mx'), true);
  assert.equal(isEmail('ana@'), false);
  assert.equal(isPhoneMx('753 123 4567'), true);
  assert.equal(isPhoneMx('12345'), false);
});
