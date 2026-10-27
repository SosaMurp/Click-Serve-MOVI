import { Platform } from 'react-native';

// Identidad tomada del logo de Click & Serve: azul profundo del pin y naranja del cursor.
// Fondo casi blanco, tarjetas blancas muy redondeadas y bloques pastel derivados de esos dos colores.
// Verde, ámbar y rojo se reservan para estados (pagado, requiere acción, error o SOS).
export const color = {
  ground: '#F7F8FA',
  groundAlt: '#EEF1F5',
  surface: '#FFFFFF',
  surfaceSunk: '#F2F4F7',
  line: '#E6E9EF',
  lineStrong: '#D0D5DD',

  ink: '#141A23',
  inkSoft: '#475467',
  inkMuted: '#667085',
  inkOnColor: '#FFFFFF',

  brand: '#0B4F85',
  brandDeep: '#083C66',
  brandSoft: '#D8E9F8',
  brandMid: '#B9D6F2',
  brandInk: '#0B4F85',

  accent: '#E8801F',
  accentPressed: '#CF6E12',
  accentSoft: '#FFE3CC',
  accentInk: '#8A4300',

  navy: '#0F1E2E',

  success: '#138A4B',
  successSoft: '#DDF3E6',
  successInk: '#0B6235',

  warning: '#F2A91E',
  warningSoft: '#FFF1D1',
  warningInk: '#7A4F00',

  danger: '#D92D20',
  dangerSoft: '#FDE4E2',
  dangerInk: '#A41F15',

  scrim: 'rgba(15, 30, 46, 0.45)',
  focus: '#E8801F',
} as const;

export type Tone = 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'navy' | 'neutral';

// Cada tono con su versión llena (para acentos fuertes) y su versión suave (para píldoras y bloques).
export const tones: Record<Tone, { bg: string; fg: string; soft: string; softInk: string }> = {
  brand: { bg: color.brand, fg: color.inkOnColor, soft: color.brandSoft, softInk: color.brandInk },
  accent: { bg: color.accent, fg: color.ink, soft: color.accentSoft, softInk: color.accentInk },
  success: { bg: color.success, fg: color.inkOnColor, soft: color.successSoft, softInk: color.successInk },
  warning: { bg: color.warning, fg: color.ink, soft: color.warningSoft, softInk: color.warningInk },
  danger: { bg: color.danger, fg: color.inkOnColor, soft: color.dangerSoft, softInk: color.dangerInk },
  navy: { bg: color.navy, fg: color.inkOnColor, soft: color.groundAlt, softInk: color.inkSoft },
  neutral: { bg: color.groundAlt, fg: color.ink, soft: color.groundAlt, softInk: color.inkSoft },
};

export const space = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = { xs: 8, sm: 12, md: 20, lg: 28, xl: 32, full: 999 } as const;

// RNF-30: objetivos táctiles de al menos 48 dp.
export const touch = { min: 48 } as const;

export const font = {
  heading: 'Outfit_600SemiBold',
  headingMedium: 'Outfit_500Medium',
  headingBold: 'Outfit_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

export const type = {
  display: { fontFamily: font.heading, fontSize: 32, lineHeight: 38 },
  number: { fontFamily: font.heading, fontSize: 30, lineHeight: 36 },
  headline: { fontFamily: font.heading, fontSize: 26, lineHeight: 32 },
  appbar: { fontFamily: font.heading, fontSize: 20, lineHeight: 26 },
  title: { fontFamily: font.heading, fontSize: 18, lineHeight: 24 },
  subtitle: { fontFamily: font.bodySemibold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: font.body, fontSize: 16, lineHeight: 24 },
  bodySm: { fontFamily: font.body, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: font.bodySemibold, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: font.bodyMedium, fontSize: 12, lineHeight: 16 },
  overline: { fontFamily: font.bodyMedium, fontSize: 13, lineHeight: 18 },
} as const;

export type TypeVariant = keyof typeof type;

// Sombras casi invisibles: la separación la dan el fondo claro y los radios grandes.
export const elevation = {
  0: {},
  1: Platform.select({
    web: { boxShadow: '0 4px 18px rgba(16, 24, 40, 0.06)' } as object,
    default: { shadowColor: '#101828', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  }),
  2: Platform.select({
    web: { boxShadow: '0 12px 32px rgba(16, 24, 40, 0.12)' } as object,
    default: { shadowColor: '#101828', shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
  }),
} as const;

// Degradado de la tarjeta destacada: azul de marca → cielo → durazno.
export const gradient = {
  hero: [color.brand, '#4F8FC6', '#F3B98A'] as const,
  heroText: color.inkOnColor,
};

export const motion = { fast: 120, base: 200, slow: 320 } as const;
