import Ionicons from '@expo/vector-icons/Ionicons';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Region } from 'react-native-maps';

import { colores } from '../utils/tema';

export type Coordenada = { latitud: number; longitud: number };

// Centro de Mar del Plata: punto de partida si no hay GPS
const CENTRO_MDP: Coordenada = { latitud: -38.0055, longitud: -57.5426 };
// cuánto mapa se ve: ~0.01 grados son unas 10 cuadras
const ZOOM = 0.01;
// al llegar por una dirección se acerca más, para poder afinar el pin
const ZOOM_DE_DIRECCION = 0.004;
const ALTO_DEL_PIN = 40;

// Rectángulo que contiene a Mar del Plata y alrededores: una dirección que cae afuera
// es casi seguro una calle con el mismo nombre en otra ciudad
const ZONA_VALIDA = { latMin: -38.2, latMax: -37.85, lngMin: -57.8, lngMax: -57.45 };

const aRegion = (coordenada: Coordenada, zoom = ZOOM): Region => ({
  latitude: coordenada.latitud,
  longitude: coordenada.longitud,
  latitudeDelta: zoom,
  longitudeDelta: zoom,
});

// Mapa con un pin fijo en el centro: la ubicación elegida es la que queda debajo del pin.
// Hay tres formas de llegar al lugar, que se pueden combinar: el GPS (arranca ahí),
// escribir una dirección, o arrastrar el mapa.
export function SelectorDeUbicacion({ onCambio }: { onCambio: (coordenada: Coordenada) => void }) {
  const mapa = useRef<MapView>(null);
  const [direccion, setDireccion] = useState('');
  // qué se está buscando en este momento, para mostrar el cartel sobre el mapa
  const [buscando, setBuscando] = useState<'gps' | 'direccion' | null>('gps');
  const [aviso, setAviso] = useState<string | null>(null);

  const irA = (coordenada: Coordenada, zoom?: number) => {
    mapa.current?.animateToRegion(aRegion(coordenada, zoom), 400);
    onCambio(coordenada);
  };

  const irAMiUbicacion = async () => {
    setBuscando('gps');
    setAviso(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setAviso('Sin permiso de ubicación. Escribí la dirección o mové el mapa hasta el lugar del hecho.');
        return;
      }
      const posicion = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      irA({ latitud: posicion.coords.latitude, longitud: posicion.coords.longitude });
    } catch {
      setAviso('No pudimos obtener tu ubicación. Escribí la dirección o mové el mapa hasta el lugar del hecho.');
    } finally {
      setBuscando(null);
    }
  };

  const buscarDireccion = async () => {
    const texto = direccion.trim();
    if (texto.length === 0 || buscando) {
      return;
    }
    Keyboard.dismiss();
    setBuscando('direccion');
    setAviso(null);
    try {
      // en Android el buscador de direcciones del sistema exige el permiso de ubicación
      if (Platform.OS === 'android') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setAviso('Para buscar direcciones hace falta el permiso de ubicación. Podés mover el mapa a mano.');
          return;
        }
      }
      // se le agrega la ciudad para que no encuentre la misma calle en otro lado
      const resultados = await Location.geocodeAsync(`${texto}, Mar del Plata, Buenos Aires, Argentina`);
      const enLaCiudad = resultados.find(
        (resultado) =>
          resultado.latitude >= ZONA_VALIDA.latMin &&
          resultado.latitude <= ZONA_VALIDA.latMax &&
          resultado.longitude >= ZONA_VALIDA.lngMin &&
          resultado.longitude <= ZONA_VALIDA.lngMax,
      );
      if (!enLaCiudad) {
        setAviso('No encontramos esa dirección en Mar del Plata. Probá con calle y altura, o mové el mapa.');
        return;
      }
      irA({ latitud: enLaCiudad.latitude, longitud: enLaCiudad.longitude }, ZOOM_DE_DIRECCION);
    } catch {
      setAviso('No pudimos buscar la dirección. Revisá tu conexión o mové el mapa hasta el lugar.');
    } finally {
      setBuscando(null);
    }
  };

  useEffect(() => {
    onCambio(CENTRO_MDP);
    irAMiUbicacion();
    // solo al montar
  }, []);

  const sinDireccion = direccion.trim().length === 0;

  return (
    <View style={styles.contenedor}>
      <View style={styles.buscador}>
        <TextInput
          style={styles.direccion}
          value={direccion}
          onChangeText={setDireccion}
          placeholder="Calle y altura. Ej: Av. Colón 2300"
          placeholderTextColor={colores.textoSuave}
          returnKeyType="search"
          onSubmitEditing={buscarDireccion}
          autoCorrect={false}
        />
        <Pressable
          style={[styles.buscar, (sinDireccion || buscando !== null) && styles.buscarDeshabilitado]}
          onPress={buscarDireccion}
          disabled={sinDireccion || buscando !== null}
          accessibilityRole="button"
          accessibilityLabel="Buscar dirección">
          <Ionicons name="search" size={20} color={colores.textoSobreColor} />
          <Text style={styles.buscarTexto}>Buscar</Text>
        </Pressable>
      </View>

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
            <Text style={styles.buscandoTexto}>
              {buscando === 'gps' ? 'Buscando tu ubicación…' : 'Buscando la dirección…'}
            </Text>
          </View>
        )}
      </View>

      {aviso && <Text style={styles.aviso}>{aviso}</Text>}

      <Pressable style={styles.boton} onPress={irAMiUbicacion} disabled={buscando !== null}>
        <Ionicons name="locate" size={20} color={colores.primarioTexto} />
        <Text style={styles.botonTexto}>Usar mi ubicación actual</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: 10,
  },
  buscador: {
    flexDirection: 'row',
    gap: 8,
  },
  direccion: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colores.texto,
  },
  buscar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colores.primario,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  buscarDeshabilitado: {
    backgroundColor: colores.deshabilitado,
  },
  buscarTexto: {
    color: colores.textoSobreColor,
    fontSize: 16,
    fontWeight: '700',
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
    backgroundColor: colores.veloFuerte,
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
    color: colores.primarioTexto,
    fontSize: 16,
    fontWeight: '700',
  },
});
