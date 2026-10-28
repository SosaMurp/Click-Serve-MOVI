import React, { useMemo, useState } from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { CodeScreen } from '@/src/features/auth/CodeScreen';
import { authApi } from '@/src/api/endpoints';
import { ApiError, errorMessage } from '@/src/api/client';
import { useSession } from '@/src/state/session';
import { dialog } from '@/src/ui/dialog';
import { clearHandoff, peekHandoff } from '@/src/features/auth/handoff';

// RNF-04: el reto vence a los 3 minutos y se destruye tras 3 intentos fallidos.
export default function DosPasos() {
  const { metodo, correo } = useLocalSearchParams<{ metodo: string; correo: string }>();
  const [reto] = useState(() => peekHandoff('reto_2fa'));
  const router = useRouter();
  const { signIn } = useSession();
  const expiresAt = useMemo(() => Date.now() + 3 * 60 * 1000, []);

  // Sin reto en memoria (página recargada o enlace directo) se vuelve a iniciar sesión.
  if (!reto) return <Redirect href="/login" />;

  return (
    <CodeScreen
      title="Verificación en dos pasos"
      icon={metodo === 'EMAIL' ? 'mail' : 'shield'}
      body={metodo === 'EMAIL'
        ? 'Escribe el código de 6 dígitos que enviamos a'
        : 'Escribe el código de 6 dígitos que muestra tu app autenticadora para Click & Serve.'}
      email={metodo === 'EMAIL' ? correo || 'tu correo' : undefined}
      backLabel="Volver al inicio de sesión"
      expiresAt={expiresAt}
      onCode={async (code) => {
        try {
          const { token, usuario } = await authApi.verify2fa(reto, code);
          clearHandoff('reto_2fa');
          await signIn(token, usuario);
          router.replace('/');
          return null;
        } catch (e) {
          if (e instanceof ApiError && (e.code === 'TWO_FA_LOCKED' || e.code === 'TWO_FA_CHALLENGE_REQUIRED')) {
            await dialog.alert('Verificación cancelada', e.message);
            router.replace('/login');
            return null;
          }
          return errorMessage(e);
        }
      }}
    />
  );
}
