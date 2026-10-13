import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Region } from 'react-native-maps';

import { colores } from '../utils/tema';

export type Coordenada = { latitud: number; longitud: number };

// Centro de Mar del Plata: punto de partida si no hay GPS
const CENTRO_MDP: Coordenada = { latitud: -38.0055, longitud: -57.5426 };
// cuánto mapa se ve: ~0.01 grados son unas 10 cuadras
const ZOOM = 0.01;
const ALTO_DEL_PIN = 40;

const aRegion = (coordenada: Coordenada): Region => ({
  latitude: coordenada.latitud,
  longitude: coordenada.longitud,
  latitudeDelta: ZOOM,
  longitudeDelta: ZOOM,
});

// Mapa con un pin fijo en el centro: la ubicación elegida es la que queda debajo del pin.
// Arranca en la posición del GPS y se corrige arrastrando el mapa.
export function SelectorDeUbicacion({ onCambio }: { onCambio: (coordenada: Coordenada) => void }) {
  const mapa = useRef<MapView>(null);
  const [buscando, setBuscando] = useState(true);
  const [aviso, setAviso] = useState<string | null>(null);

  const irAMiUbicacion = async () => {
    setBuscando(true);
    setAviso(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setAviso('Sin permiso de ubicación. Mové el mapa hasta el lugar del hecho.');
        return;
      }
      const posicion = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coordenada = { latitud: posicion.coords.latitude, longitud: posicion.coords.longitude };
      mapa.current?.animateToRegion(aRegion(coordenada), 400);
      onCambio(coordenada);
    } catch {
      setAviso('No pudimos obtener tu ubicación. Mové el mapa hasta el lugar del hecho.');
    } finally {
      setBuscando(false);
    }
  };

  useEffect(() => {
    onCambio(CENTRO_MDP);
    irAMiUbicacion();
    // solo al montar
  }, []);

  return (
    <View style={styles.contenedor}>
      <View style={styles.marco}>
        <MapView
          ref={mapa}
          style={styles.mapa}
          initialRegion={aRegion(CENTRO_MDP)}
          onRegionChangeComplete={(region) => onCambio({ latitud: region.latitude, longitud: region.longitude })}
        />
        {/* el pin no es un marcador del mapa: está dibujado encima, siempre en el centro */}
        <View style={styles.pin} pointerEvents="none">
          <Ionicons name="location-sharp" size={ALTO_DEL_PIN} color={colores.negar} />
        </View>
        {buscando && (
          <View style={styles.buscando} pointerEvents="none">
            <ActivityIndicator color={colores.textoSobreColor} />
            <Text style={styles.buscandoTexto}>Buscando tu ubicación…</Text>
          </View>
        )}
      </View>

      {aviso && <Text style={styles.aviso}>{aviso}</Text>}

      <Pressable style={styles.boton} onPress={irAMiUbicacion} disabled={buscando}>
        <Ionicons name="locate" size={20} color={colores.primario} />
        <Text style={styles.botonTexto}>Usar mi ubicación actual</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: 10,
  },
  marco: {
    height: 260,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colores.borde,
  },
  mapa: {
    width: '100%',
    height: '100%',
  },
  pin: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    // sube el ícono para que la punta, y no el medio, marque el centro del mapa
    paddingBottom: ALTO_DEL_PIN,
  },
  buscando: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  buscandoTexto: {
    color: colores.textoSobreColor,
    fontSize: 14,
  },
  aviso: {
    color: colores.avisoTexto,
    fontSize: 14,
  },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colores.primario,
    backgroundColor: colores.primarioSuave,
    paddingVertical: 12,
    borderRadius: 10,
  },
  botonTexto: {
    color: colores.primario,
    fontSize: 16,
    fontWeight: '700',
  },
});
