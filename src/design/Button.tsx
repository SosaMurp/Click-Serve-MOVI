import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Icon, IconName } from './Icon';
import { Text } from './Text';
import { color, elevation, radius, touch } from './tokens';

// primary: azul marino con texto blanco (INICIAR SESIÓN); accent: naranja para la acción destacada
// (REGISTRARME, ACEPTAR TRABAJO). filled queda como sinónimo de primary.
type Variant = 'primary' | 'accent' | 'filled' | 'tonal' | 'outlined' | 'text' | 'danger' | 'success' | 'white';

const VARIANTS: Record<Variant, { bg: string; fg: string; border?: string; pressed: string }> = {
  primary: { bg: color.brand, fg: color.inkOnColor, pressed: color.brandDeep },
  accent: { bg: color.accentStrong, fg: color.inkOnColor, pressed: color.accentPressed },
  filled: { bg: color.brand, fg: color.inkOnColor, pressed: color.brandDeep },
  tonal: { bg: color.brandSoft, fg: color.brandInk, pressed: color.brandMid },
  outlined: { bg: color.surface, fg: color.ink, border: color.lineStrong, pressed: color.surfaceSunk },
  text: { bg: 'transparent', fg: color.brandInk, pressed: color.surfaceSunk },
  danger: { bg: color.danger, fg: color.inkOnColor, pressed: color.dangerInk },
  success: { bg: color.success, fg: color.inkOnColor, pressed: color.successInk },
  white: { bg: color.surface, fg: color.ink, pressed: color.surfaceSunk },
};

// md 52 dp; lg 56 dp; xl 56 dp con letra de 17 px para las pantallas del cliente.
const HEIGHTS = { md: 52, lg: 56, xl: 56 } as const;

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  size?: 'md' | 'lg' | 'xl';
  style?: ViewStyle;
  accessibilityHint?: string;
  floating?: boolean;
};

export function Button({ title, onPress, variant = 'primary', icon, iconRight, loading, disabled, full, size = 'md', style, accessibilityHint, floating }: Props) {
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
        const focused = (state as { focused?: boolean }).focused;
        const hovered = (state as { hovered?: boolean }).hovered;
        return [
          styles.base,
          {
            minHeight: Math.max(HEIGHTS[size], touch.min),
            backgroundColor: state.pressed || hovered ? v.pressed : v.bg,
            borderColor: v.border || 'transparent',
            borderWidth: v.border ? 1 : 0,
            alignSelf: full ? 'stretch' : floating ? 'center' : 'flex-start',
            paddingHorizontal: variant === 'text' ? 12 : 24,
            opacity: inactive && !loading ? 0.45 : 1,
          },
          floating ? elevation[2] : null,
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
          {/* Los botones llenos van en MAYÚSCULAS y negrita; los de texto, como enlace en negrita. */}
          <Text
            variant={variant === 'text' ? 'label' : 'button'}
            weight={variant === 'text' ? '700' : undefined}
            style={[{ color: v.fg }, size === 'xl' ? styles.xlText : null]}
            numberOfLines={2}
            align="center"
          >
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
  badge?: number | boolean;
  bordered?: boolean;
};

// Botón de ícono circular de 48 dp (blanco en encabezados, azul marino para "ver más").
export function IconButton({ icon, onPress, label, tint = color.ink, background = 'transparent', size = 22, disabled, badge, bordered }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={typeof badge === 'number' && badge > 0 ? `${label}, ${badge} pendientes` : label}
      disabled={disabled}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [
        styles.iconBtn,
        { backgroundColor: background, opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
        bordered ? styles.bordered : null,
      ]}
    >
      <Icon name={icon} size={size} color={tint} />
      {badge ? (
        typeof badge === 'number' ? (
          <View style={styles.badge}><Text variant="caption" tone="onColor" style={styles.badgeText}>{badge > 9 ? '9+' : String(badge)}</Text></View>
        ) : <View style={styles.dot} />
      ) : null}
    </Pressable>
  );
}

// Círculo azul marino con flecha, para "ver todo" (como en la referencia).
export function CircleArrow({ onPress, label, icon = 'arrow-right' }: { onPress?: () => void; label: string; icon?: IconName }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={8} style={({ pressed }) => [styles.circle, pressed && { opacity: 0.8 }]}>
      <Icon name={icon} size={18} color={color.inkOnColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 1 },
  xlText: { fontSize: 17, lineHeight: 22 },
  focus: { outlineStyle: 'solid', outlineWidth: 3, outlineColor: color.focus, outlineOffset: 2 } as object,
  iconBtn: { width: touch.min, height: touch.min, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  bordered: { borderWidth: 1, borderColor: color.line },
  badge: { position: 'absolute', top: 5, right: 5, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: color.danger, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { fontSize: 10, lineHeight: 12 },
  dot: { position: 'absolute', top: 11, right: 12, width: 9, height: 9, borderRadius: 5, backgroundColor: color.danger, borderWidth: 2, borderColor: color.surface },
  circle: { width: 36, height: 36, borderRadius: 18, backgroundColor: color.navy, alignItems: 'center', justifyContent: 'center' },
});
