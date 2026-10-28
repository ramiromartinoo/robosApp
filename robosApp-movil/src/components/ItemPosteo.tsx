import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Posteo } from '../api/tipos';
import { CATEGORIAS } from '../utils/categorias';
import { distanciaEnMetros, distanciaLegible, Punto } from '../utils/distancia';
import { haceCuanto, haceCuantoCorto } from '../utils/fechas';
import { colores, sombra } from '../utils/tema';

type Props = {
  posteo: Posteo;
  // ubicación actual del usuario; null si no se conoce
  miUbicacion: Punto | null;
  onDenunciar: () => void;
  onVerUbicacion: () => void;
  onVerMisReportes: () => void;
};

// Tarjeta de un reporte en el feed
export function ItemPosteo({
  posteo,
  miUbicacion,
  onDenunciar,
  onVerUbicacion,
  onVerMisReportes,
}: Props) {
  const categoria = CATEGORIAS[posteo.categoria];

  // Con la ubicación del usuario se muestra la distancia, así decide qué reporte abrir en el mapa.
  // Sin ella, la zona guardada o un texto genérico.
  const dondeFue = miUbicacion
    ? distanciaLegible(distanciaEnMetros(miUbicacion, posteo))
    : (posteo.zona ?? 'Ver ubicación aproximada');

  return (
    <View style={styles.tarjeta}>
      <View style={styles.encabezado}>
        <View style={styles.avatar}>
          <Text style={styles.inicial}>{posteo.autor.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.quien}>
          {/* nombre y hace cuánto se publicó, como en Twitter */}
          <View style={styles.nombreYPublicacion}>
            <Text style={styles.autor} numberOfLines={1}>
              {posteo.autor}
            </Text>
            <Text style={styles.publicado}> · {haceCuantoCorto(posteo.fechaHoraPublicacion)}</Text>
          </View>
          {/* la hora que importa es la del hecho, no la de publicación */}
          <Text style={styles.tiempo}>Ocurrió {haceCuanto(posteo.fechaHoraIncidente)}</Text>
        </View>
        <View style={[styles.categoria, { backgroundColor: categoria.fondo }]}>
          <Text style={[styles.categoriaTexto, { color: categoria.color }]}>{categoria.nombre}</Text>
        </View>
      </View>

      <Text style={styles.descripcion}>{posteo.descripcion}</Text>

      <View style={styles.pie}>
        {/* tocar abre el mapa con la zona aproximada del hecho */}
        <Pressable style={styles.ubicacion} onPress={onVerUbicacion} hitSlop={8}>
          <Ionicons name="location-outline" size={18} color={colores.primarioTexto} />
          <Text style={styles.ubicacionTexto} numberOfLines={1}>
            {dondeFue}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colores.primarioTexto} />
        </Pressable>

        {/* si no es un robo o no corresponde, se denuncia y lo resuelve un administrador */}
        {!posteo.esMio && (
          <Pressable
            style={styles.denunciar}
            onPress={onDenunciar}
            hitSlop={10}
            accessibilityLabel="Denunciar este reporte">
            <Ionicons name="flag-outline" size={20} color={colores.textoSuave} />
          </Pressable>
        )}
      </View>

      {posteo.esMio && (
        // un reporte propio no se denuncia; se administra desde "Mis reportes"
        <Pressable style={styles.propio} onPress={onVerMisReportes} hitSlop={8}>
          <Text style={styles.propioTexto}>Es tu reporte · </Text>
          <Text style={styles.propioEnlace}>Ver mis reportes</Text>
          <Ionicons name="chevron-forward" size={15} color={colores.primarioTexto} />
        </Pressable>
      )}
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
    gap: 12,
    ...sombra,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicial: {
    fontSize: 17,
    fontWeight: '700',
    color: colores.primarioTexto,
  },
  quien: {
    flex: 1,
  },
  nombreYPublicacion: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  autor: {
    // si el nombre es largo se corta, pero el tiempo de publicación siempre se ve
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colores.texto,
  },
  publicado: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  tiempo: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  categoria: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoriaTexto: {
    fontSize: 13,
    fontWeight: '700',
  },
  // letra grande: la app tiene que ser cómoda para cualquier edad
  descripcion: {
    fontSize: 17,
    lineHeight: 24,
    color: colores.texto,
  },
  pie: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  ubicacion: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ubicacionTexto: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colores.primarioTexto,
    textDecorationLine: 'underline',
  },
  propio: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  propioTexto: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  propioEnlace: {
    fontSize: 14,
    fontWeight: '700',
    color: colores.primarioTexto,
  },
  denunciar: {
    padding: 4,
  },
});
