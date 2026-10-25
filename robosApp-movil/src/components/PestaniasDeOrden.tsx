import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OrdenDelFeed } from '../api/reportes';
import { colores } from '../utils/tema';

const PESTANIAS: { orden: OrdenDelFeed; nombre: string }[] = [
  { orden: 'HECHO', nombre: 'Cuándo pasó' },
  { orden: 'PUBLICACION', nombre: 'Recién publicados' },
];

type Props = {
  orden: OrdenDelFeed;
  onOrden: (orden: OrdenDelFeed) => void;
};

// Dos pestañas arriba del feed, como las de Twitter: cada una ordena los reportes por una fecha distinta
export function PestaniasDeOrden({ orden, onOrden }: Props) {
  return (
    <View style={styles.barra} accessibilityRole="tablist">
      {PESTANIAS.map((pestania) => {
        const elegida = pestania.orden === orden;
        return (
          <Pressable
            key={pestania.orden}
            style={styles.pestania}
            onPress={() => onOrden(pestania.orden)}
            accessibilityRole="tab"
            accessibilityState={{ selected: elegida }}>
            <Text style={[styles.texto, elegida && styles.textoElegido]}>{pestania.nombre}</Text>
            <View style={[styles.subrayado, elegida && styles.subrayadoElegido]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    backgroundColor: colores.superficie,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  pestania: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 12,
  },
  texto: {
    fontSize: 15,
    fontWeight: '600',
    color: colores.textoSuave,
    paddingBottom: 10,
  },
  textoElegido: {
    color: colores.texto,
    fontWeight: '700',
  },
  // la raya debajo de la pestaña elegida
  subrayado: {
    height: 3,
    width: 56,
    borderRadius: 2,
  },
  subrayadoElegido: {
    backgroundColor: colores.primarioTexto,
  },
});
