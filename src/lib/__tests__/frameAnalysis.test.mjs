import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeFrame, CARD_RATIO, cardFrame } from '../frameAnalysis.ts';

const W = 320;
const H = 240;
const frame = cardFrame(W, H);

// Imagen en escala de grises de W×H a partir de una función por píxel.
const image = (fn) => {
  const px = new Uint8ClampedArray(W * H);
  for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) px[y * W + x] = fn(x, y);
  return px;
};
const inFrame = (x, y) => x >= frame.x && x < frame.x + frame.w && y >= frame.y && y < frame.y + frame.h;
// Credencial que llena el marco: fondo claro con renglones oscuros (como el texto impreso).
const card = (x, y) => (inFrame(x, y) ? (Math.floor((y - frame.y) / 8) % 2 === 0 && (x - frame.x) % 40 < 30 ? 40 : 225) : 90);
// Promedio de 7×7: la misma credencial desenfocada.
const blurred = (px) => image((x, y) => {
  let s = 0;
  let n = 0;
  for (let dy = -3; dy <= 3; dy += 1) for (let dx = -3; dx <= 3; dx += 1) {
    const xx = Math.min(W - 1, Math.max(0, x + dx));
    const yy = Math.min(H - 1, Math.max(0, y + dy));
    s += px[yy * W + xx];
    n += 1;
  }
  return s / n;
});

test('el marco tiene la proporción de la credencial (85.6 × 54 mm) y cabe en la imagen', () => {
  assert.ok(Math.abs(frame.w / frame.h - CARD_RATIO) < 0.02);
  assert.ok(frame.x >= 0 && frame.y >= 0 && frame.x + frame.w <= W && frame.y + frame.h <= H);
});

test('una pared lisa pide acercar la credencial', () => {
  assert.equal(analyzeFrame(image(() => 128), W, H, frame).consejo, 'acercar');
});

test('una credencial nítida que llena el marco no da ningún consejo', () => {
  const r = analyzeFrame(image(card), W, H, frame);
  assert.equal(r.consejo, null, JSON.stringify(r));
});

test('mucho blanco saturado dentro del marco es reflejo', () => {
  const r = analyzeFrame(image((x, y) => (inFrame(x, y) && x < frame.x + frame.w * 0.35 ? 255 : card(x, y))), W, H, frame);
  assert.equal(r.consejo, 'reflejo');
});

test('la misma credencial desenfocada está borrosa', () => {
  const r = analyzeFrame(blurred(image(card)), W, H, frame);
  assert.equal(r.consejo, 'borrosa', JSON.stringify(r));
});

test('una imagen muy oscura pide más luz', () => {
  assert.equal(analyzeFrame(image(() => 18), W, H, frame).consejo, 'oscuro');
});
