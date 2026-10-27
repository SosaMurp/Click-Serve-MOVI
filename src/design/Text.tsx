import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { color, type, TypeVariant } from './tokens';

export type TextTone = 'default' | 'soft' | 'muted' | 'onColor' | 'cobalt' | 'verde' | 'bermellon' | 'chrome';

const toneColor: Record<TextTone, string> = {
  default: color.ink,
  soft: color.inkSoft,
  muted: color.inkMuted,
  onColor: color.inkOnColor,
  cobalt: color.cobaltInk,
  verde: color.verdeInk,
  bermellon: color.bermellonInk,
  chrome: color.chromeInk,
};

type Props = TextProps & {
  variant?: TypeVariant;
  tone?: TextTone;
  align?: TextStyle['textAlign'];
  tabular?: boolean;
  weight?: TextStyle['fontWeight'];
};

export function Text({ variant = 'body', tone = 'default', align, tabular, weight, style, ...rest }: Props) {
  return (
    <RNText
      maxFontSizeMultiplier={1.6}
      {...rest}
      style={[
        type[variant] as TextStyle,
        { color: toneColor[tone] },
        align ? { textAlign: align } : null,
        tabular ? { fontVariant: ['tabular-nums'] } : null,
        weight ? { fontWeight: weight } : null,
        style,
      ]}
    />
  );
}
