import React from 'react';
import { StyleSheet, View } from 'react-native';
import { color, space, Text } from '../../design';
import { socialConfig } from './social';

type Props = {
  onGoogle: (idToken: string) => void;
  onApple: (r: { identityToken: string; nombre?: string; apellidos?: string }) => void;
  onError: (msg: string) => void;
  disabled?: boolean;
};

// Separador "o" y botones de Google/Apple. Sin credenciales configuradas no se muestra nada.
// Los módulos nativos se cargan solo si el botón está activo: las builds anteriores no los traen.
export function SocialButtons({ onGoogle, onApple, onError, disabled }: Props) {
  const cfg = socialConfig();
  if (!cfg.google && !cfg.apple) return null;
  /* eslint-disable @typescript-eslint/no-require-imports */
  const GoogleButton = cfg.google ? (require('./GoogleButton') as typeof import('./GoogleButton')).GoogleButton : null;
  const AppleButton = cfg.apple ? (require('./AppleButton') as typeof import('./AppleButton')).AppleButton : null;
  /* eslint-enable @typescript-eslint/no-require-imports */
  return (
    <View style={styles.wrap}>
      <View style={styles.or} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={styles.line} />
        <Text variant="bodySm" tone="muted">o</Text>
        <View style={styles.line} />
      </View>
      {GoogleButton ? <GoogleButton onToken={onGoogle} disabled={disabled} /> : null}
      {AppleButton ? <AppleButton onToken={onApple} onError={onError} disabled={disabled} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md, marginTop: space.lg },
  or: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  line: { flex: 1, height: 1, backgroundColor: color.line },
});
