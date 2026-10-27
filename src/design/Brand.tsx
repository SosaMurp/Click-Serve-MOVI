import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Polygon, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Avatar } from './Controls';
import { CircleIcon } from './AppBar';
import { Button } from './Button';
import { IconName } from './Icon';
import { Text } from './Text';
import { color, font, gradient, radius, space } from './tokens';

// Versión limpia del logo: pin azul con engrane blanco y cursor naranja (redibujado del logo original).
export function LogoMark({ size = 48 }: { size?: number }) {
  const teeth = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <Svg width={size} height={size * 1.28} viewBox="0 0 100 128" accessibilityLabel="Logo de Click & Serve">
      <Path d="M50 2C23.5 2 2 23.5 2 50c0 33.5 48 76 48 76s48-42.5 48-76C98 23.5 76.5 2 50 2z" fill={color.brand} />
      <G>
        {teeth.map((deg) => (
          <Rect key={deg} x={44} y={14} width={12} height={12} rx={2.5} fill="#FFFFFF" transform={`rotate(${deg} 50 49)`} />
        ))}
        <Circle cx={50} cy={49} r={25} fill="#FFFFFF" />
        <Circle cx={50} cy={49} r={15} fill={color.brand} />
        <Circle cx={50} cy={49} r={10.5} fill="#FFFFFF" />
      </G>
      <Polygon points="47,41 47,66 53.5,59.5 58.5,70 63.5,67.5 58.5,57.5 67,57.5" fill={color.accent} stroke="#FFFFFF" strokeWidth={2.5} strokeLinejoin="round" />
    </Svg>
  );
}

export function Wordmark({ size = 28, light }: { size?: number; light?: boolean }) {
  return (
    <Text style={{ fontFamily: font.headingBold, fontSize: size, lineHeight: size * 1.15 }} accessibilityRole="header">
      <Text style={{ fontFamily: font.headingBold, fontSize: size, color: light ? color.inkOnColor : color.brand }}>Click</Text>
      <Text style={{ fontFamily: font.headingBold, fontSize: size, color: color.accent }}>&amp;Serve</Text>
    </Text>
  );
}

export function Logo({ size = 40, tagline }: { size?: number; tagline?: boolean }) {
  return (
    <View style={styles.logo}>
      <LogoMark size={size} />
      <View>
        <Wordmark size={size * 0.62} />
        {tagline ? <Text variant="caption" tone="muted" style={styles.tagline}>TECH &amp; SERVICE · LÁZARO CÁRDENAS</Text> : null}
      </View>
    </View>
  );
}

// Tarjeta destacada con degradado diagonal azul de marca → cielo → durazno.
export function HeroCard({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <LinearGradient colors={gradient.hero as unknown as [string, string, ...string[]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, style]}>
      {children}
    </LinearGradient>
  );
}

// Encabezado de pestaña: avatar + "Bienvenido de nuevo / nombre" y botones circulares blancos.
export function HomeHeader({ nombre, apellido, fotoUrl, actions = [], onAvatar }: {
  nombre?: string | null;
  apellido?: string | null;
  fotoUrl?: string | null;
  actions?: { icon: IconName; label: string; onPress: () => void; badge?: number | boolean }[];
  onAvatar?: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
      <StatusBar style="dark" />
      <View style={styles.headerInner}>
        <View style={styles.who} accessibilityRole="button" accessibilityLabel="Ir a mi perfil" onTouchEnd={onAvatar}>
          <Avatar uri={fotoUrl} nombre={nombre} apellido={apellido} size={44} />
          <View>
            <Text variant="caption" tone="muted">Bienvenido de nuevo</Text>
            <Text variant="subtitle" numberOfLines={1}>{[nombre, apellido].filter(Boolean).join(' ')}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          {actions.map((a) => <CircleIcon key={a.label} icon={a.icon} label={a.label} onPress={a.onPress} badge={a.badge} />)}
        </View>
      </View>
    </View>
  );
}

// Botón principal en píldora flotando sobre el contenido ("+ Nueva solicitud").
export function FloatingAction({ title, icon = 'plus', onPress, bottom = 16 }: { title: string; icon?: IconName; onPress: () => void; bottom?: number }) {
  return (
    <View pointerEvents="box-none" style={[styles.fab, { bottom }]}>
      <Button title={title} icon={icon} onPress={onPress} floating size="lg" />
    </View>
  );
}

export function useGoTo() {
  const router = useRouter();
  return (href: string) => router.push(href as never);
}

const styles = StyleSheet.create({
  logo: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  tagline: { letterSpacing: 0.6, marginTop: 2 },
  hero: { borderRadius: radius.lg, padding: space.lg },
  header: { backgroundColor: color.ground, alignItems: 'center' },
  headerInner: { width: '100%', maxWidth: 640, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingBottom: space.sm, gap: space.md },
  who: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.md },
  actions: { flexDirection: 'row', gap: space.sm },
  fab: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 50 },
});
