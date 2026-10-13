import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Posteo, TipoConfirmacion } from '../api/tipos';
import { CATEGORIAS } from '../utils/categorias';
import { distanciaEnMetros, distanciaLegible, Punto } from '../utils/distancia';
import { haceCuanto } from '../utils/fechas';
import { colores, sombra } from '../utils/tema';

type Props = {
  posteo: Posteo;
  // ubicación actual del usuario; null si no se conoce
  miUbicacion: Punto | null;
  // tocar el voto que ya está marcado lo anula (lo resuelve la pantalla)
  onVotar: (tipo: TipoConfirmacion) => void;
  onDenunciar: () => void;
  onVerUbicacion: () => void;
};

// Resumen de lo que opinan los vecinos sobre el reporte
function estadoDe(posteo: Posteo): { texto: string; icono: 'checkmark' | 'alert-circle-outline'; color: string; fondo: string } {
  const { confirmaciones, negaciones } = posteo;
  if (negaciones > confirmaciones) {
    return {
      texto: negaciones === 1 ? '1 vecino dice que no fue así' : `${negaciones} vecinos dicen que no fue así`,
      icono: 'alert-circle-outline',
      color: colores.negar,
      fondo: colores.negarSuave,
    };
  }
  if (confirmaciones > 0) {
    return {
      texto: confirmaciones === 1 ? 'Confirmado por 1 vecino' : `Confirmado por ${confirmaciones} vecinos`,
      icono: 'checkmark',
      color: colores.confirmar,
      fondo: colores.confirmarSuave,
    };
  }
  return {
    texto: 'Sin confirmar todavía',
    icono: 'alert-circle-outline',
    color: colores.aviso,
    fondo: colores.avisoSuave,
  };
}

// Tarjeta de un reporte en el feed
export function ItemPosteo({ posteo, miUbicacion, onVotar, onDenunciar, onVerUbicacion }: Props) {
  const categoria = CATEGORIAS[posteo.categoria];
  const estado = estadoDe(posteo);
  const confirmo = posteo.miVoto === 'CONFIRMA';
  const nego = posteo.miVoto === 'NIEGA';

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
          <Text style={styles.autor} numberOfLines={1}>
            {posteo.autor}
          </Text>
          {/* la hora que importa es la del hecho, no la de publicación */}
          <Text style={styles.tiempo}>Ocurrió {haceCuanto(posteo.fechaHoraIncidente)}</Text>
        </View>
        <View style={[styles.categoria, { backgroundColor: categoria.fondo }]}>
          <Text style={[styles.categoriaTexto, { color: categoria.color }]}>{categoria.nombre}</Text>
        </View>
      </View>

      <Text style={styles.descripcion}>{posteo.descripcion}</Text>

      {/* tocar abre el mapa con la zona aproximada del hecho */}
      <Pressable style={styles.ubicacion} onPress={onVerUbicacion} hitSlop={8}>
        <Ionicons name="location-outline" size={18} color={colores.primario} />
        <Text style={styles.ubicacionTexto} numberOfLines={1}>
          {dondeFue}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colores.primario} />
      </Pressable>

      <View style={[styles.estado, { backgroundColor: estado.fondo }]}>
        <Ionicons name={estado.icono} size={15} color={estado.color} />
        <Text style={[styles.estadoTexto, { color: estado.color }]}>{estado.texto}</Text>
      </View>

      {posteo.esMio ? (
        // sobre un reporte propio no se vota ni se denuncia
        <Text style={styles.propio}>Este reporte lo publicaste vos.</Text>
      ) : (
        <>
          <View style={styles.acciones}>
            <Pressable
              style={[styles.accion, confirmo && styles.accionConfirmada]}
              onPress={() => onVotar('CONFIRMA')}
              accessibilityState={{ selected: confirmo }}>
              <Text style={[styles.accionTexto, confirmo && styles.accionTextoConfirmada]}>
                Yo también lo vi · {posteo.confirmaciones}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.accion, nego && styles.accionNegada]}
              onPress={() => onVotar('NIEGA')}
              accessibilityState={{ selected: nego }}>
              <Text style={[styles.accionTexto, nego && styles.accionTextoNegada]}>No fue así</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.denunciar}
            onPress={onDenunciar}
            hitSlop={10}
            accessibilityLabel="Denunciar este reporte">
            <Ionicons name="flag-outline" size={20} color={colores.textoSuave} />
          </Pressable>
        </>
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
    color: colores.primario,
  },
  quien: {
    flex: 1,
  },
  autor: {
    fontSize: 16,
    fontWeight: '700',
    color: colores.texto,
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
  ubicacion: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ubicacionTexto: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colores.primario,
    textDecorationLine: 'underline',
  },
  estado: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  estadoTexto: {
    fontSize: 13,
    fontWeight: '700',
  },
  propio: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  acciones: {
    flexDirection: 'row',
    gap: 10,
  },
  accion: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  accionTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
    textAlign: 'center',
  },
  accionConfirmada: {
    backgroundColor: colores.primario,
    borderColor: colores.primario,
  },
  accionTextoConfirmada: {
    color: colores.textoSobreColor,
  },
  accionNegada: {
    backgroundColor: colores.negarSuave,
    borderColor: colores.negar,
  },
  accionTextoNegada: {
    color: colores.negar,
  },
  denunciar: {
    alignSelf: 'flex-start',
    padding: 4,
  },
});
