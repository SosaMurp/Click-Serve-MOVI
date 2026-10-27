import React from 'react';
import { StyleSheet, View } from 'react-native';
import { color, Icon, space, Text } from '../../design';
import { passwordIssues } from '../../lib/validators';

const RULES = ['8 caracteres', 'una mayúscula', 'una minúscula', 'un número'];

// Retroalimentación inmediata de la contraseña (RNF-29): cada regla con su estado y texto.
export function PasswordChecklist({ value }: { value: string }) {
  const missing = passwordIssues(value);
  return (
    <View style={styles.list} accessibilityLabel={missing.length ? `Falta: ${missing.join(', ')}` : 'Contraseña segura'}>
      {RULES.map((r) => {
        const ok = value.length > 0 && !missing.includes(r);
        return (
          <View key={r} style={styles.item}>
            <Icon name={ok ? 'check-circle' : 'circle'} size={16} color={ok ? color.success : color.inkMuted} />
            <Text variant="caption" tone={ok ? 'success' : 'muted'}>{r}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: -space.xs, marginBottom: space.md },
  item: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
