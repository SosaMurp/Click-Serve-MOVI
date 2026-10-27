import { Tabs } from 'expo-router';
import { makeNavigationBar, TabBarProps, TabMeta } from '@/src/design';

const META: TabMeta = {
  trabajos: { icon: 'briefcase', iconActive: 'briefcase', label: 'Trabajos' },
  mapa: { icon: 'map', iconActive: 'map', label: 'Mapa' },
  billetera: { icon: 'credit-card', iconActive: 'credit-card', label: 'Billetera' },
  perfil: { icon: 'user', iconActive: 'user', label: 'Perfil' },
};
const NavigationBar = makeNavigationBar(META);

export default function TecnicoTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <NavigationBar {...(props as unknown as TabBarProps)} />}>
      <Tabs.Screen name="trabajos" />
      <Tabs.Screen name="mapa" />
      <Tabs.Screen name="billetera" />
      <Tabs.Screen name="perfil" />
    </Tabs>
  );
}
