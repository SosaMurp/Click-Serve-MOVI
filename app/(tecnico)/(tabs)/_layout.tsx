import { Tabs } from 'expo-router';
import { makeNavigationBar, TabBarProps, TabMeta } from '@/src/design';

const META: TabMeta = {
  trabajos: { icon: 'briefcase-outline', iconActive: 'briefcase', label: 'Trabajos' },
  mapa: { icon: 'map-outline', iconActive: 'map', label: 'Mapa' },
  billetera: { icon: 'wallet-outline', iconActive: 'wallet', label: 'Billetera' },
  perfil: { icon: 'account-hard-hat-outline', iconActive: 'account-hard-hat', label: 'Perfil' },
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
