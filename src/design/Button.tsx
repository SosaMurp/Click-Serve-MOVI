import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Icon, IconName } from './Icon';
import { Text } from './Text';
import { color, radius, touch } from './tokens';

type Variant = 'filled' | 'tonal' | 'outlined' | 'text' | 'danger' | 'success';

const VARIANTS: Record<Variant, { bg: string; fg: string; border?: string; pressed: string }> = {
  filled: { bg: color.cobalt, fg: color.inkOnColor, pressed: color.cobaltDeep },
  tonal: { bg: color.cobaltSoft, fg: color.cobaltInk, pressed: '#D5DEF8' },
  outlined: { bg: 'transparent', fg: color.cobaltInk, border: color.lineStrong, pressed: color.cobaltSoft },
  text: { bg: 'transparent', fg: color.cobaltInk, pressed: color.cobaltSoft },
  danger: { bg: color.bermellon, fg: color.inkOnColor, pressed: color.bermellonInk },
  success: { bg: color.verde, fg: color.inkOnColor, pressed: color.verdeInk },
};

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  size?: 'md' | 'lg';
  style?: ViewStyle;
  accessibilityHint?: string;
};

export function Button({ title, onPress, variant = 'filled', icon, iconRight, loading, disabled, full, size = 'md', style, accessibilityHint }: Props) {
  const v = VARIANTS[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={(state) => {
        const { pressed } = state;
        const focused = (state as { focused?: boolean }).focused;
        const hovered = (state as { hovered?: boolean }).hovered;
        return [
          styles.base,
          {
            height: size === 'lg' ? 56 : touch.min,
            backgroundColor: pressed || hovered ? v.pressed : v.bg,
            borderColor: v.border || 'transparent',
            borderWidth: v.border ? 1.5 : 0,
            alignSelf: full ? 'stretch' : 'flex-start',
            paddingHorizontal: variant === 'text' ? 12 : 22,
            opacity: inactive && !loading ? 0.45 : 1,
          },
          focused && Platform.OS === 'web' ? styles.focus : null,
          style,
        ];
      }}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={20} color={v.fg} /> : null}
          <Text variant="label" style={{ color: v.fg }} numberOfLines={1}>
            {title}
          </Text>
          {iconRight ? <Icon name={iconRight} size={20} color={v.fg} /> : null}
        </View>
      )}
    </Pressable>
  );
}

type IconButtonProps = {
  icon: IconName;
  onPress?: () => void;
  label: string;
  tint?: string;
  background?: string;
  size?: number;
  disabled?: boolean;
  badge?: number;
};

export function IconButton({ icon, onPress, label, tint = color.ink, background = 'transparent', size = 24, disabled, badge }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [styles.iconBtn, { backgroundColor: pressed ? 'rgba(127,127,127,0.18)' : background, opacity: disabled ? 0.4 : 1 }]}
    >
      <Icon name={icon} size={size} color={tint} />
      {badge ? (
        <View style={styles.badge}>
          <Text variant="caption" tone="onColor" style={styles.badgeText}>{badge > 9 ? '9+' : String(badge)}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  focus: { outlineStyle: 'solid', outlineWidth: 3, outlineColor: color.chrome, outlineOffset: 2 } as object,
  iconBtn: { width: touch.min, height: touch.min, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute', top: 6, right: 6, minWidth: 18, height: 18, borderRadius: 9,
    backgroundColor: color.bermellon, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, lineHeight: 12, fontWeight: '700' },
});
