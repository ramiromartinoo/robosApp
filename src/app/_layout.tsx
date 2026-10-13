import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { ProveedorDeSesion, useSesion } from '../sesion/SesionContext';
import { colores } from '../utils/tema';

// Layout raíz. Cada archivo dentro de src/app es una pantalla (Expo Router).
export default function Layout() {
  return (
    <ProveedorDeSesion>
      {/* íconos claros: el encabezado es de color */}
      <StatusBar style="light" />
      <Navegacion />
    </ProveedorDeSesion>
  );
}

// Qué pantallas están disponibles depende de la sesión:
// - sin términos aceptados, solo la bienvenida;
// - con los términos aceptados, la app (las pestañas y las pantallas que se abren encima).
// Cuando la condición cambia, Expo Router pasa solo de un grupo al otro.
function Navegacion() {
  const { sesion, cargando, error, reintentar } = useSesion();

  if (!sesion) {
    return (
      <View style={styles.arranque}>
        {cargando ? (
          <ActivityIndicator size="large" color={colores.textoSobreColor} />
        ) : (
          <>
            <Text style={styles.arranqueTexto}>{error}</Text>
            <Pressable style={styles.reintentar} onPress={reintentar}>
              <Text style={styles.reintentarTexto}>Reintentar</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  const aceptoLosTerminos = !sesion.terminosPendientes;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colores.primario },
        headerTintColor: colores.textoSobreColor,
        headerTitleStyle: { fontSize: 20, fontWeight: '700' },
        headerTitleAlign: 'center',
        headerBackTitle: 'Volver',
      }}>
      <Stack.Protected guard={aceptoLosTerminos}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="cuenta" options={{ title: 'Mi cuenta' }} />
        <Stack.Screen name="sugerencias" options={{ title: 'Sugerencias' }} />
        <Stack.Screen name="mis-reportes" options={{ title: 'Mis reportes' }} />
        <Stack.Screen name="editar-reporte" options={{ title: 'Editar reporte' }} />
      </Stack.Protected>

      <Stack.Protected guard={!aceptoLosTerminos}>
        <Stack.Screen name="bienvenida" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  // pantalla mientras se inicia la sesión, o si no se pudo conectar
  arranque: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    padding: 28,
    backgroundColor: colores.primario,
  },
  arranqueTexto: {
    color: colores.textoSobreColor,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  reintentar: {
    backgroundColor: colores.superficie,
    paddingVertical: 13,
    paddingHorizontal: 26,
    borderRadius: 12,
  },
  reintentarTexto: {
    color: colores.primario,
    fontSize: 17,
    fontWeight: '700',
  },
});
