import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { colores } from '../utils/tema';

// Layout raíz. Cada archivo dentro de src/app es una pantalla (Expo Router).
// Las pestañas viven en (tabs); el resto son pantallas que se abren encima, con flecha para volver.
export default function Layout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colores.primario },
          headerTintColor: colores.textoSobreColor,
          headerTitleStyle: { fontSize: 20, fontWeight: '700' },
          headerTitleAlign: 'center',
          headerBackTitle: 'Volver',
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="mis-reportes" options={{ title: 'Mis reportes' }} />
        <Stack.Screen name="editar-reporte" options={{ title: 'Editar reporte' }} />
      </Stack>
      {/* íconos claros: el encabezado es de color */}
      <StatusBar style="light" />
    </>
  );
}
