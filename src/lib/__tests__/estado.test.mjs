import test from 'node:test';
import assert from 'node:assert/strict';
import { estadoInfo, stepIndex, STEPS, isActive } from '../estado.ts';

test('el cliente ve una placa que le dice qué hacer cuando le toca', () => {
  assert.deepEqual(estadoInfo('POR_CONFIRMAR', 'cliente').label, 'Confirma y paga');
  assert.equal(estadoInfo('POR_CONFIRMAR', 'cliente').tone, 'chrome');
  assert.equal(estadoInfo('POR_CONFIRMAR', 'tecnico').label, 'Por confirmar');
});

test('cada estado tiene tono e ícono, y pagado es verde', () => {
  assert.equal(estadoInfo('FINALIZADA', 'cliente').label, 'Pagado');
  assert.equal(estadoInfo('FINALIZADA', 'cliente').tone, 'verde');
  assert.equal(estadoInfo('CANCELADA', 'tecnico').tone, 'carbon');
  assert.equal(estadoInfo('SUSPENDIDA', 'cliente').tone, 'bermellon');
  assert.ok(estadoInfo('EN_CAMINO', 'cliente').icon);
});

test('el avance ubica la etapa actual en la línea de pasos', () => {
  assert.equal(STEPS.length, 7);
  assert.equal(stepIndex('PENDIENTE'), 0);
  assert.equal(stepIndex('EN_SITIO'), 3);
  assert.equal(stepIndex('FINALIZADA'), 7);
  assert.equal(stepIndex('SUSPENDIDA', 'EN_PROCESO'), 4);
});

test('isActive distingue órdenes vivas de cerradas', () => {
  assert.equal(isActive('EN_PROCESO'), true);
  assert.equal(isActive('PENDIENTE'), true);
  assert.equal(isActive('FINALIZADA'), false);
  assert.equal(isActive('CANCELADA'), false);
});
