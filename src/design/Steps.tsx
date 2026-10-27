import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon } from './Icon';
import { Text } from './Text';
import { color, space } from './tokens';

export type Step = { key: string; label: string; detail?: string };

// Avance de una orden: línea continua para lo hecho, punteada para lo pendiente.
// El estado no depende solo del color: cada punto lleva forma (palomita, anillo, hueco) y texto.
export function Steps({ steps, current, stopped }: { steps: Step[]; current: number; stopped?: boolean }) {
  return (
    <View accessibilityRole="list">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === steps.length - 1;
        return (
          <View key={s.key} style={styles.row} accessibilityRole="text" accessibilityLabel={`${s.label}: ${done ? 'completado' : active ? (stopped ? 'detenido' : 'en curso') : 'pendiente'}`}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  done && styles.dotDone,
                  active && (stopped ? styles.dotStopped : styles.dotActive),
                ]}
              >
                {done ? <Icon name="check" size={14} color={color.inkOnColor} /> : null}
                {active && stopped ? <Icon name="pause" size={12} color={color.inkOnColor} /> : null}
              </View>
              {!last ? (
                done ? <View style={styles.lineDone} /> : (
                  <View style={styles.dashed}>
                    {[0, 1, 2, 3].map((d) => <View key={d} style={styles.dash} />)}
                  </View>
                )
              ) : null}
            </View>
            <View style={[styles.texts, !last && styles.textsGap]}>
              <Text variant={active ? 'subtitle' : 'bodySm'} tone={active ? 'default' : done ? 'soft' : 'muted'}>{s.label}</Text>
              {s.detail ? <Text variant="caption" tone="muted">{s.detail}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const DOT = 22;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.md },
  rail: { alignItems: 'center', width: DOT },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2, borderWidth: 2, borderColor: color.lineStrong, backgroundColor: color.surface, alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: color.brand, borderColor: color.brand },
  dotActive: { borderColor: color.accent, borderWidth: 6 },
  dotStopped: { backgroundColor: color.danger, borderColor: color.danger },
  lineDone: { width: 2, flex: 1, minHeight: 18, backgroundColor: color.brand },
  dashed: { flex: 1, minHeight: 18, justifyContent: 'space-evenly', paddingVertical: 2 },
  dash: { width: 2, height: 4, backgroundColor: color.lineStrong },
  texts: { flex: 1, paddingTop: 1 },
  textsGap: { paddingBottom: space.lg },
});
