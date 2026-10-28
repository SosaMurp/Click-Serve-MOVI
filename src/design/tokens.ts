import { Platform } from 'react-native';

// Identidad de las referencias de Click & Serve: blanco, azul marino casi negro para títulos y la acción
// principal, y naranja para la acción destacada. Plano y sobrio: sin degradados ni bloques pastel.
// Verde, ámbar y rojo se reservan para estados (pagado, requiere acción, error o SOS).
// Contrastes sobre blanco: tinta 16.7:1, secundario 7.6:1, tenue 5:1, borde de campo 3.1:1.
// El naranja de marca (#FF6B00) da 2.9:1 con texto blanco: los botones naranjas usan #E25900 (3.7:1)
// con la etiqueta en negrita y mayúsculas, y los enlaces naranjas el tono de texto #B84A00 (5.2:1).
export const color = {
  ground: '#FFFFFF',
  groundAlt: '#F7F8F9',
  surface: '#FFFFFF',
  surfaceSunk: '#F7F8F9',
  line: '#E6E9EE',
  lineStrong: '#8B93A1',

  ink: '#0C1C40',
  inkSoft: '#4B5563',
  inkMuted: '#667085',
  inkOnColor: '#FFFFFF',

  brand: '#0C1C40',
  brandDeep: '#081430',
  brandSoft: '#E8EBF2',
  brandMid: '#CDD3E0',
  brandInk: '#0C1C40',

  accent: '#FF6B00',
  accentStrong: '#E25900',
  accentPressed: '#C94E00',
  accentSoft: '#FFEDE0',
  accentInk: '#B84A00',

  navy: '#0C1C40',

  success: '#0E7A42',
  successSoft: '#E3F4EA',
  successInk: '#0B6235',

  warning: '#F2A91E',
  warningSoft: '#FFF3D6',
  warningInk: '#7A4F00',

  danger: '#D92D20',
  dangerSoft: '#FDE8E6',
  dangerInk: '#A41F15',

  scrim: 'rgba(12, 28, 64, 0.5)',
  focus: '#FF6B00',
} as const;

export type Tone = 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'navy' | 'neutral';

// Cada tono con su versión llena (para acentos fuertes) y su versión suave (para píldoras).
export const tones: Record<Tone, { bg: string; fg: string; soft: string; softInk: string }> = {
  brand: { bg: color.brand, fg: color.inkOnColor, soft: color.brandSoft, softInk: color.brandInk },
  accent: { bg: color.accentStrong, fg: color.inkOnColor, soft: color.accentSoft, softInk: color.accentInk },
  success: { bg: color.success, fg: color.inkOnColor, soft: color.successSoft, softInk: color.successInk },
  warning: { bg: color.warning, fg: color.ink, soft: color.warningSoft, softInk: color.warningInk },
  danger: { bg: color.danger, fg: color.inkOnColor, soft: color.dangerSoft, softInk: color.dangerInk },
  navy: { bg: color.navy, fg: color.inkOnColor, soft: color.groundAlt, softInk: color.inkSoft },
  neutral: { bg: color.groundAlt, fg: color.ink, soft: color.groundAlt, softInk: color.inkSoft },
};

export const space = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

// Campos y botones con radio 12; tarjetas con 16.
export const radius = { xs: 8, sm: 10, md: 12, lg: 16, xl: 24, full: 999 } as const;

// RNF-30: objetivos táctiles de al menos 48 dp; 56 en las pantallas del cliente (CILIM).
export const touch = { min: 48, comfortable: 56 } as const;

export const font = {
  heading: 'Inter_700Bold',
  headingMedium: 'Inter_600SemiBold',
  headingBold: 'Inter_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

export const type = {
  display: { fontFamily: font.heading, fontSize: 32, lineHeight: 38, letterSpacing: -0.4 },
  number: { fontFamily: font.heading, fontSize: 30, lineHeight: 36 },
  headline: { fontFamily: font.heading, fontSize: 26, lineHeight: 32, letterSpacing: -0.2 },
  appbar: { fontFamily: font.heading, fontSize: 20, lineHeight: 26 },
  title: { fontFamily: font.heading, fontSize: 18, lineHeight: 24 },
  subtitle: { fontFamily: font.bodySemibold, fontSize: 16, lineHeight: 22 },
  bodyLg: { fontFamily: font.body, fontSize: 18, lineHeight: 27 },
  body: { fontFamily: font.body, fontSize: 16, lineHeight: 24 },
  bodySm: { fontFamily: font.body, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: font.bodySemibold, fontSize: 15, lineHeight: 20 },
  button: { fontFamily: font.bodyBold, fontSize: 15, lineHeight: 20, letterSpacing: 0.6, textTransform: 'uppercase' as const },
  caption: { fontFamily: font.bodyMedium, fontSize: 12, lineHeight: 16 },
  // Etiquetas de campo y de sección: MAYÚSCULAS pequeñas en negrita (CORREO ELECTRÓNICO).
  overline: { fontFamily: font.bodyBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.6, textTransform: 'uppercase' as const },
} as const;

export type TypeVariant = keyof typeof type;

// Sombra muy suave: la separación la dan el borde fino y el fondo blanco.
export const elevation = {
  0: {},
  1: Platform.select({
    web: { boxShadow: '0 2px 10px rgba(12, 28, 64, 0.06)' } as object,
    default: { shadowColor: '#0C1C40', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  }),
  2: Platform.select({
    web: { boxShadow: '0 10px 28px rgba(12, 28, 64, 0.14)' } as object,
    default: { shadowColor: '#0C1C40', shadowOpacity: 0.14, shadowRadius: 22, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  }),
} as const;
