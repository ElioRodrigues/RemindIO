import { Stack } from 'expo-router';

export default function LayoutRaiz() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Login' }} />
      <Stack.Screen name="cadastro" options={{ title: 'Cadastro' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
