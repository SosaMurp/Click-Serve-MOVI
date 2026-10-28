import { Platform } from 'react-native';

// Inicio con Google y Apple: cada botón aparece solo si su credencial está configurada en el .env de la app.
// Google usa el ID de cliente OAuth de la plataforma; Apple solo existe en iOS y con EXPO_PUBLIC_APPLE_SIGNIN=1.
// (Las variables EXPO_PUBLIC_* se leen con notación de punto para que Expo las incruste al compilar.)
export function googleClientId(): string | undefined {
  const id = Platform.select({
    web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
  return id?.trim() || undefined;
}

export function socialConfig(): { google: boolean; apple: boolean } {
  return {
    google: !!googleClientId(),
    apple: Platform.OS === 'ios' && process.env.EXPO_PUBLIC_APPLE_SIGNIN === '1',
  };
}
