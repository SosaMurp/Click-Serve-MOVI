import test from 'node:test';
import assert from 'node:assert/strict';
import { estadoInfo, stepIndex, STEPS, isActive } from '../estado.ts';

test('el cliente ve una placa que le dice qué hacer cuando le toca', () => {
  assert.deepEqual(estadoInfo('POR_CONFIRMAR', 'cliente').label, 'Confirma y paga');
  assert.equal(estadoInfo('POR_CONFIRMAR', 'cliente').tone, 'warning');
  assert.equal(estadoInfo('POR_CONFIRMAR', 'tecnico').label, 'Por confirmar');
});

test('cada estado tiene tono e ícono; verde, ámbar y rojo solo para estados', () => {
  assert.equal(estadoInfo('FINALIZADA', 'cliente').label, 'Pagado');
  assert.equal(estadoInfo('FINALIZADA', 'cliente').tone, 'success');
  assert.equal(estadoInfo('CANCELADA', 'tecnico').tone, 'neutral');
  assert.equal(estadoInfo('SUSPENDIDA', 'cliente').tone, 'danger');
  assert.equal(estadoInfo('PENDIENTE', 'tecnico').tone, 'accent');
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

test('el cliente lee su servicio en palabras llanas y con la siguiente acción', async () => {
  const { clientStatusText } = await import('../estado.ts');
  assert.equal(clientStatusText({ estado: 'PENDIENTE' }).titulo, 'Buscando técnico');
  assert.equal(clientStatusText({ estado: 'PENDIENTE' }).accion, undefined);
  assert.match(clientStatusText({ estado: 'ASIGNADA', tecnico: { nombre: 'Luis' } }).detalle, /Luis/);
  assert.equal(clientStatusText({ estado: 'EN_CAMINO' }).titulo, 'Tu técnico va en camino');
  assert.equal(clientStatusText({ estado: 'ESPERANDO_APROBACION' }).accion, 'Revisar el precio');
  assert.equal(clientStatusText({ estado: 'POR_CONFIRMAR' }).accion, 'Confirmar y pagar');
  assert.equal(clientStatusText({ estado: 'FINALIZADA' }).titulo, 'Servicio terminado');
});
