import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { color, Icon, IconName, radius, space, Text } from '../../design';

type Props = { selected: boolean; title: string; body?: string; icon?: IconName; onPress: () => void; style?: ViewStyle; compact?: boolean };

// Opción grande de selección para el cliente (CILIM): texto de 18 px, borde visible y un círculo que
// se rellena al elegirla. El estado no depende solo del color: el círculo lleva palomita.
export function Choice({ selected, title, body, icon, onPress, style, compact }: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={body ? `${title}. ${body}` : title}
      onPress={onPress}
      style={({ pressed }) => [styles.card, compact && styles.compact, selected && styles.on, pressed && styles.pressed, style]}
    >
      {icon ? (
        <View style={[styles.icon, selected && styles.iconOn]}>
          <Icon name={icon} size={22} color={selected ? color.inkOnColor : color.ink} />
        </View>
      ) : null}
      <View style={styles.texts}>
        <Text variant="title" style={styles.title}>{title}</Text>
        {body ? <Text variant="body" tone="soft">{body}</Text> : null}
      </View>
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected ? <Icon name="check" size={16} color={color.inkOnColor} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: radius.lg, borderWidth: 1.5, borderColor: color.lineStrong, backgroundColor: color.surface },
  compact: { padding: space.md, minHeight: 64 },
  on: { borderColor: color.brand, borderWidth: 2, backgroundColor: color.groundAlt },
  pressed: { backgroundColor: color.surfaceSunk },
  icon: { width: 44, height: 44, borderRadius: 22, backgroundColor: color.groundAlt, alignItems: 'center', justifyContent: 'center' },
  iconOn: { backgroundColor: color.brand },
  texts: { flex: 1, gap: 2 },
  title: { fontSize: 18, lineHeight: 24 },
  radio: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: color.brand, borderColor: color.brand },
});
