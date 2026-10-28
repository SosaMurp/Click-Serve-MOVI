import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Text } from './Text';
import { color, font, radius, space } from './tokens';

type Props = {
  length?: number;
  onComplete: (code: string) => void;
  onChange?: (code: string) => void;
  disabled?: boolean;
  error?: string | null;
  resetKey?: number;
};

// RNF-18: el código se verifica solo al teclear el último dígito y el foco avanza sin tocar nada.
// onChange deja que la pantalla habilite su botón VERIFICAR CÓDIGO con el código completo.
export function OtpField({ length = 6, onComplete, onChange: onCodeChange, disabled, error, resetKey }: Props) {
  const [code, setCode] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setCode('');
    onCodeChange?.('');
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const onChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, length);
    setCode(digits);
    onCodeChange?.(digits);
    if (digits.length === length) onComplete(digits);
  };

  return (
    <View>
      <Pressable onPress={() => inputRef.current?.focus()} accessible={false} style={styles.row}>
        {Array.from({ length }).map((_, i) => {
          const active = focused && i === Math.min(code.length, length - 1);
          return (
            <View
              key={i}
              style={[
                styles.cell,
                { borderColor: error ? color.danger : active ? color.accentStrong : code[i] ? color.ink : color.lineStrong, borderWidth: active || error ? 2 : 1 },
              ]}
            >
              <Text style={styles.digit} tabular>{code[i] || ''}</Text>
            </View>
          );
        })}
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={onChange}
          editable={!disabled}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete={Platform.OS === 'web' ? ('one-time-code' as never) : 'sms-otp'}
          maxLength={length}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={`Código de ${length} dígitos`}
          style={styles.hidden}
          caretHidden
        />
      </Pressable>
      {error ? <Text variant="caption" tone="danger" align="center" style={styles.error} accessibilityLiveRegion="polite">{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: space.sm },
  // Flexibles hasta 52 dp: seis cajas caben también en una pantalla de 320 px.
  cell: { flex: 1, maxWidth: 52, height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: color.surface },
  digit: { fontFamily: font.heading, fontSize: 24, lineHeight: 30, color: color.ink },
  hidden: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, opacity: 0.011, color: 'transparent', fontSize: 1 },
  error: { marginTop: space.sm },
});
