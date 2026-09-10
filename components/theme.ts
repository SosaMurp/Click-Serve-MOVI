import { Platform } from 'react-native';

export const theme = {
  colors: {
    primary: '#0A192F',
    primaryLight: '#1E293B',
    accent: '#38BDF8',
    accentDark: '#0284C7',
    background: '#FAFAFA',
    backgroundDark: '#0F172A',
    card: '#FFFFFF',
    cardDark: '#1E293B',
    text: '#0A192F',
    textLight: '#F8FAFC',
    textSecondary: '#7A8C9E',
    textMuted: '#9CA8B6',
    border: '#D1D9E0',
    borderDark: '#334155',
    error: '#D9534F',
    success: '#10B981',
    warning: '#F59E0B',
  },
  
  // 3 Fuentes Estandarizadas para todo el proyecto
  fonts: {
    /** 1. Títulos, Encabezados principales, marca y cifras financieras */
    heading: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    /** 2. Interfaz general, textos de cuerpo, botones e inputs */
    body: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    /** 3. Datos tabulares, códigos, folios, tarjetas y fechas */
    monospace: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 20,
    full: 9999,
  },
};
