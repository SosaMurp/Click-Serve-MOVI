import React from 'react';
import { Platform, StyleSheet, Text as RNText, View, ViewStyle } from 'react-native';
import { Icon, IconName } from './Icon';
import { font, radius, tones, Tone } from './tokens';

// La firma visual: una placa de esmalte pintada como rótulo de taller, con letra de rótulo
// y su sombra desplazada. Anuncia estados, categorías y montos; nunca se usa como adorno.
type Size = 'sm' | 'md' | 'lg';

const SIZES: Record<Size, { fontSize: number; lineHeight: number; padH: number; padV: number; shade: number; icon: number }> = {
  sm: { fontSize: 11, lineHeight: 14, padH: 8, padV: 4, shade: 1, icon: 13 },
  md: { fontSize: 14, lineHeight: 18, padH: 10, padV: 6, shade: 1.5, icon: 16 },
  lg: { fontSize: 22, lineHeight: 26, padH: 16, padV: 12, shade: 2.5, icon: 24 },
};

type Props = {
  label: string;
  tone: Tone;
  size?: Size;
  icon?: IconName;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export function Plate({ label, tone, size = 'md', icon, style, accessibilityLabel }: Props) {
  const t = tones[tone];
  const s = SIZES[size];
  const text = label.toUpperCase();
  const lettering = { fontFamily: font.sign, fontSize: s.fontSize, lineHeight: s.lineHeight };
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel || label}
      style={[styles.plate, { backgroundColor: t.bg, paddingHorizontal: s.padH, paddingVertical: s.padV }, style]}
    >
      {size === 'lg' ? (
        <View pointerEvents="none" style={[styles.filete, { borderColor: tone === 'chrome' || tone === 'neutral' ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.45)' }]} />
      ) : null}
      {icon ? <View style={{ marginRight: size === 'lg' ? 10 : 6 }}><Icon name={icon} size={s.icon} color={t.fg} /></View> : null}
      <View>
        <RNText
          aria-hidden
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[lettering, styles.shade, { color: t.shade, left: s.shade, top: s.shade }]}
          numberOfLines={1}
        >
          {text}
        </RNText>
        <RNText style={[lettering, { color: t.fg }]} numberOfLines={1}>
          {text}
        </RNText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plate: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.plate,
    overflow: 'hidden',
  },
  filete: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 3,
    bottom: 3,
    borderWidth: 1,
    borderRadius: radius.plate - 2,
  },
  shade: {
    position: 'absolute',
    ...(Platform.OS === 'web' ? ({ userSelect: 'none' } as object) : null),
  },
});
