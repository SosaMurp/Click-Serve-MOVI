import { Stack } from 'expo-router';
import { color } from '@/src/design';

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.ground } }} />;
}
