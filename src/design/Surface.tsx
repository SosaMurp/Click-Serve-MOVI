import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { CircleArrow } from './Button';
import { Icon, IconName } from './Icon';
import { Text } from './Text';
import { color, elevation, radius, space } from './tokens';

export type SurfaceTint = 'plain' | 'sunk' | 'brand' | 'sky' | 'peach' | 'accent' | 'navy';

const TINTS: Record<SurfaceTint, string> = {
  plain: color.surface,
  sunk: color.surfaceSunk,
  brand: color.brand,
  sky: color.brandSoft,
  peach: color.accentSoft,
  accent: color.accent,
  navy: color.navy,
};

type SurfaceProps = { children: React.ReactNode; onPress?: () => void; style?: ViewStyle; padded?: boolean; accessibilityLabel?: string; tint?: SurfaceTint; tone?: 'plain' | 'sunk'; flat?: boolean };

// Tarjeta muy redondeada, sin bordes duros y con sombra casi invisible. Las tintas pastel forman bloques.
export function Surface({ children, onPress, style, padded = true, accessibilityLabel, tint, tone, flat }: SurfaceProps) {
  const bg = TINTS[tint || tone || 'plain'];
  const base = [styles.surface, { backgroundColor: bg }, !flat && (tint || 'plain') === 'plain' ? elevation[1] : null, padded && styles.padded, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={({ pressed }) => [base, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

export function Divider({ inset = 0 }: { inset?: number }) {
  return <View style={[styles.divider, { marginLeft: inset }]} />;
}

type ListItemProps = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  iconTone?: 'brand' | 'success' | 'danger' | 'warning' | 'accent' | 'neutral';
  trailing?: React.ReactNode;
  trailingText?: string;
  onPress?: () => void;
  chevron?: boolean;
  destructive?: boolean;
  disabled?: boolean;
};

const ICON_TONES = {
  brand: { bg: color.brandSoft, fg: color.brandInk },
  success: { bg: color.successSoft, fg: color.successInk },
  danger: { bg: color.dangerSoft, fg: color.dangerInk },
  warning: { bg: color.warningSoft, fg: color.warningInk },
  accent: { bg: color.accentSoft, fg: color.accentInk },
  neutral: { bg: color.surfaceSunk, fg: color.inkSoft },
};

// Fila de lista: ícono en círculo pastel, texto y valor o flecha a la derecha (como "Cuándo · Cualquiera").
export function ListItem({ title, subtitle, icon, iconTone = 'neutral', trailing, trailingText, onPress, chevron = !!onPress, destructive, disabled }: ListItemProps) {
  const t = ICON_TONES[destructive ? 'danger' : iconTone];
  const content = (
    <>
      {icon ? <View style={[styles.leading, { backgroundColor: t.bg }]}><Icon name={icon} size={18} color={t.fg} /></View> : null}
      <View style={styles.texts}>
        <Text variant="subtitle" tone={destructive ? 'danger' : 'default'} numberOfLines={2}>{title}</Text>
        {subtitle ? <Text variant="bodySm" tone="muted" numberOfLines={3}>{subtitle}</Text> : null}
      </View>
      {trailingText ? <Text variant="label" tone="soft" style={styles.trailingText}>{trailingText}</Text> : null}
      {trailing}
      {chevron ? <Icon name="chevron-right" size={20} color={color.inkMuted} /> : null}
    </>
  );
  if (!onPress) return <View style={styles.item}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.item, pressed && styles.pressedItem, disabled && { opacity: 0.45 }]}
    >
      {content}
    </Pressable>
  );
}

// Encabezado de sección: texto pequeño gris o título con el círculo azul marino de "ver todo".
export function SectionHeader({ title, action, onAction, large }: { title: string; action?: string; onAction?: () => void; large?: boolean }) {
  return (
    <View style={styles.section}>
      <Text variant={large ? 'headline' : 'title'} accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
      {onAction ? (
        action ? (
          <Pressable accessibilityRole="button" onPress={onAction} hitSlop={10} style={styles.sectionAction}>
            <Text variant="label" tone="brand">{action}</Text>
          </Pressable>
        ) : <CircleArrow label={`Ver todo: ${title}`} onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: { borderRadius: radius.lg },
  padded: { padding: space.lg },
  pressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
  divider: { height: 1, backgroundColor: color.line, marginVertical: space.xs },
  item: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md, paddingHorizontal: space.lg },
  pressedItem: { backgroundColor: color.surfaceSunk },
  leading: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
  trailingText: { marginLeft: space.sm },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xl, marginBottom: space.md, gap: space.md },
  sectionTitle: { flex: 1 },
  sectionAction: { minHeight: 36, justifyContent: 'center' },
});
