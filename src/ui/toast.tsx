import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from '../design/Icon';
import { Text } from '../design/Text';
import { color, radius, space } from '../design/tokens';

// Snackbar de Material para avisos transitorios (confirmaciones, errores recuperables).
type Tone = 'neutral' | 'success' | 'error' | 'warning';
type Toast = { id: number; message: string; tone: Tone; action?: { label: string; onPress: () => void } };

let push: ((t: Omit<Toast, 'id'>) => void) | null = null;
let counter = 0;

export const toast = {
  show(message: string, opts: { tone?: Tone; action?: Toast['action'] } = {}) {
    push?.({ message, tone: opts.tone || 'neutral', action: opts.action });
  },
  success(message: string) { push?.({ message, tone: 'success' }); },
  error(message: string) { push?.({ message, tone: 'error' }); },
  warning(message: string) { push?.({ message, tone: 'warning' }); },
};

const ICONS: Record<Tone, IconName> = { neutral: 'info', success: 'check-circle', error: 'alert-circle', warning: 'alert-triangle' };
const ICON_COLOR: Record<Tone, string> = { neutral: '#C9D3F5', success: '#8FE0AE', error: '#FFB0AA', warning: color.warning };

export function ToastHost() {
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState<Toast | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    push = (t) => {
      counter += 1;
      const next = { ...t, id: counter };
      setCurrent(next);
      AccessibilityInfo.announceForAccessibility?.(t.message);
    };
    return () => { push = null; };
  }, []);

  useEffect(() => {
    if (!current) return undefined;
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCurrent(null), current.action ? 6000 : 3800);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [current, anim]);

  if (!current) return null;
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + 88 }]}>
      <Animated.View
        accessibilityLiveRegion="polite"
        style={[styles.bar, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}
      >
        <Icon name={ICONS[current.tone]} size={20} color={ICON_COLOR[current.tone]} />
        <Text variant="bodySm" tone="onColor" style={styles.text}>{current.message}</Text>
        {current.action ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => { current.action?.onPress(); setCurrent(null); }}
            style={styles.action}
          >
            <Text variant="label" style={{ color: color.accent }}>{current.action.label}</Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: space.lg, right: space.lg, alignItems: 'center' },
  bar: {
    flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: color.navy, borderRadius: radius.full,
    paddingHorizontal: space.lg, paddingVertical: space.md, maxWidth: 560, width: '100%', minHeight: 48,
  },
  text: { flex: 1 },
  action: { minHeight: 40, justifyContent: 'center', paddingHorizontal: space.sm },
});
