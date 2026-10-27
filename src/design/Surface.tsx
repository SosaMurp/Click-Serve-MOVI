import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Icon, IconName } from './Icon';
import { Text } from './Text';
import { color, radius, space, touch } from './tokens';

type SurfaceProps = { children: React.ReactNode; onPress?: () => void; style?: ViewStyle; padded?: boolean; accessibilityLabel?: string; tone?: 'plain' | 'sunk' };

// Superficie plana con filete de 1 px. Se usa para objetos reales (una orden, una tarjeta), no como relleno.
export function Surface({ children, onPress, style, padded = true, accessibilityLabel, tone = 'plain' }: SurfaceProps) {
  const base = [styles.surface, tone === 'sunk' && styles.sunk, padded && styles.padded, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [base, pressed && styles.pressed]}
    >
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
  iconTone?: 'cobalt' | 'verde' | 'bermellon' | 'chrome' | 'neutral';
  trailing?: React.ReactNode;
  trailingText?: string;
  onPress?: () => void;
  chevron?: boolean;
  destructive?: boolean;
  disabled?: boolean;
};

const ICON_TONES = {
  cobalt: { bg: color.cobaltSoft, fg: color.cobaltInk },
  verde: { bg: color.verdeSoft, fg: color.verdeInk },
  bermellon: { bg: color.bermellonSoft, fg: color.bermellonInk },
  chrome: { bg: color.chromeSoft, fg: color.chromeInk },
  neutral: { bg: color.groundAlt, fg: color.inkSoft },
};

export function ListItem({ title, subtitle, icon, iconTone = 'neutral', trailing, trailingText, onPress, chevron = !!onPress, destructive, disabled }: ListItemProps) {
  const t = ICON_TONES[destructive ? 'bermellon' : iconTone];
  const content = (
    <>
      {icon ? (
        <View style={[styles.leading, { backgroundColor: t.bg }]}>
          <Icon name={icon} size={20} color={t.fg} />
        </View>
      ) : null}
      <View style={styles.texts}>
        <Text variant="subtitle" tone={destructive ? 'bermellon' : 'default'} numberOfLines={2}>{title}</Text>
        {subtitle ? <Text variant="bodySm" tone="muted" numberOfLines={3}>{subtitle}</Text> : null}
      </View>
      {trailingText ? <Text variant="bodySm" tone="muted" style={styles.trailingText}>{trailingText}</Text> : null}
      {trailing}
      {chevron ? <Icon name="chevron-right" size={22} color={color.inkMuted} /> : null}
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

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.section}>
      <Text variant="overline" tone="soft" accessibilityRole="header" style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      {action && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={10} style={styles.sectionAction}>
          <Text variant="label" tone="cobalt">{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: { backgroundColor: color.surface, borderRadius: radius.md, borderWidth: 1, borderColor: color.line },
  sunk: { backgroundColor: color.surfaceSunk },
  padded: { padding: space.lg },
  pressed: { backgroundColor: color.surfaceSunk },
  divider: { height: 1, backgroundColor: color.line },
  item: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md, paddingHorizontal: space.lg },
  pressedItem: { backgroundColor: color.surfaceSunk },
  leading: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
  trailingText: { marginLeft: space.sm },
  section: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xl, marginBottom: space.sm, minHeight: touch.min - 16 },
  sectionTitle: { flex: 1 },
  sectionAction: { minHeight: 36, justifyContent: 'center' },
});
