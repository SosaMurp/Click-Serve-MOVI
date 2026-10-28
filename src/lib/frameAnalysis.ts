// Análisis en vivo de cuadros de la cámara para la captura de la INE (sin dependencias: se prueba con
// node --test). Trabaja sobre la imagen en escala de grises reducida (~320 px de ancho).

// Proporción de la credencial para votar: 85.6 × 54 mm (ISO/IEC 7810 ID-1).
export const CARD_RATIO = 85.6 / 54;

export type Rect = { x: number; y: number; w: number; h: number };
export type Consejo = 'acercar' | 'reflejo' | 'borrosa' | 'oscuro' | 'claro';
export type FrameAnalysis = { brillo: number; reflejo: number; nitidez: number; documento: number; consejo: Consejo | null };

// Marco centrado con la proporción de la credencial que ocupa ~86 % del lado que limite.
export function cardFrame(width: number, height: number, fill = 0.86): Rect {
  let w = width * fill;
  let h = w / CARD_RATIO;
  if (h > height * fill) {
    h = height * fill;
    w = h * CARD_RATIO;
  }
  return { x: Math.round((width - w) / 2), y: Math.round((height - h) / 2), w: Math.round(w), h: Math.round(h) };
}

// Umbrales calibrados con imágenes de prueba (src/lib/__tests__/frameAnalysis.test.mjs): una credencial
// apenas suave (cámara web) da ~600-900 de nitidez y una desenfocada ~150. Son tolerantes a propósito:
// la comprobación estricta la hace el servidor con OCR.
export const UMBRAL = { oscuro: 50, claro: 235, reflejo: 0.15, documento: 25, nitidez: 250 };

export function analyzeFrame(gray: ArrayLike<number>, width: number, height: number, frame: Rect): FrameAnalysis {
  const x0 = Math.max(1, frame.x);
  const y0 = Math.max(1, frame.y);
  const x1 = Math.min(width - 1, frame.x + frame.w);
  const y1 = Math.min(height - 1, frame.y + frame.h);
  let n = 0;
  let sum = 0;
  let sumSq = 0;
  let sat = 0;
  let lapSum = 0;
  let lapSq = 0;
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const i = y * width + x;
      const v = gray[i];
      sum += v;
      sumSq += v * v;
      if (v >= 250) sat += 1;
      const lap = 4 * v - gray[i - 1] - gray[i + 1] - gray[i - width] - gray[i + width];
      lapSum += lap;
      lapSq += lap * lap;
      n += 1;
    }
  }
  if (!n) return { brillo: 0, reflejo: 0, nitidez: 0, documento: 0, consejo: 'acercar' };
  const brillo = sum / n;
  const documento = Math.sqrt(Math.max(0, sumSq / n - brillo * brillo));
  const reflejo = sat / n;
  const nitidez = lapSq / n - (lapSum / n) ** 2;

  let consejo: Consejo | null = null;
  if (brillo < UMBRAL.oscuro) consejo = 'oscuro';
  else if (brillo > UMBRAL.claro) consejo = 'claro';
  else if (reflejo > UMBRAL.reflejo) consejo = 'reflejo';
  else if (documento < UMBRAL.documento) consejo = 'acercar';
  else if (nitidez < UMBRAL.nitidez) consejo = 'borrosa';
  return { brillo, reflejo, nitidez, documento, consejo };
}

export const CONSEJOS: Record<Consejo, string> = {
  acercar: 'Acerca la credencial hasta que llene el marco',
  reflejo: 'Hay reflejo: inclina un poco la credencial',
  borrosa: 'Está borrosa: mantenla quieta',
  oscuro: 'Falta luz: busca un lugar más iluminado',
  claro: 'Hay demasiada luz: evita el sol directo',
};
