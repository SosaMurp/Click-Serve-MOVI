import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { color, radius, space } from './tokens';

// Marcadores de carga (RNF-10/28). Respetan "reducir movimiento": sin animación si está activo.
export function Skeleton({ height = 16, width = '100%', style }: { height?: number; width?: number | `${number}%`; style?: ViewStyle }) {
  const pulse = useRef(new Animated.Value(0.55)).current;
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.().then(setReduce).catch(() => {});
  }, []);

  useEffect(() => {
    if (reduce) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.55, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduce]);

  return <Animated.View accessibilityElementsHidden style={[styles.block, { height, width, opacity: reduce ? 0.8 : pulse }, style]} />;
}

export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <View accessibilityLabel="Cargando" accessibilityRole="progressbar" style={styles.list}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.card}>
          <Skeleton height={14} width="40%" />
          <Skeleton height={18} width="85%" />
          <Skeleton height={14} width="60%" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: color.groundAlt, borderRadius: radius.sm },
  list: { gap: space.md },
  card: { gap: space.sm, padding: space.lg, borderRadius: radius.lg, backgroundColor: color.surface },
});
