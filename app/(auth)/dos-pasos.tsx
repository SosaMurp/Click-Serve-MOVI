import React, { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CodeScreen } from '@/src/features/auth/CodeScreen';
import { authApi } from '@/src/api/endpoints';
import { ApiError, errorMessage } from '@/src/api/client';
import { useSession } from '@/src/state/session';
import { dialog } from '@/src/ui/dialog';

// RNF-04: el reto vence a los 3 minutos y se destruye tras 3 intentos fallidos.
export default function DosPasos() {
  const { reto, metodo, correo } = useLocalSearchParams<{ reto: string; metodo: string; correo: string }>();
  const router = useRouter();
  const { signIn } = useSession();
  const expiresAt = useMemo(() => Date.now() + 3 * 60 * 1000, []);

  return (
    <CodeScreen
      title="Verificación en dos pasos"
      heading={metodo === 'EMAIL' ? 'Revisa tu correo' : 'Abre tu app autenticadora'}
      body={metodo === 'EMAIL'
        ? `Escribe el código de 6 dígitos que enviamos a ${correo || 'tu correo'}.`
        : 'Escribe el código de 6 dígitos que muestra tu app autenticadora para Click & Serve.'}
      expiresAt={expiresAt}
      onCode={async (code) => {
        try {
          const { token, usuario } = await authApi.verify2fa(String(reto), code);
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
