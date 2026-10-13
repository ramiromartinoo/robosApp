import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Categoria } from '../api/tipos';
import { CATEGORIAS, LISTA_DE_CATEGORIAS } from '../utils/categorias';
import { colores } from '../utils/tema';

// El backend acepta radios de 0,5 a 50 km
const RADIOS_KM = [1, 3, 10];

type Props = {
  // null = sin filtrar
  categoria: Categoria | null;
  radioKm: number | null;
  onCategoria: (categoria: Categoria | null) => void;
  onRadio: (radioKm: number | null) => void;
};

// Dos filas de botones arriba del feed: qué tipo de hecho ver y a qué distancia
export function FiltrosDelFeed({ categoria, radioKm, onCategoria, onRadio }: Props) {
  return (
    <View style={styles.barra}>
      <Fila>
        <Opcion nombre="Todos" elegida={categoria === null} onPress={() => onCategoria(null)} />
        {LISTA_DE_CATEGORIAS.map((opcion) => (
          <Opcion
            key={opcion}
            nombre={CATEGORIAS[opcion].nombreCorto}
            icono={CATEGORIAS[opcion].icono}
            elegida={categoria === opcion}
            onPress={() => onCategoria(opcion)}
          />
        ))}
      </Fila>

      <Fila>
        <Opcion
          nombre="Toda la ciudad"
          icono="business-outline"
          elegida={radioKm === null}
          onPress={() => onRadio(null)}
        />
        {RADIOS_KM.map((km) => (
          <Opcion
            key={km}
            nombre={`A menos de ${km} km`}
            icono="navigate-outline"
            elegida={radioKm === km}
            onPress={() => onRadio(km)}
          />
        ))}
      </Fila>
    </View>
  );
}

// Fila que se desliza hacia los costados si las opciones no entran
function Fila({ children }: { children: ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fila}>
      {children}
    </ScrollView>
  );
}

type OpcionProps = {
  nombre: string;
  icono?: ComponentProps<typeof Ionicons>['name'];
  elegida: boolean;
  onPress: () => void;
};

function Opcion({ nombre, icono, elegida, onPress }: OpcionProps) {
  const color = elegida ? colores.textoSobreColor : colores.texto;
  return (
    <Pressable
      style={[styles.opcion, elegida && styles.opcionElegida]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: elegida }}>
      {icono && <Ionicons name={icono} size={16} color={color} />}
      <Text style={[styles.opcionTexto, { color }]}>{nombre}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  barra: {
    backgroundColor: colores.superficie,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
    paddingVertical: 10,
    gap: 8,
  },
  fila: {
    paddingHorizontal: 14,
    gap: 8,
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  opcionElegida: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  opcionTexto: {
    fontSize: 15,
    fontWeight: '600',
  },
});
