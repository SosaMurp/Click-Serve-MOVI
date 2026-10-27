import React, { forwardRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Icon, IconName } from './Icon';
import { Text } from './Text';
import { color, radius, space } from './tokens';

type Props = TextInputProps & {
  label: string;
  helper?: string;
  error?: string | null;
  icon?: IconName;
  password?: boolean;
  right?: React.ReactNode;
  counter?: boolean;
};

// Campo de texto con etiqueta visible, ayuda, error y conteo; el error nombra el problema y cómo corregirlo.
export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, helper, error, icon, password, right, counter, multiline, maxLength, value, style, onFocus, onBlur, ...rest },
  ref
) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const borderColor = error ? color.bermellon : focused ? color.cobalt : color.lineStrong;

  return (
    <View style={styles.wrap}>
      <Text variant="label" tone="soft" style={styles.label} nativeID={`lbl-${label}`}>{label}</Text>
      <View style={[styles.box, { borderColor, borderWidth: focused || error ? 2 : 1.5 }, multiline && styles.multiline]}>
        {icon ? <Icon name={icon} size={20} color={focused ? color.cobalt : color.inkMuted} /> : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          aria-labelledby={`lbl-${label}`}
          placeholderTextColor={color.inkMuted}
          selectionColor={color.cobalt}
          secureTextEntry={password && !visible}
          multiline={multiline}
          maxLength={maxLength}
          value={value}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          style={[styles.input, multiline && styles.inputMultiline, Platform.OS === 'web' && styles.webInput, style]}
          {...rest}
        />
        {password ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onPress={() => setVisible((v) => !v)}
            hitSlop={8}
            style={styles.eye}
          >
            <Icon name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color={color.inkMuted} />
          </Pressable>
        ) : null}
        {right}
      </View>
      <View style={styles.below}>
        {error ? (
          <Text variant="caption" tone="bermellon" style={styles.flex} accessibilityLiveRegion="polite">{error}</Text>
        ) : helper ? (
          <Text variant="caption" tone="muted" style={styles.flex}>{helper}</Text>
        ) : <View style={styles.flex} />}
        {counter && maxLength ? <Text variant="caption" tone="muted" tabular>{String(value || '').length}/{maxLength}</Text> : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { marginBottom: space.md },
  label: { marginBottom: space.xs },
  box: { minHeight: 52, borderRadius: radius.sm, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.md, gap: space.sm, backgroundColor: color.surface },
  multiline: { alignItems: 'flex-start', paddingVertical: space.sm },
  input: { flex: 1, fontSize: 16, color: color.ink, minHeight: 48 },
  inputMultiline: { minHeight: 96, textAlignVertical: 'top', paddingTop: space.sm },
  webInput: { outlineStyle: 'none' } as object,
  eye: { minWidth: 40, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  below: { flexDirection: 'row', minHeight: 18, marginTop: 4, gap: space.sm },
  flex: { flex: 1 },
});
