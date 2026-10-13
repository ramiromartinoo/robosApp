import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Categoria } from '../api/tipos';
import { CATEGORIAS, LISTA_DE_CATEGORIAS } from '../utils/categorias';
import { colores } from '../utils/tema';

type Props = {
  // null = todavía no eligió
  elegida: Categoria | null;
  onElegir: (categoria: Categoria) => void;
};

// Botones grandes con ícono para elegir el tipo de hecho, dos por fila
export function GrillaDeCategorias({ elegida, onElegir }: Props) {
  return (
    <View style={styles.grilla}>
      {LISTA_DE_CATEGORIAS.map((opcion) => {
        const marcada = opcion === elegida;
        const info = CATEGORIAS[opcion];
        const color = marcada ? colores.textoSobreColor : colores.texto;
        return (
          <Pressable
            key={opcion}
            onPress={() => onElegir(opcion)}
            accessibilityState={{ selected: marcada }}
            style={[styles.opcion, marcada && styles.opcionElegida]}>
            <Ionicons name={info.icono} size={24} color={color} />
            <Text style={[styles.opcionTexto, { color }]}>{info.nombreCorto}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grilla: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  opcion: {
    flexBasis: '45%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 82,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  opcionElegida: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  opcionTexto: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
});
