import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores } from '../utils/tema';

type Props = {
  icono: ComponentProps<typeof Ionicons>['name'];
  titulo: string;
  // explicación corta de por qué está vacío o qué se puede hacer
  texto?: string;
  // botón opcional que lleva a la acción que resuelve el vacío (publicar, quitar filtros, etc.)
  accion?: { texto: string; onPress: () => void };
};

// Lo que se muestra cuando una lista no tiene nada: en vez de un renglón suelto,
// un ícono, qué pasa y, si corresponde, qué hacer
export function EstadoVacio({ icono, titulo, texto, accion }: Props) {
  return (
    <View style={styles.contenedor}>
      <View style={styles.circulo}>
        <Ionicons name={icono} size={34} color={colores.primarioTexto} />
      </View>
      <Text style={styles.titulo}>{titulo}</Text>
      {texto && <Text style={styles.texto}>{texto}</Text>}
      {accion && (
        <Pressable style={styles.boton} onPress={accion.onPress}>
          <Text style={styles.botonTexto}>{accion.texto}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    gap: 10,
  },
  circulo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: colores.texto,
    textAlign: 'center',
  },
  texto: {
    fontSize: 15,
    lineHeight: 21,
    color: colores.textoSuave,
    textAlign: 'center',
  },
  boton: {
    marginTop: 8,
    backgroundColor: colores.primario,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  botonTexto: {
    color: colores.textoSobreColor,
    fontSize: 16,
    fontWeight: '700',
  },
});
