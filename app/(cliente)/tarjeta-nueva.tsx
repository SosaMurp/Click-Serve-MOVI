import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { goBack } from '@/src/lib/nav';
import { AppBar, Banner, Button, color, radius, Screen, space, Text, TextField } from '@/src/design';
import { errorMessage } from '@/src/api/client';
import { pagosApi } from '@/src/api/endpoints';
import { cardBrand, formatCardNumber, isExpiryValid, luhn, onlyDigits } from '@/src/lib/validators';
import { isSandboxPayments, tokenizeCard } from '@/src/lib/tokenizer';
import { toast } from '@/src/ui/toast';

type Field = 'number' | 'name' | 'expiry' | 'cvc';

// RF-90/RNF-02: alta de tarjeta. Se tokeniza en el dispositivo y solo el token llega al backend.
export default function TarjetaNueva() {
  const router = useRouter();
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [saving, setSaving] = useState(false);
  const digits = onlyDigits(number);
  const brand = cardBrand(digits);

  const onExpiry = (v: string) => {
    const d = onlyDigits(v).slice(0, 4);
    setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
    setErrors((e) => ({ ...e, expiry: undefined }));
  };

  async function save() {
    const e: Partial<Record<Field, string>> = {};
    if (digits.length < 15 || !luhn(digits)) e.number = 'Revisa el número de la tarjeta.';
    if (name.trim().length < 3) e.name = 'Escribe el nombre como aparece en la tarjeta.';
    if (!isExpiryValid(expiry)) e.expiry = 'Fecha inválida o vencida (MM/AA).';
    if (!/^\d{3,4}$/.test(cvc)) e.cvc = 'El CVV tiene 3 o 4 dígitos.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      const tk = await tokenizeCard({ number: digits, name: name.trim(), expiry, cvc });
      await pagosApi.guardarTarjeta({ token: tk.token, marca: tk.marca, ultimos_4: tk.ultimos_4, expiracion: expiry, titular: name.trim() });
      setCvc('');
      toast.success(`Tarjeta •••• ${tk.ultimos_4} guardada.`);
      goBack(router);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen
      header={<AppBar title="Agregar tarjeta" confirmDiscard={!!(digits || name)} />}
      footer={<Button title="Guardar tarjeta" icon="lock" onPress={save} loading={saving} full size="lg" />}
    >
      <LinearGradient colors={[color.navy, color.navy]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <Text variant="title" tone="onColor">{brand || 'Tarjeta'}</Text>
        <Text variant="number" tone="onColor" tabular style={styles.num}>{formatCardNumber(digits) || '•••• •••• •••• ••••'}</Text>
        <View style={styles.cardRow}>
          <Text variant="label" tone="onColor" numberOfLines={1} style={styles.flex}>{name || 'NOMBRE DEL TITULAR'}</Text>
          <Text variant="label" tone="onColor" tabular>{expiry || 'MM/AA'}</Text>
        </View>
      </LinearGradient>

      {isSandboxPayments ? (
        <Banner tone="warning" title="Modo de prueba" body="Usa la tarjeta de prueba 4242 4242 4242 4242 con cualquier fecha futura y CVV. No se hace ningún cargo real." style={styles.gap} />
      ) : null}

      <View style={styles.gap}>
        <TextField
          label="Número de tarjeta"
          value={formatCardNumber(digits)}
          onChangeText={(v) => { setNumber(onlyDigits(v).slice(0, 16)); setErrors((x) => ({ ...x, number: undefined })); }}
          keyboardType="number-pad"
          autoComplete="cc-number"
          icon="credit-card"
          error={errors.number}
          maxLength={19}
        />
        <TextField label="Nombre del titular" value={name} onChangeText={(v) => { setName(v); setErrors((x) => ({ ...x, name: undefined })); }} autoCapitalize="characters" autoComplete="cc-name" error={errors.name} maxLength={60} />
        <View style={styles.row}>
          <View style={styles.flex}><TextField label="Vence (MM/AA)" value={expiry} onChangeText={onExpiry} keyboardType="number-pad" autoComplete="cc-exp" error={errors.expiry} maxLength={5} /></View>
          <View style={styles.flex}><TextField label="CVV" value={cvc} onChangeText={(v) => { setCvc(onlyDigits(v).slice(0, 4)); setErrors((x) => ({ ...x, cvc: undefined })); }} keyboardType="number-pad" password autoComplete="cc-csc" error={errors.cvc} maxLength={4} /></View>
        </View>
      </View>
      <Text variant="caption" tone="muted" align="center">El CVV nunca se guarda. La tarjeta se cifra antes de salir de tu teléfono.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { marginTop: space.lg },
  row: { flexDirection: 'row', gap: space.md },
  card: { borderRadius: radius.lg, padding: space.lg, minHeight: 180, justifyContent: 'space-between' },
  num: { letterSpacing: 1 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});
