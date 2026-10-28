import React, { useState } from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Icon, IconName } from './Icon';
import { Text } from './Text';
import { color, radius, space } from './tokens';

// Segundo nivel (enfoque CILIM): lo avanzado queda detrás de un botón grande con texto
// ("Más opciones", "Ver detalles") que se abre en el mismo lugar, sin cambiar de pantalla.
export function Collapsible({ title, icon = 'more-horizontal', children, style, initiallyOpen = false }: { title: string; icon?: IconName; children: React.ReactNode; style?: ViewStyle; initiallyOpen?: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <View style={style}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={title}
        onPress={() => setOpen((v) => !v)}
        style={({ pressed }) => [styles.head, pressed && styles.pressed]}
      >
        <Icon name={icon} size={22} color={color.ink} />
        <Text variant="title" style={styles.flex}>{title}</Text>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={24} color={color.ink} />
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, borderRadius: radius.lg, borderWidth: 1.5, borderColor: color.lineStrong, backgroundColor: color.surface },
  pressed: { backgroundColor: color.surfaceSunk },
  body: { marginTop: space.md, gap: space.md },
});
