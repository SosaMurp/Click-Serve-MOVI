import React from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import Svg, { Path } from 'react-native-svg';
import { SocialButton } from './SocialButton';

type AppleResult = { identityToken: string; nombre?: string; apellidos?: string };

// Solo iOS. Apple manda el nombre únicamente la primera vez: se reenvía al servidor para prellenar el registro.
export function AppleButton({ onToken, onError, disabled }: { onToken: (r: AppleResult) => void; onError: (msg: string) => void; disabled?: boolean }) {
  const signIn = async () => {
    try {
      const cred = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });
      if (!cred.identityToken) return onError('Apple no envió tu identificación. Intenta de nuevo.');
      onToken({ identityToken: cred.identityToken, nombre: cred.fullName?.givenName || undefined, apellidos: cred.fullName?.familyName || undefined });
    } catch (e) {
      if ((e as { code?: string })?.code !== 'ERR_REQUEST_CANCELED') onError('No pudimos iniciar sesión con Apple. Intenta de nuevo.');
    }
  };
  return (
    <SocialButton
      label="Continuar con Apple"
      disabled={disabled}
      onPress={signIn}
      icon={(
        <Svg width={18} height={20} viewBox="0 0 17 20">
          <Path fill="#000000" d="M14.1 10.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9C3.6 4.8 2 5.8 1 7.4c-1.9 3.3-.5 8.2 1.4 10.9.9 1.3 2 2.8 3.4 2.7 1.4-.1 1.9-.9 3.5-.9s2.1.9 3.5.8c1.4 0 2.4-1.3 3.3-2.7 1-1.5 1.5-3 1.5-3.1-.1 0-2.9-1.1-3-4.5zM11.5 2.9c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.2 1.1.1 2.3-.6 3-1.5z" />
        </Svg>
      )}
    />
  );
}
