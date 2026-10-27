import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { goBack } from '@/src/lib/nav';
import { AppBar, Banner, Button, color, Icon, Screen, space, Surface, Text, TextField } from '@/src/design';
import { ApiError, errorMessage } from '@/src/api/client';
import { billeteraApi } from '@/src/api/endpoints';
import { useLoader } from '@/src/lib/useLoader';
import { bankFromClabe, isValidClabe, onlyDigits } from '@/src/lib/validators';
import { hapticSuccess } from '@/src/lib/media';
import { toast } from '@/src/ui/toast';

const groups = (d: string) => d.replace(/(\d{3})(\d{3})(\d{0,11})(\d{0,1})/, (_, a, b, c, e) => [a, b, c, e].filter(Boolean).join(' '));

// RF-71/74: registrar la CLABE de 18 dígitos (validada con su dígito verificador) para los retiros.
export default function CuentaBancaria() {
  const router = useRouter();
  const { data: w } = useLoader(() => billeteraApi.ver(), []);
  const [clabe, setClabe] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const digits = onlyDigits(clabe).slice(0, 18);
  const banco = digits.length >= 3 ? bankFromClabe(digits) : null;
  const ok = digits.length === 18 && isValidClabe(digits);

  async function save() {
    if (!ok) { setError('La CLABE no es válida. Revisa los 18 dígitos.'); return; }
    setSaving(true);
    try {
      const r = await billeteraApi.guardarClabe(digits);
      hapticSuccess();
      toast.success(r.mensaje || 'Cuenta guardada.');
      goBack(router);
    } catch (e) {
      if (e instanceof ApiError && e.field) setError(e.message);
      else toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen header={<AppBar title="Cuenta bancaria" confirmDiscard={!!digits} />} footer={<Button title="Guardar nueva cuenta" icon="check" onPress={save} loading={saving} disabled={digits.length !== 18} full size="lg" />}>
      {w?.tiene_clabe ? (
        <Surface tint="sky" style={styles.gap}>
          <Text variant="caption" tone="muted">Cuenta actual</Text>
          <Text variant="title">{w.banco || 'Cuenta CLABE'}</Text>
          <Text variant="body" tabular>{w.clabe}</Text>
        </Surface>
      ) : <Banner tone="info" title="Sin cuenta registrada" body="Agrega una CLABE para recibir tus retiros." style={styles.gap} />}

      <TextField
        label="CLABE interbancaria (18 dígitos)"
        value={groups(digits)}
        onChangeText={(v) => { setClabe(onlyDigits(v)); setError(null); }}
        keyboardType="number-pad"
        icon="hash"
        maxLength={23}
        error={error || (digits.length === 18 && !ok ? 'El dígito verificador no coincide. Revisa la CLABE.' : null)}
        helper={`${digits.length}/18`}
      />
      {banco ? (
        <View style={styles.bank}>
          <Icon name={ok ? 'check-circle' : 'briefcase'} size={18} color={ok ? color.successInk : color.brandInk} />
          <Text variant="label" tone={ok ? 'success' : 'brand'}>{banco}{ok ? ' · CLABE válida' : ''}</Text>
        </View>
      ) : null}
      <Text variant="caption" tone="muted" style={styles.gap}>La cuenta debe estar a tu nombre; los depósitos a cuentas de terceros pueden rechazarse.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { marginBottom: space.md, marginTop: space.sm },
  bank: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
