import React from 'react';
import { Image, Pressable, StyleSheet, Switch, View, ViewStyle } from 'react-native';
import { Icon, IconName } from './Icon';
import { Text } from './Text';
import { color, font, radius, space, touch } from './tokens';
import { initials } from '../lib/format';

// ───────── Chip de filtro / selección (Material 3) ─────────
type ChipProps = { label: string; selected?: boolean; onPress?: () => void; icon?: IconName; disabled?: boolean };

export function Chip({ label, selected, onPress, icon, disabled }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipOn : null,
        pressed && !selected ? { backgroundColor: color.surfaceSunk } : null,
        disabled ? { opacity: 0.45 } : null,
      ]}
    >
      {selected ? <Icon name="check" size={16} color={color.cobaltInk} /> : icon ? <Icon name={icon} size={16} color={color.inkSoft} /> : null}
      <Text variant="label" style={{ color: selected ? color.cobaltInk : color.inkSoft, fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

// ───────── Botones segmentados (Material 3) ─────────
type Option<T extends string> = { value: T; label: string; icon?: IconName };

export function Segmented<T extends string>({ options, value, onChange }: { options: Option<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={styles.segment} accessibilityRole="radiogroup">
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            onPress={() => onChange(o.value)}
            style={[styles.segItem, i > 0 && styles.segDivider, on && styles.segOn]}
          >
            {on ? <Icon name="check" size={18} color={color.cobaltInk} /> : o.icon ? <Icon name={o.icon} size={18} color={color.inkSoft} /> : null}
            <Text variant="label" style={{ color: on ? color.cobaltInk : color.inkSoft }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ───────── Interruptor con etiqueta ─────────
export function SwitchRow({ label, description, value, onChange, disabled }: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      accessibilityLabel={label}
      onPress={() => !disabled && onChange(!value)}
      style={styles.switchRow}
    >
      <View style={styles.flex}>
        <Text variant="subtitle">{label}</Text>
        {description ? <Text variant="bodySm" tone="muted">{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: color.lineStrong, true: color.cobalt }}
        thumbColor={color.surface}
        {...({ activeThumbColor: color.surface } as object)}
      />
    </Pressable>
  );
}

// ───────── Casilla de verificación ─────────
export function Checkbox({ checked, onChange, children, error }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode; error?: string | null }) {
  return (
    <View>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={() => onChange(!checked)} style={styles.checkRow}>
        <Icon name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'} size={26} color={checked ? color.cobalt : error ? color.bermellon : color.inkSoft} />
        <View style={styles.flex}>{children}</View>
      </Pressable>
      {error ? <Text variant="caption" tone="bermellon" style={{ marginLeft: 38 }}>{error}</Text> : null}
    </View>
  );
}

// ───────── Avatar ─────────
export function Avatar({ uri, nombre, apellido, size = 44 }: { uri?: string | null; nombre?: string | null; apellido?: string | null; size?: number }) {
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color.groundAlt }} accessibilityLabel={`Foto de ${nombre || 'usuario'}`} />;
  }
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} accessibilityLabel={`Iniciales de ${nombre || 'usuario'}`}>
      <Text style={{ fontFamily: font.sign, fontSize: size * 0.36, lineHeight: size * 0.44, color: color.cobaltInk }}>{initials(nombre, apellido)}</Text>
    </View>
  );
}

// ───────── Estado vacío ─────────
export function EmptyState({ icon, title, body, action }: { icon: IconName; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}><Icon name={icon} size={30} color={color.cobaltInk} /></View>
      <Text variant="title" align="center">{title}</Text>
      {body ? <Text variant="body" tone="muted" align="center" style={styles.emptyBody}>{body}</Text> : null}
      {action ? <View style={styles.emptyAction}>{action}</View> : null}
    </View>
  );
}

// ───────── Aviso en línea ─────────
type BannerTone = 'info' | 'warning' | 'error' | 'success';
const BANNER: Record<BannerTone, { bg: string; fg: string; icon: IconName }> = {
  info: { bg: color.cobaltSoft, fg: color.cobaltInk, icon: 'information-outline' },
  warning: { bg: color.chromeSoft, fg: color.chromeInk, icon: 'alert-outline' },
  error: { bg: color.bermellonSoft, fg: color.bermellonInk, icon: 'alert-circle-outline' },
  success: { bg: color.verdeSoft, fg: color.verdeInk, icon: 'check-circle-outline' },
};

export function Banner({ tone = 'info', title, body, action, style }: { tone?: BannerTone; title: string; body?: string; action?: React.ReactNode; style?: ViewStyle }) {
  const b = BANNER[tone];
  return (
    <View style={[styles.banner, { backgroundColor: b.bg }, style]} accessibilityRole="summary">
      <Icon name={b.icon} size={22} color={b.fg} />
      <View style={styles.flex}>
        <Text variant="subtitle" style={{ color: b.fg }}>{title}</Text>
        {body ? <Text variant="bodySm" style={{ color: b.fg }}>{body}</Text> : null}
        {action ? <View style={{ marginTop: space.sm }}>{action}</View> : null}
      </View>
    </View>
  );
}

// ───────── Estrellas ─────────
export function RatingStars({ value, onChange, size = 28, label = 'Calificación' }: { value: number; onChange?: (v: number) => void; size?: number; label?: string }) {
  return (
    <View style={styles.stars} accessibilityRole={onChange ? 'adjustable' : 'text'} accessibilityLabel={`${label}: ${value} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const icon = value >= n ? 'star' : value >= n - 0.5 ? 'star-half-full' : 'star-outline';
        const star = <Icon name={icon} size={size} color={value >= n - 0.5 ? color.chromeShade : color.lineStrong} />;
        if (!onChange) return <View key={n}>{star}</View>;
        return (
          <Pressable key={n} accessibilityRole="button" accessibilityLabel={`${n} estrella${n > 1 ? 's' : ''}`} onPress={() => onChange(n)} style={styles.starBtn}>
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 14, borderRadius: radius.sm,
    borderWidth: 1.5, borderColor: color.lineStrong, backgroundColor: color.surface,
  },
  chipOn: { backgroundColor: color.cobaltSoft, borderColor: color.cobaltSoft },
  segment: { flexDirection: 'row', borderWidth: 1.5, borderColor: color.lineStrong, borderRadius: radius.full, overflow: 'hidden' },
  segItem: { flex: 1, minHeight: touch.min, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: space.sm },
  segDivider: { borderLeftWidth: 1.5, borderLeftColor: color.lineStrong },
  segOn: { backgroundColor: color.cobaltSoft },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, minHeight: touch.min, paddingVertical: space.sm },
  switchRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  avatar: { backgroundColor: color.cobaltSoft, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: space.xxl, paddingHorizontal: space.xl },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: color.cobaltSoft, alignItems: 'center', justifyContent: 'center', marginBottom: space.lg },
  emptyBody: { marginTop: space.xs, maxWidth: 360 },
  emptyAction: { marginTop: space.lg },
  banner: { flexDirection: 'row', gap: space.md, padding: space.lg, borderRadius: radius.md },
  stars: { flexDirection: 'row', alignItems: 'center' },
  starBtn: { width: touch.min, height: touch.min, alignItems: 'center', justifyContent: 'center' },
});
