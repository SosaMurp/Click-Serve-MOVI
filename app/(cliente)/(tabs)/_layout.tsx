import { Tabs } from 'expo-router';
import { makeNavigationBar, TabBarProps, TabMeta } from '@/src/design';

const META: TabMeta = {
  inicio: { icon: 'home', iconActive: 'home', label: 'Inicio' },
  servicios: { icon: 'clipboard', iconActive: 'clipboard', label: 'Servicios' },
  mensajes: { icon: 'message-circle', iconActive: 'message-circle', label: 'Mensajes' },
  cuenta: { icon: 'user', iconActive: 'user', label: 'Perfil' },
};
const NavigationBar = makeNavigationBar(META);

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
