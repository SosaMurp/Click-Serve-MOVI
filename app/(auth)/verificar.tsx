import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CodeScreen } from '@/src/features/auth/CodeScreen';
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
      heading="Revisa tu correo"
      body={`Escribe el código de 6 dígitos que enviamos a ${email || 'tu correo'}. Vence en 15 minutos.`}
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
