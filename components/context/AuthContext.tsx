import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { Platform } from 'react-native';

export const BASE_URL = 
  process.env.EXPO_PUBLIC_API_URL || 
  (Platform.OS === 'web' && typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'http://localhost:3000'
    : 'http://192.168.8.203:3000');

type RequestOptions = {
  headers?: Record<string, string>;
  body?: any;
};

// Cliente API ultraligero usando fetch nativo en lugar de axios
async function customFetch(endpoint: string, method: string = 'GET', options: RequestOptions = {}) {
  const token = await AsyncStorage.getItem('@user_token');
  const isMultipart = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  if (isMultipart) delete headers['Content-Type'];

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: options.body ? (isMultipart ? options.body : JSON.stringify(options.body)) : undefined,
    });

    const contentType = response.headers.get('content-type');
    let data: any = null;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const isAuthEndpoint = endpoint.includes('/api/login') || endpoint.includes('/api/login-admin') || endpoint.includes('/api/logout');
      if (response.status === 401 && !isAuthEndpoint) {
        console.log('Error 401 detectado globalmente. Limpiando sesión...');
        await AsyncStorage.removeItem('@user_data');
        await AsyncStorage.removeItem('@user_token');
      }
      const errorObj: any = new Error(typeof data === 'object' && data?.error ? data.error : `Error HTTP ${response.status}`);
      errorObj.response = { status: response.status, data };
      throw errorObj;
    }

    return { data, status: response.status };
  } catch (error: any) {
    if (!error.response && !endpoint.includes('/api/logout')) {
      Alert.alert(
        'Servicio no disponible',
        'No se pudo establecer conexión con el servidor. Por favor, verifica tu red o intenta más tarde.'
      );
    }
    throw error;
  }
}

export const api = {
  get: (endpoint: string, options?: RequestOptions) => customFetch(endpoint, 'GET', options),
  post: (endpoint: string, body?: any, options?: RequestOptions) => customFetch(endpoint, 'POST', { ...options, body }),
  put: (endpoint: string, body?: any, options?: RequestOptions) => customFetch(endpoint, 'PUT', { ...options, body }),
  patch: (endpoint: string, body?: any, options?: RequestOptions) => customFetch(endpoint, 'PATCH', { ...options, body }),
  delete: (endpoint: string, options?: RequestOptions) => customFetch(endpoint, 'DELETE', options),
  defaults: {
    headers: {
      common: {} as Record<string, string>,
    },
  },
};

type AuthContextType = {
  user: any;
  token: string | null;
  isLoading: boolean;
  login: (userData: any, token?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => { },
  logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restaurar sesión al iniciar la app
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@user_data');
        const storedToken = await AsyncStorage.getItem('@user_token');

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        if (storedToken) {
          setToken(storedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Error restaurando sesión:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (userData: any, token?: string) => {
    try {
      await AsyncStorage.setItem('@user_data', JSON.stringify(userData));
      if (token) {
        await AsyncStorage.setItem('@user_token', token);
        setToken(token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      setUser(userData);

      // Redireccionar basado en el rol
      const destination = userData.id_rol === 2 ? '/tech-dashboard' : '/client-dashboard';
      await router.replace(destination as any);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  const logout = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@user_token');
      if (storedToken) {
        try {
          await api.post('/api/logout');
        } catch (srvError) {
          console.warn('No se pudo revocar la sesión en el servidor:', srvError);
        }
      }
      await AsyncStorage.removeItem('@user_data');
      await AsyncStorage.removeItem('@user_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setToken(null);
      // Forzar al login
      router.replace('/' as any);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
