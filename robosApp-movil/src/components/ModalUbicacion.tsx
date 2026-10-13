import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Posteo } from '../api/tipos';
import { CATEGORIAS } from '../utils/categorias';
import { colores } from '../utils/tema';

// el backend devuelve la ubicación redondeada a ~100 m: se dibuja una zona, no un punto
const RADIO_DE_LA_ZONA_M = 120;
const ZOOM = 0.008;

type Props = {
  // null = cerrado
  posteo: Posteo | null;
  onCerrar: () => void;
};

// Hoja con un mapa que muestra la zona aproximada donde ocurrió un reporte
export function ModalUbicacion({ posteo, onCerrar }: Props) {
  const margenes = useSafeAreaInsets();

  return (
    <Modal visible={posteo !== null} transparent animationType="slide" onRequestClose={onCerrar}>
      <Pressable style={styles.fondo} onPress={onCerrar}>
        <Pressable style={[styles.hoja, { paddingBottom: margenes.bottom + 16 }]} onPress={() => {}}>
          {posteo && (
            <>
              <Text style={styles.titulo}>{posteo.zona ?? 'Zona del hecho'}</Text>
              <Text style={styles.ayuda}>La ubicación es aproximada, para cuidar la privacidad.</Text>

              <View style={styles.marco}>
                <MapView
                  style={styles.mapa}
                  initialRegion={{
                    latitude: posteo.latitud,
                    longitude: posteo.longitud,
                    latitudeDelta: ZOOM,
                    longitudeDelta: ZOOM,
                  }}>
                  <Circle
                    center={{ latitude: posteo.latitud, longitude: posteo.longitud }}
                    radius={RADIO_DE_LA_ZONA_M}
                    fillColor={CATEGORIAS[posteo.categoria].color + '55'}
                    strokeColor={CATEGORIAS[posteo.categoria].color}
                    strokeWidth={2}
                  />
                </MapView>
              </View>

              <Pressable style={styles.cerrar} onPress={onCerrar}>
                <Text style={styles.cerrarTexto}>Cerrar</Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  hoja: {
    backgroundColor: colores.superficie,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 8,
  },
  titulo: {
    fontSize: 19,
    fontWeight: '700',
    color: colores.texto,
  },
  ayuda: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  marco: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colores.borde,
    marginTop: 6,
  },
  mapa: {
    width: '100%',
    height: '100%',
  },
  cerrar: {
    backgroundColor: colores.primario,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cerrarTexto: {
    color: colores.textoSobreColor,
    fontSize: 17,
    fontWeight: '700',
  },
});
