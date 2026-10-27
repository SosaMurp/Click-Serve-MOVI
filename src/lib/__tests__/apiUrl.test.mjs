import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveApiUrl } from '../apiUrl.ts';

test('en producción solo se acepta una URL HTTPS (RNF-01)', () => {
  assert.equal(resolveApiUrl('https://api.clickserve.mx/', false), 'https://api.clickserve.mx');
  assert.equal(resolveApiUrl('http://192.168.1.97:3000', false), '');
  assert.equal(resolveApiUrl(undefined, false), '');
});

test('en desarrollo se permite el backend local por HTTP', () => {
  assert.equal(resolveApiUrl('http://localhost:3001/', true), 'http://localhost:3001');
  assert.equal(resolveApiUrl(undefined, true), 'http://localhost:3001');
});
