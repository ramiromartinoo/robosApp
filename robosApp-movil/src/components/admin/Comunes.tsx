// Piezas que comparten las pantallas del panel de administrador

import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { colores, sombra } from '../../utils/tema';

type Icono = ComponentProps<typeof Ionicons>['name'];

// Fondo, márgenes y "deslizar para actualizar" de una pantalla con lista
export function PantallaConLista({
  refrescando,
  onRefrescar,
  children,
}: {
  refrescando: boolean;
  onRefrescar: () => void;
  children: ReactNode;
}) {
  return (
    <ScrollView
      style={styles.pantalla}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={onRefrescar} tintColor={colores.primario} />}>
      {children}
    </ScrollView>
  );
}

export function Tarjeta({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.tarjeta, style]}>{children}</View>;
}

// Lo que se muestra en lugar de la lista mientras carga, si falló o si no hay nada
export function EstadoDeLista({
  cargando,
  error,
  vacia,
  textoVacia,
  onReintentar,
}: {
  cargando: boolean;
  error: string | null;
  vacia: boolean;
  textoVacia: string;
  onReintentar: () => void;
}) {
  if (cargando) {
    return <ActivityIndicator style={styles.cargando} color={colores.primario} />;
  }
  if (error) {
    return (
      <Tarjeta>
        <Text style={styles.error}>{error}</Text>
        <Boton texto="Reintentar" tipo="primario" onPress={onReintentar} />
      </Tarjeta>
    );
  }
  if (vacia) {
    return <Text style={styles.vacia}>{textoVacia}</Text>;
  }
  return null;
}

export function Boton({
  texto,
  icono,
  tipo = 'normal',
  onPress,
  deshabilitado = false,
}: {
  texto: string;
  icono?: Icono;
  // primario: acción principal; peligro: acción destructiva
  tipo?: 'normal' | 'primario' | 'peligro';
  onPress: () => void;
  deshabilitado?: boolean;
}) {
  const color =
    tipo === 'primario' ? colores.textoSobreColor : tipo === 'peligro' ? colores.negar : colores.texto;
  return (
    <Pressable
      style={[
        styles.boton,
        tipo === 'primario' && styles.botonPrimario,
        tipo === 'peligro' && styles.botonPeligro,
        deshabilitado && styles.botonDeshabilitado,
      ]}
      onPress={onPress}
      disabled={deshabilitado}
      accessibilityRole="button">
      {icono && <Ionicons name={icono} size={18} color={color} />}
      <Text style={[styles.botonTexto, { color }]}>{texto}</Text>
    </Pressable>
  );
}

export function Etiqueta({ texto, color, fondo }: { texto: string; color: string; fondo: string }) {
  return (
    <View style={[styles.etiqueta, { backgroundColor: fondo }]}>
      <Text style={[styles.etiquetaTexto, { color }]}>{texto}</Text>
    </View>
  );
}

// Fila de opciones para filtrar; una sola queda elegida
export function Filtros<T extends string | number>({
  opciones,
  elegida,
  onElegir,
}: {
  opciones: { valor: T; nombre: string }[];
  elegida: T;
  onElegir: (valor: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtros}>
      {opciones.map((opcion) => {
        const marcada = opcion.valor === elegida;
        return (
          <Pressable
            key={opcion.valor}
            style={[styles.filtro, marcada && styles.filtroElegido]}
            onPress={() => onElegir(opcion.valor)}
            accessibilityState={{ selected: marcada }}>
            <Text style={[styles.filtroTexto, marcada && styles.filtroTextoElegido]}>{opcion.nombre}</Text>
          </Pressable>
        );
      })}
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
    paddingBottom: 32,
    gap: 14,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 16,
    gap: 10,
    ...sombra,
  },
  cargando: {
    marginTop: 40,
  },
  error: {
    backgroundColor: colores.errorFondo,
    color: colores.errorTexto,
    fontSize: 15,
    padding: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  vacia: {
    textAlign: 'center',
    color: colores.textoSuave,
    fontSize: 16,
    marginTop: 40,
  },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  botonPrimario: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  botonPeligro: {
    borderColor: colores.negarSuave,
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
  botonTexto: {
    fontSize: 15,
    fontWeight: '700',
  },
  etiqueta: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  etiquetaTexto: {
    fontSize: 13,
    fontWeight: '700',
  },
  filtros: {
    gap: 8,
  },
  filtro: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  filtroElegido: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  filtroTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: colores.texto,
  },
  filtroTextoElegido: {
    color: colores.textoSobreColor,
  },
});

// "Publicado a 8,4 km del lugar": ayuda a evaluar un reporte denunciado. Una distancia grande
// no prueba nada (alguien puede cargarlo después, desde su casa), así que solo se resalta.
const DISTANCIA_LLAMATIVA_M = 5000;

export function DistanciaAlLugar({ metros }: { metros: number | null }) {
  if (metros === null) {
    return <Text style={estilosDeDistancia.normal}>Sin ubicación del teléfono al publicar</Text>;
  }
  const texto =
    metros < 1000
      ? `Publicado a ${Math.round(metros / 10) * 10} m del lugar`
      : `Publicado a ${(metros / 1000).toFixed(1).replace('.', ',')} km del lugar`;
  return (
    <Text style={metros >= DISTANCIA_LLAMATIVA_M ? estilosDeDistancia.lejos : estilosDeDistancia.normal}>{texto}</Text>
  );
}

const estilosDeDistancia = StyleSheet.create({
  normal: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  lejos: {
    fontSize: 14,
    fontWeight: '700',
    color: colores.aviso,
  },
});

// Al pie de una lista paginada: trae la página siguiente. No se muestra si ya no hay más.
export function BotonCargarMas({
  hayMas,
  cargando,
  onPress,
}: {
  hayMas: boolean;
  cargando: boolean;
  onPress: () => void;
}) {
  if (!hayMas) {
    return null;
  }
  return cargando ? (
    <ActivityIndicator style={estilosDeCargarMas.cargando} color={colores.primario} />
  ) : (
    <Boton texto="Cargar más" icono="chevron-down" onPress={onPress} />
  );
}

const estilosDeCargarMas = StyleSheet.create({
  cargando: {
    marginVertical: 14,
  },
});
