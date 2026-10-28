import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AppBar, Banner, Button, Checkbox, color, DateField, Screen, Segmented, space, Text, TextField,
} from '@/src/design';
import { DocCapture } from '@/src/features/auth/DocCapture';
import { IneCapture, type IneValue } from '@/src/features/ine/IneCapture';
import { PasswordChecklist } from '@/src/features/auth/PasswordChecklist';
import { authApi } from '@/src/api/endpoints';
import { ApiError, errorMessage } from '@/src/api/client';
import type { LocalFile } from '@/src/api/types';
import { isEmail, isPhoneMx, onlyDigits, passwordIssues } from '@/src/lib/validators';

type Rol = 'cliente' | 'tecnico';
const STEP_TITLES = ['Crear Cuenta', 'Tu contacto', 'Verifica tu identidad'];
const STEP_LEADS = [
  'Únete a la red de servicios en Lázaro Cárdenas',
  'Te avisaremos por aquí del avance de tus servicios.',
  'Para cuidar a clientes y técnicos verificamos que seas tú. Usa tu INE vigente y buena luz.',
];

function maxBirthDate() {
  const d = new Date();
  return `${d.getFullYear() - 18}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// RF-05/06/18/19/25: registro en tres pasos. El primero es la pantalla de la referencia
// ("Crear Cuenta"); los demás datos que piden los requisitos van en los pasos siguientes.
// Si viene de Google o Apple, nombre y correo llegan prellenados.
export default function Registro() {
  const router = useRouter();
  const pre = useLocalSearchParams<{ email?: string; nombre?: string; apellidos?: string }>();
  const [step, setStep] = useState(0);
  const [rol, setRol] = useState<Rol>('cliente');
  const [nombre, setNombre] = useState(pre.nombre || '');
  const [apellidos, setApellidos] = useState(pre.apellidos || '');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState(pre.email || '');
  const [fecha, setFecha] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [ineFrente, setIneFrente] = useState<IneValue | null>(null);
  const [ineReverso, setIneReverso] = useState<IneValue | null>(null);
  const [rostro, setRostro] = useState<LocalFile | null>(null);
  const [acepta, setAcepta] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const dirty = useMemo(() => !!(nombre || apellidos || telefono || email || password || ineFrente), [nombre, apellidos, telefono, email, password, ineFrente]);
  const clear = (k: string) => setErrors((e) => ({ ...e, [k]: undefined }));
  const registroIne = useMemo(() => ({ nombre: nombre.trim(), apellidos: apellidos.trim(), fecha_nacimiento: fecha || '' }), [nombre, apellidos, fecha]);

  // La verificación de la INE queda ligada al nombre y la fecha: si cambian, se vuelve a tomar.
  useEffect(() => {
    setIneFrente(null);
    setIneReverso(null);
  }, [registroIne]);

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (nombre.trim().length < 2) e.nombre = 'Escribe tu nombre.';
      if (apellidos.trim().length < 2) e.apellidos = 'Escribe tus apellidos.';
      if (!isEmail(email)) e.email = 'Escribe un correo válido, por ejemplo ana@correo.mx.';
      if (!fecha) e.fecha = 'Selecciona tu fecha de nacimiento.';
      else if (fecha > maxBirthDate()) e.fecha = 'Debes ser mayor de edad para usar Click & Serve.';
      if (passwordIssues(password).length) e.password = `A tu contraseña le falta: ${passwordIssues(password).join(', ')}.`;
    }
    if (s === 1) {
      if (!isPhoneMx(telefono)) e.telefono = 'El teléfono debe tener 10 dígitos.';
      if (confirm !== password) e.confirm = 'Las contraseñas no coinciden.';
    }
    if (s === 2) {
      if (!ineFrente || !ineReverso || !rostro) e.docs = 'Toma las tres fotos: tu credencial debe quedar verificada (frente y reverso) y tu rostro.';
      if (!acepta) e.acepta = 'Debes aceptar el aviso de privacidad y los términos.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep((s) => s + 1); };

  const submit = async () => {
    if (!validate(2) || !ineFrente || !ineReverso || !rostro || !fecha) return;
    setLoading(true);
    setServerError(null);
    try {
      await authApi.register(
        {
          nombre: nombre.trim(), apellidos: apellidos.trim(), telefono: onlyDigits(telefono), email: email.trim().toLowerCase(),
          fechaNacimiento: fecha, password, perfil: rol === 'tecnico' ? '2' : '1', acepta_privacidad: 'true',
          ticket_ine_frente: ineFrente.ticket, ticket_ine_reverso: ineReverso.ticket,
        },
        { ine_frente: ineFrente.file, ine_reverso: ineReverso.file, rostro }
      );
      // RF-06: la cuenta se crea y se pasa de inmediato a la verificación del correo.
      router.replace({ pathname: '/verificar', params: { email: email.trim().toLowerCase() } });
    } catch (e) {
      if (e instanceof ApiError && e.code === 'INE_NOT_VERIFIED') {
        setIneFrente(null);
        setIneReverso(null);
        setErrors({ docs: e.message });
      } else if (e instanceof ApiError && e.code === 'USER_EXISTS') {
        setServerError('Este correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña.');
      } else if (e instanceof ApiError && e.field) {
        const fieldStep: Record<string, number> = { nombre: 0, apellidos: 0, email: 0, fechaNacimiento: 0, password: 0, telefono: 1 };
        setStep(fieldStep[e.field] ?? 2);
        setErrors({ [e.field === 'fechaNacimiento' ? 'fecha' : e.field]: e.message });
      } else {
        setServerError(errorMessage(e));
      }
    } finally {
      setLoading(false);
    }
  };

  const footer = step === 0 ? (
    <Button title="Registrarme" variant="accent" iconRight="arrow-right" onPress={next} full size="lg" />
  ) : (
    <View style={styles.footer}>
      <Button title="Atrás" variant="outlined" onPress={() => setStep((s) => s - 1)} style={styles.flex} full size="lg" />
      {step < 2
        ? <Button title="Siguiente" iconRight="arrow-right" onPress={next} style={styles.flex} full size="lg" />
        : <Button title="Crear cuenta" variant="accent" onPress={submit} loading={loading} style={styles.flex} full size="lg" />}
    </View>
  );

  return (
    <Screen
      header={<AppBar title={`Paso ${step + 1} de 3`} confirmDiscard={dirty && step === 0} fallbackHref="/bienvenida" onBack={step > 0 ? () => setStep((s) => s - 1) : undefined} />}
      footer={footer}
    >
      <View style={styles.progress} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: 3, now: step + 1 }}>
        {[0, 1, 2].map((i) => <View key={i} style={[styles.bar, i <= step && styles.barOn]} />)}
      </View>

      <Text variant="display" accessibilityRole="header">{STEP_TITLES[step]}</Text>
      <Text variant="body" tone="muted" style={styles.lead}>{STEP_LEADS[step]}</Text>

      {serverError ? (
        <Banner tone="error" title="No pudimos crear tu cuenta" body={serverError} style={styles.banner}
          action={<Button title="Ir a iniciar sesión" variant="text" onPress={() => router.replace('/login')} />} />
      ) : null}

      {step === 0 ? (
        <>
          <View style={styles.row}>
            <View style={styles.flex}><TextField label="Nombre" icon="user" placeholder="Ej. Juan" value={nombre} onChangeText={(t) => { setNombre(t); clear('nombre'); }} error={errors.nombre} autoComplete="given-name" /></View>
            <View style={styles.flex}><TextField label="Apellidos" placeholder="Ej. Pérez" value={apellidos} onChangeText={(t) => { setApellidos(t); clear('apellidos'); }} error={errors.apellidos} autoComplete="family-name" /></View>
          </View>
          <TextField label="Email" icon="mail" placeholder="tu@email.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={(t) => { setEmail(t); clear('email'); }} error={errors.email} autoComplete="email" />
          <DateField label="Fecha de nacimiento" value={fecha} onChange={(v) => { setFecha(v); clear('fecha'); }} max={maxBirthDate()} min="1920-01-01" initialYear={1995} error={errors.fecha} helper="Debes ser mayor de 18 años." />
          <TextField label="Contraseña" icon="lock" placeholder="Crea una contraseña" password value={password} onChangeText={(t) => { setPassword(t); clear('password'); }} error={errors.password} autoComplete="new-password" />
          <PasswordChecklist value={password} />
          <Text variant="overline" style={styles.label}>Tipo de perfil</Text>
          <Segmented<Rol>
            value={rol}
            onChange={setRol}
            options={[{ value: 'cliente', label: 'Cliente' }, { value: 'tecnico', label: 'Técnico' }]}
          />
          <Text variant="bodySm" tone="muted" style={styles.roleHint}>
            {rol === 'cliente' ? 'Pide técnicos verificados para tu casa, negocio o auto.' : 'Recibe trabajos cercanos de tu especialidad y cobra en la app. Tu cuenta se revisa antes de aceptar trabajos.'}
          </Text>
        </>
      ) : null}

      {step === 1 ? (
        <>
          <TextField label="Teléfono celular" icon="phone" placeholder="10 dígitos" keyboardType="phone-pad" maxLength={14} value={telefono} onChangeText={(t) => { setTelefono(t); clear('telefono'); }} error={errors.telefono} autoComplete="tel" />
          <TextField label="Confirma tu contraseña" icon="lock" password value={confirm} onChangeText={(t) => { setConfirm(t); clear('confirm'); }} error={errors.confirm} autoComplete="new-password" />
        </>
      ) : null}

      {step === 2 ? (
        <>
          <IneCapture step={1} lado="frente" registro={registroIne} value={ineFrente} onChange={(v) => { setIneFrente(v); setIneReverso(null); clear('docs'); }} />
          <IneCapture step={2} lado="reverso" registro={registroIne} ticketFrente={ineFrente?.ticket} value={ineReverso} onChange={(v) => { setIneReverso(v); clear('docs'); }} disabled={!ineFrente} />
          <DocCapture step={3} title="Tu rostro" hint="De frente, sin lentes oscuros ni gorra." icon="smile" file={rostro} onChange={(f) => { setRostro(f); clear('docs'); }} front disabled={!ineReverso} />
          {errors.docs ? <Text variant="caption" tone="danger" style={styles.docsError}>{errors.docs}</Text> : null}
          <Checkbox checked={acepta} onChange={(v) => { setAcepta(v); clear('acepta'); }} error={errors.acepta}>
            <Text variant="bodySm" tone="soft">
              Acepto el{' '}
              <Text variant="bodySm" tone="accent" weight="700" onPress={() => router.push('/legal/privacidad')} accessibilityRole="link">aviso de privacidad</Text>
              {' '}y los{' '}
              <Text variant="bodySm" tone="accent" weight="700" onPress={() => router.push('/legal/terminos')} accessibilityRole="link">términos de uso</Text>.
              Mis datos e identificación se usan para verificar mi identidad y dar el servicio.
            </Text>
          </Checkbox>
        </>
      ) : null}

      <View style={styles.already}>
        <Text variant="bodySm" tone="muted">¿Ya tienes una cuenta?</Text>
        <Button title="Inicia sesión" variant="text" onPress={() => router.replace('/login')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: space.md },
  footer: { flexDirection: 'row', gap: space.sm },
  progress: { flexDirection: 'row', gap: space.xs, marginBottom: space.lg },
  bar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: color.line },
  barOn: { backgroundColor: color.accent },
  lead: { marginTop: space.xs, marginBottom: space.xl },
  banner: { marginBottom: space.lg },
  label: { marginBottom: space.sm, marginTop: space.sm },
  roleHint: { marginTop: space.sm },
  docsError: { marginTop: -space.xs, marginBottom: space.md },
  already: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: space.lg, flexWrap: 'wrap' },
});
