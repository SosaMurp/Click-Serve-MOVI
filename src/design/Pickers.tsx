import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { IconButton } from './Button';
import { Icon } from './Icon';
import { Sheet } from './Sheet';
import { Text } from './Text';
import { color, radius, space, touch } from './tokens';
import { formatDate, formatTime12, formatMoney } from '../lib/format';
import { toast } from '../ui/toast';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const WEEK = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const pad = (n: number) => String(n).padStart(2, '0');
const toIso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parseIso = (iso?: string | null) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
  return m ? { y: Number(m[1]), m: Number(m[2]) - 1, d: Number(m[3]) } : null;
};

// ───────── Campo de fecha con calendario (RF-19) ─────────
type DateFieldProps = { label: string; value: string | null; onChange: (iso: string) => void; min?: string; max?: string; error?: string | null; helper?: string; initialYear?: number };

export function DateField({ label, value, onChange, min, max, error, helper, initialYear }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text variant="overline" style={styles.fieldLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? formatDate(value) : 'sin seleccionar'}`}
        onPress={() => setOpen(true)}
        style={[styles.field, { borderColor: error ? color.danger : color.lineStrong, borderWidth: error ? 2 : 1 }]}
      >
        {/* Como en la referencia: dd/mm/aaaa con el calendario a la derecha (RF-19 abre el calendario). */}
        <Text variant="body" tone={value ? 'default' : 'muted'} style={styles.flex} tabular>{value ? value.split('-').reverse().join('/') : 'dd/mm/aaaa'}</Text>
        <Icon name="calendar" size={20} color={color.inkMuted} />
      </Pressable>
      <Text variant="caption" tone={error ? 'danger' : 'muted'} style={styles.fieldBelow}>{error || helper || ' '}</Text>
      <Sheet visible={open} onClose={() => setOpen(false)} title={label}>
        <Calendar value={value} min={min} max={max} initialYear={initialYear} onPick={(iso) => { onChange(iso); setOpen(false); }} />
      </Sheet>
    </View>
  );
}

export function Calendar({ value, min, max, onPick, initialYear }: { value: string | null; min?: string; max?: string; onPick: (iso: string) => void; initialYear?: number }) {
  const sel = parseIso(value);
  const today = new Date();
  const [cursor, setCursor] = useState(() => sel ? { y: sel.y, m: sel.m } : { y: initialYear ?? today.getFullYear(), m: initialYear ? 0 : today.getMonth() });
  const [yearMode, setYearMode] = useState(!sel && !!initialYear);
  const minY = parseIso(min)?.y ?? 1920;
  const maxY = parseIso(max)?.y ?? today.getFullYear() + 2;

  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const offset = (first.getDay() + 6) % 7;
    const days = new Date(cursor.y, cursor.m + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  }, [cursor]);

  const disabled = (d: number) => {
    const iso = toIso(cursor.y, cursor.m, d);
    return (min && iso < min) || (max && iso > max);
  };
  const shift = (delta: number) => setCursor(({ y, m }) => {
    const nm = m + delta;
    return { y: y + Math.floor(nm / 12), m: ((nm % 12) + 12) % 12 };
  });

  if (yearMode) {
    const years = [];
    for (let y = maxY; y >= minY; y -= 1) years.push(y);
    return (
      <View style={styles.years}>
        {years.map((y) => (
          <Pressable key={y} accessibilityRole="button" onPress={() => { setCursor((c) => ({ ...c, y })); setYearMode(false); }} style={[styles.year, y === cursor.y && styles.yearOn]}>
            <Text variant="label" style={{ color: color.ink }}>{y}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <View>
      <View style={styles.calHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel="Elegir año" onPress={() => setYearMode(true)} style={styles.monthBtn}>
          <Text variant="subtitle">{MONTHS[cursor.m]} {cursor.y}</Text>
          <Icon name="chevron-down" size={22} color={color.inkSoft} />
        </Pressable>
        <IconButton icon="chevron-left" label="Mes anterior" onPress={() => shift(-1)} />
        <IconButton icon="chevron-right" label="Mes siguiente" onPress={() => shift(1)} />
      </View>
      <View style={styles.grid}>
        {WEEK.map((w, i) => <Text key={`w${i}`} variant="caption" tone="muted" align="center" style={styles.weekCell}>{w}</Text>)}
        {cells.map((d, i) => {
          if (!d) return <View key={`e${i}`} style={styles.cell} />;
          const iso = toIso(cursor.y, cursor.m, d);
          const on = value === iso;
          const off = !!disabled(d);
          return (
            <Pressable
              key={iso}
              accessibilityRole="button"
              accessibilityLabel={formatDate(iso)}
              accessibilityState={{ selected: on, disabled: off }}
              disabled={off}
              onPress={() => onPick(iso)}
              style={[styles.cell, on && styles.cellOn]}
            >
              <Text variant="label" style={{ color: on ? color.ink : off ? color.lineStrong : color.ink }}>{d}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ───────── Campo de hora por franjas de 30 minutos ─────────
const SLOTS = Array.from({ length: 29 }, (_, i) => { const t = 7 * 60 + i * 30; return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`; });

