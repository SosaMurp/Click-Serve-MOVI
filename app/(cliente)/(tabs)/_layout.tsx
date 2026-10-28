import { Tabs } from 'expo-router';
import { makeNavigationBar, TabBarProps, TabMeta } from '@/src/design';

const META: TabMeta = {
  inicio: { icon: 'home', iconActive: 'home', label: 'Inicio' },
  servicios: { icon: 'clipboard', iconActive: 'clipboard', label: 'Mis servicios' },
  mensajes: { icon: 'message-circle', iconActive: 'message-circle', label: 'Mensajes' },
  cuenta: { icon: 'user', iconActive: 'user', label: 'Mi cuenta' },
};
// Barra más grande para el cliente (CILIM): íconos de 26 y etiquetas de 14 px.
const NavigationBar = makeNavigationBar(META, { comfortable: true });

export default function ClienteTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <NavigationBar {...(props as unknown as TabBarProps)} />}>
      <Tabs.Screen name="inicio" />
      <Tabs.Screen name="servicios" />
      <Tabs.Screen name="mensajes" />
      <Tabs.Screen name="cuenta" />
    </Tabs>
  );
}
