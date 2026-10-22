import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores } from '../../utils/tema';

// Barra de pestañas de abajo: Inicio, Reportar (botón destacado en el centro) y Mapa
export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colores.primarioTexto,
        tabBarInactiveTintColor: colores.textoSuave,
        tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
        tabBarStyle: { backgroundColor: colores.superficie, borderTopColor: colores.borde },
        // encabezado con el verde de marca
        headerStyle: { backgroundColor: colores.primario },
        headerTintColor: colores.textoSobreColor,
        headerTitleStyle: { fontSize: 20, fontWeight: '700' },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colores.fondo },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          headerTitle: 'Radar Vecinal',
          // acceso al menú personal (mis reportes, sugerencias), arriba a la derecha
          headerRight: () => (
            <Pressable
              style={styles.cuenta}
              onPress={() => router.push('/cuenta')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Mi cuenta">
              <Ionicons name="person-circle-outline" size={30} color={colores.textoSobreColor} />
            </Pressable>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={25} name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="publicar"
        options={{
          title: 'Reportar',
          headerTitle: 'Nuevo reporte',
          // en vez del ícono común, un botón verde con el "+" y el texto adentro
          tabBarButton: ({ onPress, accessibilityState }) => (
            <Pressable
              style={styles.reportarZona}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={accessibilityState}
              accessibilityLabel="Reportar">
              <View style={styles.reportar}>
                <Ionicons name="add" size={24} color={colores.textoSobreColor} />
                <Text style={styles.reportarTexto}>Reportar</Text>
              </View>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons size={25} name={focused ? 'map' : 'map-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  cuenta: {
    marginRight: 14,
  },
  // ocupa todo el ancho de su pestaña, para que sea fácil de tocar
  reportarZona: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.primario,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 4,
    minWidth: 92,
  },
  reportarTexto: {
    color: colores.textoSobreColor,
    fontSize: 12,
    fontWeight: '700',
  },
});
