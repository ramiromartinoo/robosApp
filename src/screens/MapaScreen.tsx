import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle } from 'react-native-maps';

import { ErrorDeApi } from '../api/cliente';
import { obtenerHeatmap } from '../api/reportes';
import { PuntoHeatmap } from '../api/tipos';
import { colores } from '../utils/tema';

// El mapa muestra solo lo reciente
const PERIODOS = [
  { horas: 3, nombre: '3 horas' },
  { horas: 24, nombre: '1 día' },
  { horas: 24 * 7, nombre: '7 días' },
];

// Vista inicial: toda la ciudad
const MAR_DEL_PLATA = { latitude: -38.0055, longitude: -57.5426, latitudeDelta: 0.12, longitudeDelta: 0.12 };

// De "pocos reportes" (ámbar) a "muchos" (rojo). Cada zona se dibuja como un círculo:
// cuanto más reportes tiene respecto de la zona más cargada, más grande, más rojo y más opaco.
const POCOS = [245, 158, 11];
const MUCHOS = [225, 29, 72];
const RADIO_MINIMO_M = 160;
const RADIO_EXTRA_M = 140;

function colorDeZona(intensidad: number): string {
  const [r, g, b] = POCOS.map((canal, i) => Math.round(canal + (MUCHOS[i] - canal) * intensidad));
  return `rgba(${r}, ${g}, ${b}, ${0.35 + 0.3 * intensidad})`;
}

export function MapaScreen() {
  const [horas, setHoras] = useState(24 * 7);
  const [puntos, setPuntos] = useState<PuntoHeatmap[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // se recarga al entrar a la pestaña y al cambiar el período
  useFocusEffect(
    useCallback(() => {
      let vigente = true;
      setCargando(true);
      obtenerHeatmap(horas)
        .then((resultado) => {
          if (vigente) {
            setPuntos(resultado);
            setError(null);
          }
        })
        .catch((e) => {
          if (vigente) {
            setError(e instanceof ErrorDeApi ? e.message : 'Ocurrió un error inesperado');
          }
        })
        .finally(() => {
          if (vigente) {
            setCargando(false);
          }
        });
      // si se cambia de período antes de que llegue la respuesta, la respuesta vieja se descarta
      return () => {
        vigente = false;
      };
    }, [horas]),
  );

  const maximo = Math.max(1, ...puntos.map((punto) => punto.peso));
  const total = puntos.reduce((suma, punto) => suma + punto.peso, 0);

  return (
    <View style={styles.pantalla}>
      <MapView style={styles.mapa} initialRegion={MAR_DEL_PLATA}>
        {puntos.map((punto) => {
          const intensidad = punto.peso / maximo;
          return (
            <Circle
              key={`${punto.latitud},${punto.longitud}`}
              center={{ latitude: punto.latitud, longitude: punto.longitud }}
              radius={RADIO_MINIMO_M + RADIO_EXTRA_M * intensidad}
              fillColor={colorDeZona(intensidad)}
              strokeWidth={0}
            />
          );
        })}
      </MapView>

      <View style={styles.arriba}>
        <View style={styles.periodos}>
          {PERIODOS.map((periodo) => {
            const elegido = periodo.horas === horas;
            return (
              <Pressable
                key={periodo.horas}
                style={[styles.periodo, elegido && styles.periodoElegido]}
                onPress={() => setHoras(periodo.horas)}
                accessibilityState={{ selected: elegido }}>
                <Text style={[styles.periodoTexto, elegido && styles.periodoTextoElegido]}>{periodo.nombre}</Text>
              </Pressable>
            );
          })}
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <View style={styles.abajo}>
        {cargando ? (
          <ActivityIndicator color={colores.primario} />
        ) : (
          <>
            <Text style={styles.total}>
              {total === 0
                ? 'No hay reportes en este período'
                : total === 1
                  ? '1 reporte en este período'
                  : `${total} reportes en este período`}
            </Text>
            <View style={styles.leyenda}>
              <Text style={styles.leyendaTexto}>Menos</Text>
              <View style={[styles.muestra, { backgroundColor: colorDeZona(0) }]} />
              <View style={[styles.muestra, { backgroundColor: colorDeZona(0.5) }]} />
              <View style={[styles.muestra, { backgroundColor: colorDeZona(1) }]} />
              <Text style={styles.leyendaTexto}>Más</Text>
            </View>
            <Text style={styles.nota}>Las zonas son aproximadas.</Text>
          </>
        )}
      </View>
    </View>
  );
}

const sombra = {
  shadowColor: '#000',
  shadowOpacity: 0.12,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
};

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
  },
  mapa: {
    flex: 1,
  },
  arriba: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    gap: 8,
  },
  periodos: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: colores.superficie,
    borderRadius: 999,
    padding: 4,
    ...sombra,
  },
  periodo: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  periodoElegido: {
    backgroundColor: colores.primario,
  },
  periodoTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: colores.textoSuave,
  },
  periodoTextoElegido: {
    color: colores.textoSobreColor,
  },
  error: {
    backgroundColor: colores.errorFondo,
    color: colores.errorTexto,
    fontSize: 15,
    padding: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  abajo: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: colores.superficie,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    alignItems: 'center',
    ...sombra,
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
    color: colores.texto,
  },
  leyenda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leyendaTexto: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  muestra: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  nota: {
    fontSize: 13,
    color: colores.textoSuave,
  },
});
