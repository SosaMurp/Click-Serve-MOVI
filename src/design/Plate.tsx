import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Icon, IconName } from './Icon';
import { Text } from './Text';
import { radius, tones, Tone } from './tokens';

// Píldora de estado: fondo suave del tono, punto o ícono y texto. El color nunca va solo (RNF-31).
type Size = 'sm' | 'md' | 'lg';

const SIZES: Record<Size, { padH: number; height: number; text: 'caption' | 'label'; icon: number }> = {
  sm: { padH: 10, height: 26, text: 'caption', icon: 12 },
  md: { padH: 12, height: 32, text: 'label', icon: 15 },
  lg: { padH: 16, height: 40, text: 'label', icon: 18 },
};

type Props = { label: string; tone: Tone; size?: Size; icon?: IconName; style?: ViewStyle; accessibilityLabel?: string; solid?: boolean };

export function Pill({ label, tone, size = 'md', icon, style, accessibilityLabel, solid }: Props) {
  const t = tones[tone];
  const s = SIZES[size];
  const fg = solid ? t.fg : t.softInk;
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel || label}
      style={[styles.pill, { backgroundColor: solid ? t.bg : t.soft, paddingHorizontal: s.padH, minHeight: s.height }, style]}
    >
      {icon ? <Icon name={icon} size={s.icon} color={fg} /> : <View style={[styles.dot, { backgroundColor: solid ? t.fg : (tone === 'neutral' ? t.softInk : t.bg) }]} />}
      <Text variant={s.text} style={{ color: fg }} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, borderRadius: radius.full },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
