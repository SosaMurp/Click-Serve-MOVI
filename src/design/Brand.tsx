import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polygon, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Avatar } from './Controls';
import { CircleIcon } from './AppBar';
import { Button } from './Button';
import { IconName } from './Icon';
import { Text } from './Text';
import { color, font, radius, space } from './tokens';

export const LOGO_ORANGE = '#F1630F';

// Logo de las referencias: flecha de cursor naranja con una llave inglesa cruzada en diagonal.
// La llave lleva un contorno blanco que la separa de la flecha. El mismo dibujo genera los íconos de assets/.
export function LogoMark({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="Logo de Click & Serve">
      <Polygon points="94,6 6,40 44,56 60,94" fill={LOGO_ORANGE} stroke={LOGO_ORANGE} strokeWidth={5} strokeLinejoin="round" />
      <Line x1={14} y1={86} x2={52} y2={48} stroke="#FFFFFF" strokeWidth={19} strokeLinecap="round" />
      <Circle cx={60} cy={40} r={17} fill="#FFFFFF" />
      <Line x1={14} y1={86} x2={52} y2={48} stroke={LOGO_ORANGE} strokeWidth={10} strokeLinecap="round" />
      <Circle cx={60} cy={40} r={13} fill={LOGO_ORANGE} />
      <Rect x={59.5} y={27.5} width={9} height={13} fill="#FFFFFF" transform="rotate(45 64 34)" />
      <Circle cx={19} cy={81} r={2.6} fill="#FFFFFF" />
    </Svg>
  );
}

export function Wordmark({ size = 28, light }: { size?: number; light?: boolean }) {
  return (
    <Text style={{ fontFamily: font.headingBold, fontSize: size, lineHeight: size * 1.2, color: light ? color.inkOnColor : color.ink, letterSpacing: -0.3 }} accessibilityRole="header">
      Click &amp; Serve
    </Text>
  );
}

export function Logo({ size = 40, tagline }: { size?: number; tagline?: boolean }) {
  return (
    <View style={styles.logo}>
      <LogoMark size={size} />
      <View>
        <Wordmark size={size * 0.55} />
        {tagline ? <Text variant="overline" tone="muted" style={styles.tagline}>Lázaro Cárdenas</Text> : null}
      </View>
    </View>
  );
}

// Tarjeta destacada en azul marino liso (comprobantes, saldo): sin degradados.
export function HeroCard({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.hero, style]}>{children}</View>;
}

// Encabezado de pestaña: avatar + "Bienvenido de nuevo / nombre" y botones circulares.
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

// Botón principal flotando sobre el contenido ("+ Nueva solicitud").
export function FloatingAction({ title, icon = 'plus', onPress, bottom = 16 }: { title: string; icon?: IconName; onPress: () => void; bottom?: number }) {
  return (
    <View pointerEvents="box-none" style={[styles.fab, { bottom }]}>
      <Button title={title} icon={icon} onPress={onPress} floating size="lg" variant="accent" />
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  tagline: { marginTop: 2 },
  hero: { borderRadius: radius.lg, padding: space.lg, backgroundColor: color.navy },
  header: { backgroundColor: color.ground, alignItems: 'center' },
  headerInner: { width: '100%', maxWidth: 640, flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingBottom: space.sm, gap: space.md },
  who: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.md },
  actions: { flexDirection: 'row', gap: space.sm },
  fab: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 50 },
});
