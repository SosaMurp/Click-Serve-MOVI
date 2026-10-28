import React from 'react';
import { Image, Pressable, StyleSheet, Switch, View, ViewStyle } from 'react-native';
import { Icon, IconName } from './Icon';
import { Text } from './Text';
import { color, elevation, font, radius, space, touch } from './tokens';
import { initials } from '../lib/format';

// ───────── Chip: blanco con borde; el seleccionado se rellena de marino ─────────
type ChipProps = { label: string; selected?: boolean; onPress?: () => void; icon?: IconName; disabled?: boolean };

export function Chip({ label, selected, onPress, icon, disabled }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [styles.chip, selected ? styles.chipOn : null, pressed && !selected ? { backgroundColor: color.surfaceSunk } : null, disabled ? { opacity: 0.45 } : null]}
    >
      {icon ? <Icon name={icon} size={15} color={selected ? color.inkOnColor : color.inkSoft} /> : null}
      <Text variant="label" style={{ color: selected ? color.inkOnColor : color.inkSoft, fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

// ───────── Botones segmentados (TIPO DE PERFIL: CLIENTE / TÉCNICO): el elegido relleno de marino ─────────
type Option<T extends string> = { value: T; label: string; icon?: IconName; count?: number };

export function Segmented<T extends string>({ options, value, onChange }: { options: Option<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={styles.segment} accessibilityRole="radiogroup">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => onChange(o.value)} style={[styles.segItem, on && styles.segOn]}>
            {o.icon ? <Icon name={o.icon} size={16} color={on ? color.inkOnColor : color.ink} /> : null}
            <Text variant="button" style={{ color: on ? color.inkOnColor : color.ink, fontSize: 14 }} numberOfLines={1}>
              {o.label}{o.count !== undefined ? ` ${o.count}` : ''}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ───────── Pestañas de texto (NUEVAS (1) / EN CURSO / HISTORIAL) con subrayado naranja en la activa ─────────
export function Tabs<T extends string>({ options, value, onChange }: { options: Option<T>[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => onChange(o.value)} style={styles.tab}>
            <Text variant="overline" style={{ color: on ? color.ink : color.inkMuted, fontSize: 13 }} numberOfLines={1}>
              {o.label}{o.count !== undefined ? ` (${o.count})` : ''}
            </Text>
            <View style={[styles.tabLine, on && styles.tabLineOn]} />
          </Pressable>
        );
      })}
    </View>
  );
}

// ───────── Interruptor con etiqueta ─────────
export function SwitchRow({ label, description, value, onChange, disabled }: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: value, disabled: !!disabled }} accessibilityLabel={label} onPress={() => !disabled && onChange(!value)} style={styles.switchRow}>
      <View style={styles.flex}>
        <Text variant="subtitle">{label}</Text>
        {description ? <Text variant="bodySm" tone="muted">{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ false: color.lineStrong, true: color.brand }}
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
        <View style={[styles.box, checked && styles.boxOn, error && !checked ? { borderColor: color.danger } : null]}>
          {checked ? <Icon name="check" size={16} color={color.inkOnColor} /> : null}
        </View>
        <View style={styles.flex}>{children}</View>
      </Pressable>
      {error ? <Text variant="caption" tone="danger" style={{ marginLeft: 36 }}>{error}</Text> : null}
    </View>
  );
}

// ───────── Avatar circular ─────────
export function Avatar({ uri, nombre, apellido, size = 44, ring }: { uri?: string | null; nombre?: string | null; apellido?: string | null; size?: number; ring?: boolean }) {
  const ringStyle = ring ? { borderWidth: 4, borderColor: color.surface } : null;
  if (uri) {
    return <Image source={{ uri }} style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: color.groundAlt }, ringStyle]} accessibilityLabel={`Foto de ${nombre || 'usuario'}`} />;
  }
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }, ringStyle]} accessibilityLabel={`Iniciales de ${nombre || 'usuario'}`}>
      <Text style={{ fontFamily: font.heading, fontSize: size * 0.38, lineHeight: size * 0.46, color: color.brandInk }}>{initials(nombre, apellido)}</Text>
    </View>
  );
}

