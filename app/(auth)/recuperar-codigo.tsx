import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CodeScreen } from '@/src/features/auth/CodeScreen';
import { authApi } from '@/src/api/endpoints';
import { errorMessage } from '@/src/api/client';
import { toast } from '@/src/ui/toast';
import { handOff } from '@/src/features/auth/handoff';

export default function RecuperarCodigo() {
  const { email, canal } = useLocalSearchParams<{ email: string; canal: 'EMAIL' | 'SMS' }>();
  const router = useRouter();
  const via = canal === 'SMS' ? 'por SMS a tu celular registrado' : `a ${email}`;

  return (
    <CodeScreen
      title="Código de recuperación"
      icon="key"
      body={`Si la cuenta existe, enviamos un código de 6 dígitos ${via}.`}
      fallbackHref="/recuperar"
      backLabel="Volver"
      onCode={async (code) => {
        try {
          const { reset_token } = await authApi.verifyRecovery(String(email), code);
          handOff('reset_token', reset_token);
          router.replace({ pathname: '/nueva-contrasena', params: { email: String(email) } });
          return null;
        } catch (e) {
          return errorMessage(e);
        }
      }}
      onResend={async () => {
        await authApi.requestRecovery(String(email), canal === 'SMS' ? 'SMS' : 'EMAIL');
        toast.show('Enviamos un código nuevo.');
      }}
    />
  );
}
