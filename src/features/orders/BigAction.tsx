import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { color, Icon, IconName, radius, space, Text } from '../../design';

type Props = { icon: IconName; title: string; subtitle?: string; badge?: string; onPress: () => void; highlight?: boolean };

// Acción grande del cliente (enfoque CILIM): ícono, texto de 20 px, explicación de 17 px y flecha.
// Todo el renglón se toca; mide al menos 88 dp de alto.
export function BigAction({ icon, title, subtitle, badge, onPress, highlight }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[title, subtitle, badge].filter(Boolean).join('. ')}
      onPress={onPress}
      style={({ pressed }) => [styles.card, highlight && styles.highlight, pressed && styles.pressed]}
    >
      <View style={[styles.icon, highlight && styles.iconHighlight]}>
        <Icon name={icon} size={26} color={color.inkOnColor} />
      </View>
      <View style={styles.texts}>
        <Text variant="title" style={styles.title}>{title}</Text>
        {subtitle ? <Text variant="bodyLg" tone="soft" style={styles.subtitle}>{subtitle}</Text> : null}
        {badge ? (
          <View style={styles.badge}>
            <Icon name="alert-circle" size={16} color={color.accentInk} />
            <Text variant="label" weight="700" tone="accent">{badge}</Text>
          </View>
        ) : null}
      </View>
      <Icon name="chevron-right" size={26} color={color.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: space.lg, padding: space.lg, borderRadius: radius.lg, borderWidth: 1.5, borderColor: color.lineStrong, backgroundColor: color.surface, marginBottom: space.md },
  highlight: { borderColor: color.accentStrong, borderWidth: 2 },
  pressed: { backgroundColor: color.surfaceSunk },
  icon: { width: 52, height: 52, borderRadius: 26, backgroundColor: color.navy, alignItems: 'center', justifyContent: 'center' },
  iconHighlight: { backgroundColor: color.accentStrong },
  texts: { flex: 1, gap: 2 },
  title: { fontSize: 20, lineHeight: 26 },
  subtitle: { fontSize: 17, lineHeight: 24 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: space.xs },
});
