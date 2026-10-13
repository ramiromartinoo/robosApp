import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Layout raíz. Cada archivo dentro de src/app es una pantalla (Expo Router).
export default function Layout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      {/* íconos claros: el encabezado es de color */}
      <StatusBar style="light" />
    </>
  );
}
