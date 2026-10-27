import { Tabs } from 'expo-router';
import { makeNavigationBar, TabBarProps, TabMeta } from '@/src/design';

const META: TabMeta = {
  inicio: { icon: 'home-outline', iconActive: 'home', label: 'Inicio' },
  servicios: { icon: 'clipboard-text-outline', iconActive: 'clipboard-text', label: 'Mis servicios' },
  cuenta: { icon: 'account-circle-outline', iconActive: 'account-circle', label: 'Cuenta' },
};
const NavigationBar = makeNavigationBar(META);

export default function ClienteTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <NavigationBar {...(props as unknown as TabBarProps)} />}>
      <Tabs.Screen name="inicio" />
      <Tabs.Screen name="servicios" />
      <Tabs.Screen name="cuenta" />
    </Tabs>
  );
}
