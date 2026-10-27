import React, { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppBar, Banner, Button, Chip, color, font, ListItem, Screen, Skeleton, space, Surface, Text } from '@/src/design';
import { ApiError, errorMessage } from '@/src/api/client';
import { billeteraApi } from '@/src/api/endpoints';
import { useLoader } from '@/src/lib/useLoader';
import { formatMoney, moneyPortion, parseMoneyInput } from '@/src/lib/format';
import { hapticSuccess } from '@/src/lib/media';
import { useOperationKey } from '@/src/lib/useOperationKey';
import { dialog } from '@/src/ui/dialog';
import { toast } from '@/src/ui/toast';

// RF-73/74/76: retirar saldo a la CLABE registrada, con confirmación e idempotencia.
export default function Retiro() {
  const router = useRouter();
  const { data: w, loading } = useLoader(() => billeteraApi.ver(), []);
  const key = useOperationKey();
  const [monto, setMonto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const saldo = Number(w?.saldo_actual || 0);
  const minimo = Number(w?.minimo_retiro || 0);
  const value = parseMoneyInput(monto);

  async function submit() {
    if (!w) return;
    if (!value) { setError('Escribe un monto válido.'); return; }
    if (Number(value) < minimo) { setError(`El retiro mínimo es de ${formatMoney(minimo)}.`); return; }
    if (Number(value) > saldo) { setError('El monto supera tu saldo disponible.'); return; }
    const ok = await dialog.confirm({ title: `¿Retirar ${formatMoney(value)}?`, message: `Se depositará en ${w.banco || 'tu cuenta'} ${w.clabe || ''}.`, confirmText: 'Retirar' });
    if (!ok) return;
    setSending(true);
    try {
      const r = await billeteraApi.retirar(value, key.get());
      key.reset();
      hapticSuccess();
      toast.success(r.mensaje);
      router.replace({ pathname: '/movimiento/[id]', params: { id: String(r.transaccion.id_transaccion) } });
    } catch (e) {
      if (e instanceof ApiError && ['MIN_WITHDRAWAL', 'INSUFFICIENT_FUNDS', 'VALIDATION_ERROR'].includes(e.code)) setError(e.message);
      else toast.error(errorMessage(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <Screen header={<AppBar title="Retirar saldo" fallbackHref="/billetera" />} footer={<Button title="Retirar" icon="arrow-up-right" onPress={submit} loading={sending} disabled={!value || !w?.tiene_clabe} full size="lg" />}>
      {loading ? <Skeleton height={200} /> : null}
      {w && !w.tiene_clabe ? <Banner tone="warning" title="Falta tu CLABE" body="Registra una cuenta a tu nombre para poder retirar." action={<Button title="Agregar CLABE" variant="text" onPress={() => router.replace('/cuenta-bancaria')} />} /> : null}
      {w ? (
        <>
          <Surface tint="sky" style={styles.amountCard}>
            <Text variant="label" tone="soft">¿Cuánto quieres retirar?</Text>
            <View style={styles.amountRow}>
              <Text style={styles.currency}>$</Text>
              <TextInput
                value={monto}
                onChangeText={(v) => { setMonto(v.replace(/[^\d.]/g, '')); setError(null); }}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={color.inkMuted}
                style={styles.amountInput}
                accessibilityLabel="Monto a retirar"
                autoFocus
              />
            </View>
            <Text variant="caption" tone={error ? 'danger' : 'muted'}>{error || `Disponible ${formatMoney(saldo)} · mínimo ${formatMoney(minimo)}`}</Text>
            <View style={styles.chips}>
              {([0.5, 1] as const).map((f) => <Chip key={f} label={f === 1 ? 'Todo' : 'La mitad'} onPress={() => { setMonto(moneyPortion(w?.saldo_actual, f)); setError(null); }} />)}
            </View>
          </Surface>
          {w.tiene_clabe ? (
            <Surface padded={false} style={styles.gap}>
              <ListItem icon="briefcase" iconTone="brand" title={w.banco || 'Cuenta CLABE'} subtitle={`Depósito a CLABE ${w.clabe}`} trailingText="Cambiar" onPress={() => router.push('/cuenta-bancaria')} />
            </Surface>
          ) : null}
          <Text variant="caption" tone="muted" style={styles.gap}>Verás el folio de transferencia en el comprobante del retiro.</Text>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { marginTop: space.md },
  amountCard: { gap: space.sm },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currency: { fontFamily: font.headingBold, fontSize: 40, color: color.ink, marginRight: 4 },
  amountInput: { flex: 1, fontFamily: font.headingBold, fontSize: 44, color: color.ink, minHeight: 64, outlineStyle: 'none' } as object,
  chips: { flexDirection: 'row', gap: space.sm, marginTop: space.xs },
});
