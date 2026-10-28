import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { color, radius, space, Text } from '../../design';

// Botón blanco con borde para "Continuar con Google / Apple" (logo del proveedor + texto).
export function SocialButton({ label, icon, onPress, disabled }: { label: string; icon: React.ReactNode; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed, disabled && styles.off]}
    >
      {icon}
      <Text variant="subtitle">{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { minHeight: 52, borderRadius: radius.md, borderWidth: 1, borderColor: color.lineStrong, backgroundColor: color.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.md, paddingHorizontal: space.lg },
  pressed: { backgroundColor: color.surfaceSunk },
  off: { opacity: 0.5 },
});
