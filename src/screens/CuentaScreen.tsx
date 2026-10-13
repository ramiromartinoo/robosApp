import Ionicons from '@expo/vector-icons/Ionicons';
import { Href, useRouter } from 'expo-router';
import { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useSesion } from '../sesion/SesionContext';
import { colores, sombra } from '../utils/tema';

type Opcion = {
  titulo: string;
  detalle: string;
  icono: ComponentProps<typeof Ionicons>['name'];
  ruta: Href;
};

const OPCIONES: Opcion[] = [
  {
    titulo: 'Mis reportes',
    detalle: 'Ver, editar o eliminar lo que publicaste',
    icono: 'document-text-outline',
    ruta: '/mis-reportes',
  },
  {
    titulo: 'Sugerencias',
    detalle: 'Contanos cómo mejorar la app',
    icono: 'chatbubble-ellipses-outline',
    ruta: '/sugerencias',
  },
];

// Menú personal: quién es el usuario y accesos a sus secciones
export function CuentaScreen() {
  const router = useRouter();
  const { sesion } = useSesion();

  return (
    <ScrollView style={styles.pantalla} contentContainerStyle={styles.contenido}>
      {sesion && (
        <View style={styles.perfil}>
          <View style={styles.avatar}>
            <Text style={styles.inicial}>{sesion.nombreVisible.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.datos}>
            <Text style={styles.nombre} numberOfLines={1}>
              {sesion.nombreVisible}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {sesion.email}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.menu}>
        {OPCIONES.map((opcion, indice) => (
          <Pressable
            key={opcion.titulo}
            style={[styles.opcion, indice > 0 && styles.opcionConLinea]}
            onPress={() => router.push(opcion.ruta)}
            accessibilityRole="button">
            <View style={styles.icono}>
              <Ionicons name={opcion.icono} size={22} color={colores.primario} />
            </View>
            <View style={styles.textos}>
              <Text style={styles.titulo}>{opcion.titulo}</Text>
              <Text style={styles.detalle}>{opcion.detalle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colores.textoSuave} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: 14,
    gap: 14,
  },
  perfil: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colores.superficie,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 16,
    ...sombra,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicial: {
    fontSize: 23,
    fontWeight: '700',
    color: colores.primario,
  },
  datos: {
    flex: 1,
  },
  nombre: {
    fontSize: 19,
    fontWeight: '700',
    color: colores.texto,
  },
  email: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  menu: {
    backgroundColor: colores.superficie,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colores.borde,
    overflow: 'hidden',
    ...sombra,
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  opcionConLinea: {
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  icono: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: {
    flex: 1,
  },
  titulo: {
    fontSize: 17,
    fontWeight: '700',
    color: colores.texto,
  },
  detalle: {
    fontSize: 14,
    color: colores.textoSuave,
  },
});