// ───────── Estado vacío ─────────
export function EmptyState({ icon, title, body, action }: { icon: IconName; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}><Icon name={icon} size={28} color={color.brandInk} /></View>
      <Text variant="title" align="center">{title}</Text>
      {body ? <Text variant="body" tone="muted" align="center" style={styles.emptyBody}>{body}</Text> : null}
      {action ? <View style={styles.emptyAction}>{action}</View> : null}
    </View>
  );
}

// ───────── Aviso en línea (tarjeta pastel) ─────────
type BannerTone = 'info' | 'warning' | 'error' | 'success';
const BANNER: Record<BannerTone, { bg: string; fg: string; icon: IconName }> = {
  info: { bg: color.brandSoft, fg: color.brandInk, icon: 'info' },
  warning: { bg: color.warningSoft, fg: color.warningInk, icon: 'alert-triangle' },
  error: { bg: color.dangerSoft, fg: color.dangerInk, icon: 'alert-circle' },
  success: { bg: color.successSoft, fg: color.successInk, icon: 'check-circle' },
};

export function Banner({ tone = 'info', title, body, action, style }: { tone?: BannerTone; title: string; body?: string; action?: React.ReactNode; style?: ViewStyle }) {
  const b = BANNER[tone];
  return (
    <View style={[styles.banner, { backgroundColor: b.bg }, style]} accessibilityRole="summary">
      <Icon name={b.icon} size={20} color={b.fg} />
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
        const on = value >= n - 0.25;
        const star = <Icon name="star" size={size} color={on ? color.warning : color.lineStrong} />;
        if (!onChange) return <View key={n}>{star}</View>;
        return (
          <Pressable key={n} accessibilityRole="button" accessibilityLabel={`${n} estrella${n > 1 ? 's' : ''}`} accessibilityState={{ selected: value === n }} onPress={() => onChange(n)} style={styles.starBtn}>
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}

// ───────── Cajita de métrica blanca (dentro de bloques pastel) ─────────
export function MetricBox({ value, label, tone = 'default' }: { value: string | number; label: string; tone?: 'default' | 'brand' }) {
  return (
    <View style={styles.metric} accessibilityLabel={`${label}: ${value}`}>
      <Text variant="number" tone={tone === 'brand' ? 'brand' : 'default'} tabular numberOfLines={1} adjustsFontSizeToFit>{String(value)}</Text>
      <Text variant="caption" tone="muted" numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 14, borderRadius: radius.sm, backgroundColor: color.surface, borderWidth: 1, borderColor: color.lineStrong },
  chipOn: { backgroundColor: color.brand, borderColor: color.brand },
  segment: { flexDirection: 'row', gap: space.sm },
  segItem: { flex: 1, minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: space.sm, borderRadius: radius.md, borderWidth: 1, borderColor: color.lineStrong, backgroundColor: color.surface },
  segOn: { backgroundColor: color.brand, borderColor: color.brand },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: color.line },
  tab: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'flex-end', gap: 10 },
  tabLine: { alignSelf: 'stretch', height: 3, borderTopLeftRadius: 2, borderTopRightRadius: 2, backgroundColor: 'transparent' },
  tabLineOn: { backgroundColor: color.accent },
  switchRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md, minHeight: touch.min, paddingVertical: space.sm },
  box: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  boxOn: { backgroundColor: color.brand, borderColor: color.brand },
  avatar: { backgroundColor: color.brandSoft, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: space.xxl, paddingHorizontal: space.xl },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: color.brandSoft, alignItems: 'center', justifyContent: 'center', marginBottom: space.lg },
  emptyBody: { marginTop: space.xs, maxWidth: 360 },
  emptyAction: { marginTop: space.lg },
  banner: { flexDirection: 'row', gap: space.md, padding: space.lg, borderRadius: radius.md },
  stars: { flexDirection: 'row', alignItems: 'center' },
  starBtn: { width: touch.min, height: touch.min, alignItems: 'center', justifyContent: 'center' },
  metric: { flex: 1, backgroundColor: color.surface, borderRadius: radius.md, paddingVertical: space.md, paddingHorizontal: space.sm, alignItems: 'center' },
});
