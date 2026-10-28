import React, { useEffect, useMemo } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import Svg, { Path } from 'react-native-svg';
import { SocialButton } from './SocialButton';
import { googleClientId } from './social';

// En web cierra la ventana emergente de Google al volver.
WebBrowser.maybeCompleteAuthSession();

// Google con OpenID Connect: se pide un id_token (con nonce) y el servidor lo valida.
// Para la app instalada Expo recomienda @react-native-google-signin (requiere una build nueva).
export function GoogleButton({ onToken, disabled }: { onToken: (idToken: string) => void; disabled?: boolean }) {
  const discovery = AuthSession.useAutoDiscovery('https://accounts.google.com');
  const nonce = useMemo(() => Crypto.randomUUID(), []);
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: googleClientId() || '',
      redirectUri: AuthSession.makeRedirectUri({ scheme: 'click-serve' }),
      responseType: AuthSession.ResponseType.IdToken,
      scopes: ['openid', 'email', 'profile'],
      usePKCE: false,
      extraParams: { nonce },
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success' && response.params.id_token) onToken(response.params.id_token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  return (
    <SocialButton
      label="Continuar con Google"
      disabled={disabled || !request}
      onPress={() => promptAsync()}
      icon={(
        <Svg width={20} height={20} viewBox="0 0 48 48">
          <Path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <Path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <Path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <Path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </Svg>
      )}
    />
  );
}
