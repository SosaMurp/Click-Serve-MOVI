import { Platform } from 'react-native';

const colors = {
  // ── Paleta Unificada Click & Serve ─────────────────────────────────────────
  bgPrimary:      '#0A111E',
  bgCard:         '#162235',
  borderCard:     '#22334D',
  primary:        '#FF6B1A',
  success:        '#10B981',
  textMain:       '#FFFFFF',
  textMuted:      '#94A3B8',

  // ── Fondos y Superficies ──────────────────────────────────────────────────
  background:     '#0A111E',
  backgroundDark: '#050A14',
  gradientStart:  '#0A111E',
  gradientMid:    '#111C2E',
  gradientEnd:    '#162235',

  // ── Glassmorphism & Cards ─────────────────────────────────────────────────
  card:           '#162235',
  cardDark:       '#0E1724',
  border:         '#22334D',
  borderDark:     '#1B293E',
  glass:          'rgba(22, 34, 53, 0.85)',
  glassBorder:    '#22334D',
  glassDark:      'rgba(10, 17, 30, 0.70)',

  // ── Textos ──────────────────────────────────────────────────────────────
  textPrimary:    '#FFFFFF',
  textSecondary:  '#94A3B8',
  text:           '#FFFFFF',
  textLight:      '#FFFFFF',

  // ── Acentos ─────────────────────────────────────────────────────────────
  orange:         '#FF6B1A',
  orangeLight:    '#FF8C42',
  orangeDark:     '#E5550E',
  cyan:           '#00D4FF',
  cyanLight:      '#4DE8FF',
  cyanDark:       '#009BBF',

  // ── Estados ─────────────────────────────────────────────────────────────
  error:          '#FF4D6A',
  warning:        '#FFB340',

  // ── Gradientes categorías ────────────────────────────────────────────────
  techGrad1:      '#1565C0',
  techGrad2:      '#0288D1',
  luzGrad1:       '#E65100',
  luzGrad2:       '#FF8F00',
  hogarGrad1:     '#1B5E20',
  hogarGrad2:     '#43A047',
  otrosGrad1:     '#4A148C',
  otrosGrad2:     '#7B1FA2',

  // ── Alias de compatibilidad ──────────────────────────────────────────────
  primaryLight:   '#FF8C42',
  accent:         '#FF6B1A',
  accentDark:     '#E5550E',
};

export const theme = {
  ...colors,
  colors,

  // 3 Fuentes Estandarizadas para todo el proyecto
  fonts: {
    /** 1. Títulos, Encabezados principales, marca y cifras financieras */
    heading:   Platform.OS === 'ios' ? 'Georgia' : 'serif',
    /** 2. Interfaz general, textos de cuerpo, botones e inputs */
    body:      Platform.OS === 'ios' ? 'System'  : 'sans-serif',
    /** 3. Datos tabulares, códigos, folios, tarjetas y fechas */
    monospace: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  spacing: {
    xs:  4,
    sm:  8,
    md:  16,
    lg:  24,
    xl:  32,
  },

  borderRadius: {
    sm:   6,
    md:   14,
    lg:   20,
    xl:   28,
    full: 9999,
  },
};

export default theme;
