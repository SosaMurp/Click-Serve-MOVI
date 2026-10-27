import { Platform } from 'react-native';

// Mundo visual: rótulos pintados a mano de los talleres de Lázaro Cárdenas.
// Cal blanca de fondo, esmaltes planos (cobalto, amarillo cromo, verde bandera, bermellón) y tinta negra.
export const color = {
  ground: '#FFFFFF',
  groundAlt: '#F3F4F6',
  surface: '#FFFFFF',
  surfaceSunk: '#F7F8FA',
  line: '#E3E5EA',
  lineStrong: '#C9CDD6',

  ink: '#16181D',
  inkSoft: '#474D5B',
  inkMuted: '#666C7A',
  inkOnColor: '#FFFFFF',

  cobalt: '#1D3FBF',
  cobaltDeep: '#132C8C',
  cobaltShade: '#0B1C5C',
  cobaltSoft: '#E7ECFB',
  cobaltInk: '#132C8C',

  chrome: '#FFC21A',
  chromeShade: '#C98A00',
  chromeSoft: '#FFF4D1',
  chromeInk: '#5A4100',

  verde: '#087A3B',
  verdeShade: '#03481F',
  verdeSoft: '#E2F3E8',
  verdeInk: '#065C2C',

  bermellon: '#D7261E',
  bermellonShade: '#7E0F0A',
  bermellonSoft: '#FCE7E5',
  bermellonInk: '#A1170F',

  carbon: '#23262E',
  carbonShade: '#000000',

  scrim: 'rgba(16, 18, 24, 0.48)',
  focus: '#1D3FBF',
} as const;

export type Tone = 'cobalt' | 'chrome' | 'verde' | 'bermellon' | 'carbon' | 'neutral';

// Cada tono de esmalte con su tinta, su sombra de letra y su versión suave para fondos.
export const tones: Record<Tone, { bg: string; fg: string; shade: string; soft: string; softInk: string }> = {
  cobalt: { bg: color.cobalt, fg: color.inkOnColor, shade: color.cobaltShade, soft: color.cobaltSoft, softInk: color.cobaltInk },
  chrome: { bg: color.chrome, fg: color.ink, shade: color.chromeShade, soft: color.chromeSoft, softInk: color.chromeInk },
  verde: { bg: color.verde, fg: color.inkOnColor, shade: color.verdeShade, soft: color.verdeSoft, softInk: color.verdeInk },
  bermellon: { bg: color.bermellon, fg: color.inkOnColor, shade: color.bermellonShade, soft: color.bermellonSoft, softInk: color.bermellonInk },
  carbon: { bg: color.carbon, fg: color.inkOnColor, shade: color.carbonShade, soft: color.groundAlt, softInk: color.inkSoft },
  neutral: { bg: color.groundAlt, fg: color.ink, shade: color.lineStrong, soft: color.groundAlt, softInk: color.inkSoft },
};

export const space = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = { plate: 6, sm: 8, md: 12, lg: 20, full: 999 } as const;

// RNF-30: objetivos táctiles de al menos 48 dp.
export const touch = { min: 48 } as const;

export const font = {
  sign: 'Bungee_400Regular',
  ui: Platform.select({ web: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', default: undefined }),
};

export const type = {
  display: { fontFamily: font.sign, fontSize: 30, lineHeight: 36, letterSpacing: 0.2 },
  headline: { fontFamily: font.sign, fontSize: 22, lineHeight: 28, letterSpacing: 0.2 },
  appbar: { fontFamily: font.sign, fontSize: 19, lineHeight: 24, letterSpacing: 0.3 },
  title: { fontFamily: font.ui, fontSize: 18, lineHeight: 24, fontWeight: '700' },
  subtitle: { fontFamily: font.ui, fontSize: 16, lineHeight: 22, fontWeight: '600' },
  body: { fontFamily: font.ui, fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodySm: { fontFamily: font.ui, fontSize: 14, lineHeight: 20, fontWeight: '400' },
  label: { fontFamily: font.ui, fontSize: 15, lineHeight: 20, fontWeight: '600' },
  caption: { fontFamily: font.ui, fontSize: 12, lineHeight: 16, fontWeight: '500' },
  overline: { fontFamily: font.ui, fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 0.4 },
} as const;

export type TypeVariant = keyof typeof type;

export const elevation = {
  0: {},
  1: Platform.select({
    web: { boxShadow: '0 1px 3px rgba(22, 24, 29, 0.10)' } as object,
    default: { shadowColor: '#16181D', shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  }),
  2: Platform.select({
    web: { boxShadow: '0 6px 18px rgba(22, 24, 29, 0.14)' } as object,
    default: { shadowColor: '#16181D', shadowOpacity: 0.14, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  }),
} as const;

export const motion = { fast: 120, base: 200, slow: 320 } as const;
