import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from './Icon';
import { Text } from './Text';
import { color, radius, space } from './tokens';

export type TabMeta = Record<string, { icon: IconName; iconActive: IconName; label: string }>;

// Subconjunto de las props que expo-router entrega a tabBar (evita depender de una ruta interna).
export type TabBarProps = {
  state: { index: number; routes: { key: string; name: string; params?: object }[] };
  descriptors: Record<string, { options: { tabBarBadge?: string | number } }>;
  navigation: { emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean }; navigate: (name: string, params?: object) => void };
};

// Barra de navegación inferior de Material 3: indicador en píldora y etiqueta siempre visible.
export function makeNavigationBar(meta: TabMeta) {
  return function NavigationBar({ state, descriptors, navigation }: TabBarProps) {
    const insets = useSafeAreaInsets();
    return (
      <View style={[styles.bar, { paddingBottom: insets.bottom }]} accessibilityRole="tablist">
        <View style={styles.inner}>
          {state.routes.map((route, index) => {
            const m = meta[route.name];
            if (!m) return null;
            const focused = state.index === index;
            const badge = descriptors[route.key]?.options.tabBarBadge;
            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
            };
            return (
              <Pressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={badge ? `${m.label}, ${badge} pendientes` : m.label}
                onPress={onPress}
                style={styles.item}
              >
                <View style={[styles.pill, focused && styles.pillOn]}>
                  <Icon name={focused ? m.iconActive : m.icon} size={24} color={focused ? color.cobaltInk : color.inkSoft} />
                  {badge ? (
                    <View style={styles.badge}>
                      <Text variant="caption" tone="onColor" style={styles.badgeText}>{String(badge)}</Text>
                    </View>
                  ) : null}
                </View>
                <Text variant="caption" style={{ color: focused ? color.ink : color.inkSoft, fontWeight: focused ? '700' : '500' }}>{m.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };
}

const styles = StyleSheet.create({
  bar: { backgroundColor: color.surface, borderTopWidth: 1, borderTopColor: color.line, alignItems: 'center' },
  inner: { flexDirection: 'row', width: '100%', maxWidth: 640, height: 72 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  pill: { width: 64, height: 32, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  pillOn: { backgroundColor: color.cobaltSoft },
  badge: {
    position: 'absolute', top: -2, right: 10, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: color.bermellon,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xs,
  },
  badgeText: { fontSize: 10, lineHeight: 12, fontWeight: '700' },
});
