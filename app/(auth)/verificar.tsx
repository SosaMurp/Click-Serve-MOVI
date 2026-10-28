import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CodeScreen } from '@/src/features/auth/CodeScreen';
import { Text } from '@/src/design';
import { authApi } from '@/src/api/endpoints';
import { errorMessage } from '@/src/api/client';
import { useSession } from '@/src/state/session';
import { toast } from '@/src/ui/toast';
import { hapticSuccess } from '@/src/lib/media';

// RF-07/RF-08: el código se valida al teclear el último dígito y puede reenviarse.
export default function Verificar() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const { signIn } = useSession();

  return (
    <CodeScreen
      title="Verifica tu correo"
      body="Hemos enviado un código de 6 dígitos a"
      email={email || 'tu correo'}
      footerNote={<Text variant="caption" tone="muted" align="center" style={{ marginTop: 12 }}>El código vence en 15 minutos.</Text>}
      fallbackHref="/registro"
      backLabel="Volver al registro"
      onCode={async (code) => {
        try {
          const { token, usuario } = await authApi.verifyEmail(String(email), code);
          hapticSuccess();
          await signIn(token, usuario);
          toast.success(usuario.aprobado ? '¡Tu cuenta está lista!' : 'Cuenta creada. Revisaremos tus documentos.');
          router.replace('/');
          return null;
        } catch (e) {
          return errorMessage(e);
        }
      }}
      onResend={async () => {
        await authApi.resendCode(String(email));
        toast.show('Te enviamos un código nuevo.');
      }}
    />
  );
}
