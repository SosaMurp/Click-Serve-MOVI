import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { color, font, type, TypeVariant } from './tokens';

export type TextTone = 'default' | 'soft' | 'muted' | 'onColor' | 'brand' | 'accent' | 'success' | 'danger' | 'warning';

const toneColor: Record<TextTone, string> = {
  default: color.ink,
  soft: color.inkSoft,
  muted: color.inkMuted,
  onColor: color.inkOnColor,
  brand: color.brandInk,
  accent: color.accentInk,
  success: color.successInk,
  danger: color.dangerInk,
  warning: color.warningInk,
};

// Con fuentes personalizadas el peso se elige por familia (en Android fontWeight no la cambia).
// Toda la app usa Inter: el peso decide la familia también en los títulos.
function familyFor(weight?: TextStyle['fontWeight']): string | undefined {
  if (!weight) return undefined;
  const w = String(weight);
  if (w >= '700') return font.bodyBold;
  if (w >= '600') return font.bodySemibold;
  if (w >= '500') return font.bodyMedium;
  return font.body;
}

type Props = TextProps & {
  variant?: TypeVariant;
  tone?: TextTone;
  align?: TextStyle['textAlign'];
  tabular?: boolean;
  weight?: TextStyle['fontWeight'];
};

export function Text({ variant = 'body', tone = 'default', align, tabular, weight, style, ...rest }: Props) {
  const family = familyFor(weight);
  return (
    <RNText
      maxFontSizeMultiplier={1.6}
      {...rest}
      style={[
        type[variant] as TextStyle,
        { color: toneColor[tone] },
        align ? { textAlign: align } : null,
        tabular ? { fontVariant: ['tabular-nums'] } : null,
        family ? { fontFamily: family } : null,
        style,
      ]}
    />
  );
}
