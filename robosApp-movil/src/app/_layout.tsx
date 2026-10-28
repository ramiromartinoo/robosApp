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
// - sin nadie logueado, solo las de entrar, crear cuenta y recuperar la contraseña;
// - sin términos aceptados, solo la bienvenida;
// - con los términos aceptados, la app (las pestañas y las pantallas que se abren encima).
// Cuando la condición cambia, Expo Router pasa solo de un grupo al otro.
function Navegacion() {
  const { sesion, cargando, error, sinLoguear, reintentar, cerrarSesion } = useSesion();

  if (!sesion && !sinLoguear) {
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
            {/* por si el problema es la cuenta: permite entrar con otra */}
            <Pressable onPress={cerrarSesion} hitSlop={8}>
              <Text style={styles.arranqueEnlace}>Cerrar sesión</Text>
            </Pressable>
          </>
        )}
      </View>
    );
  }

  // una cuenta suspendida o baneada solo ve la pantalla que se lo explica, aunque haya aceptado los términos
  const cuentaActiva = sesion?.estado === 'ACTIVO';
  const aceptoLosTerminos = sesion !== null && !sesion.terminosPendientes;
  const puedeUsarLaApp = cuentaActiva && aceptoLosTerminos;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colores.primario },
        // desde el SDK 58 el encabezado es transparente por defecto en iOS y el contenido pasa por debajo;
        // la app usa la barra verde sólida
        headerTransparent: false,
        headerTintColor: colores.textoSobreColor,
        headerTitleStyle: { fontSize: 20, fontWeight: '700' },
        headerTitleAlign: 'center',
        headerBackTitle: 'Volver',
        // sin esto, la navegación pinta de blanco el fondo durante las transiciones (se nota en el modo oscuro)
        contentStyle: { backgroundColor: colores.fondo },
      }}>
      <Stack.Protected guard={puedeUsarLaApp}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="cuenta" options={{ title: 'Mi cuenta' }} />
        <Stack.Screen name="sugerencias" options={{ title: 'Sugerencias' }} />
        <Stack.Screen name="mis-reportes" options={{ title: 'Mis reportes' }} />
        <Stack.Screen name="editar-reporte" options={{ title: 'Editar reporte' }} />
      </Stack.Protected>

      {/* El panel solo existe para administradores. Es una comodidad de la app, no la seguridad:
          el backend rechaza igual cualquier pedido a /admin de quien no tenga ese rol. */}
      <Stack.Protected guard={puedeUsarLaApp && sesion?.rol === 'ADMIN'}>
        <Stack.Screen name="admin/index" options={{ title: 'Panel de administrador' }} />
        <Stack.Screen name="admin/denuncias" options={{ title: 'Denuncias' }} />
        <Stack.Screen name="admin/sugerencias" options={{ title: 'Sugerencias' }} />
        <Stack.Screen name="admin/usuarios" options={{ title: 'Usuarios' }} />
        <Stack.Screen name="admin/reportes" options={{ title: 'Reportes' }} />
        <Stack.Screen name="admin/estadisticas" options={{ title: 'Estadísticas' }} />
      </Stack.Protected>

      <Stack.Protected guard={cuentaActiva && !aceptoLosTerminos}>
        <Stack.Screen name="bienvenida" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={sesion !== null && !cuentaActiva}>
        <Stack.Screen name="cuenta-bloqueada" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={sesion === null}>
        <Stack.Screen name="entrar" options={{ headerShown: false }} />
        <Stack.Screen name="crear-cuenta" options={{ title: 'Crear cuenta' }} />
        <Stack.Screen name="recuperar-contrasenia" options={{ title: 'Recuperar contraseña' }} />
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
  arranqueEnlace: {
    color: colores.textoSobreColor,
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  reintentar: {
    backgroundColor: colores.superficie,
    paddingVertical: 13,
    paddingHorizontal: 26,
    borderRadius: 12,
  },
  reintentarTexto: {
    color: colores.primarioTexto,
    fontSize: 17,
    fontWeight: '700',
  },
});