export function TimeField({ label, value, onChange, error }: { label: string; value: string | null; onChange: (hhmm: string) => void; error?: string | null }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text variant="overline" style={styles.fieldLabel}>{label}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value ? formatTime12(value) : 'sin seleccionar'}`} onPress={() => setOpen(true)} style={[styles.field, { borderColor: error ? color.danger : color.lineStrong, borderWidth: error ? 2 : 1 }]}>
        <Icon name="clock" size={20} color={color.inkMuted} />
        <Text variant="body" tone={value ? 'default' : 'muted'} style={styles.flex}>{value ? formatTime12(value) : 'Selecciona una hora'}</Text>
        <Icon name="chevron-down" size={22} color={color.inkMuted} />
      </Pressable>
      <Text variant="caption" tone={error ? 'danger' : 'muted'} style={styles.fieldBelow}>{error || ' '}</Text>
      <Sheet visible={open} onClose={() => setOpen(false)} title={label}>
        <View style={styles.slots}>
          {SLOTS.map((s) => (
            <Pressable key={s} accessibilityRole="button" onPress={() => { onChange(s); setOpen(false); }} style={[styles.slot, value === s && styles.slotOn]}>
              <Text variant="label" style={{ color: color.ink }}>{formatTime12(s)}</Text>
            </Pressable>
          ))}
        </View>
      </Sheet>
    </View>
  );
}

// ───────── Folio visible y copiable ─────────
export function Folio({ value, label = 'Folio' }: { value: string; label?: string }) {
  const copy = async () => {
    await Clipboard.setStringAsync(value);
    toast.success(`${label} ${value} copiado`);
  };
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${label} ${value}. Copiar`} onPress={copy} style={styles.folio} hitSlop={8}>
      <Text variant="caption" tone="muted">{label}</Text>
      <Text variant="label" tabular selectable>{value}</Text>
      <Icon name="copy" size={14} color={color.inkMuted} />
    </Pressable>
  );
}

// ───────── Monto (formato del servidor, sin aritmética) ─────────
export function Money({ value, size = 'md', tone = 'default', suffix }: { value: string | number | null | undefined; size?: 'sm' | 'md' | 'lg' | 'xl'; tone?: 'default' | 'success' | 'brand' | 'onColor'; suffix?: boolean }) {
  const variant = size === 'xl' ? 'display' : size === 'lg' ? 'headline' : size === 'md' ? 'title' : 'label';
  return <Text variant={variant} tone={tone} tabular>{formatMoney(value, { currency: suffix })}</Text>;
}


const styles = StyleSheet.create({
  flex: { flex: 1 },
  fieldWrap: { marginBottom: space.md },
  fieldLabel: { marginBottom: space.sm },
  field: { minHeight: 54, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, backgroundColor: color.surface },
  fieldBelow: { marginTop: 4, minHeight: 18 },
  calHeader: { flexDirection: 'row', alignItems: 'center' },
  monthBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: touch.min },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekCell: { width: `${100 / 7}%`, paddingVertical: space.xs },
  cell: { width: `${100 / 7}%`, height: touch.min, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full },
  cellOn: { backgroundColor: color.accent },
  years: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, paddingBottom: space.md },
  year: { width: '22%', height: touch.min, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: color.surfaceSunk },
  yearOn: { backgroundColor: color.accent },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, paddingBottom: space.md },
  slot: { width: '31%', height: touch.min, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: color.surfaceSunk },
  slotOn: { backgroundColor: color.accent },
  folio: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 32, alignSelf: 'flex-start' },
});
