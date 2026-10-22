import Ionicons from '@expo/vector-icons/Ionicons';
import * as Updates from 'expo-updates';
import { ComponentProps } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, guardarModo, ModoDeColor, modoElegido, sombra } from '../utils/tema';

const OPCIONES: { modo: ModoDeColor; nombre: string; icono: ComponentProps<typeof Ionicons>['name'] }[] = [
  { modo: 'automatico', nombre: 'Automático', icono: 'phone-portrait-outline' },
  { modo: 'claro', nombre: 'Claro', icono: 'sunny-outline' },
  { modo: 'oscuro', nombre: 'Oscuro', icono: 'moon-outline' },
];

// Elegir entre modo claro, oscuro o el del celular.
// Los colores se fijan al cargar la app (ver tema.ts), así que al cambiar se guarda y se recarga:
// tarda un segundo y la sesión no se pierde.
export function SelectorDeModo() {
  const elegir = async (modo: ModoDeColor) => {
    if (modo === modoElegido) return;
    guardarModo(modo);
    try {
      await Updates.reloadAsync();
    } catch {
      // si la recarga no está disponible, el modo queda guardado igual
      Alert.alert('Modo guardado', 'Se va a aplicar la próxima vez que abras la app.');
    }
  };

  return (
    <View style={styles.tarjeta}>
      <Text style={styles.titulo}>Apariencia</Text>
      <Text style={styles.detalle}>"Automático" usa el mismo modo que tu celular.</Text>
      <View style={styles.opciones}>
        {OPCIONES.map((opcion) => {
          const marcada = opcion.modo === modoElegido;
          const color = marcada ? colores.textoSobreColor : colores.texto;
          return (
            <Pressable
              key={opcion.modo}
              style={[styles.opcion, marcada && styles.opcionMarcada]}
              onPress={() => elegir(opcion.modo)}
              accessibilityRole="button"
              accessibilityState={{ selected: marcada }}>
              <Ionicons name={opcion.icono} size={20} color={color} />
              <Text style={[styles.opcionTexto, { color }]}>{opcion.nombre}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 16,
    gap: 6,
    ...sombra,
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
  opciones: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  opcion: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  opcionMarcada: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  opcionTexto: {
    fontSize: 14,
    fontWeight: '700',
  },
});
