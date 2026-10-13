import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Circle } from 'react-native-maps';

import { obtenerEstadisticas } from '../../api/admin';
import { EstadoDeLista, Filtros, PantallaConLista, Tarjeta } from '../../components/admin/Comunes';
import { CATEGORIAS } from '../../utils/categorias';
import { colores } from '../../utils/tema';
import { useCarga } from '../../utils/useCarga';

const PERIODOS = [
  { valor: 7, nombre: '7 días' },
  { valor: 30, nombre: '30 días' },
  { valor: 90, nombre: '3 meses' },
];

const MAR_DEL_PLATA = { latitude: -38.0055, longitude: -57.5426, latitudeDelta: 0.14, longitudeDelta: 0.14 };
// las zonas de las estadísticas son de ~1 km
const RADIO_MINIMO_M = 350;
const RADIO_EXTRA_M = 350;

// Resumen del período: total, reportes por tipo de hecho y zonas con más reportes
export function AdminEstadisticasScreen() {
  const [dias, setDias] = useState(30);
  const pedir = useCallback(() => obtenerEstadisticas(dias), [dias]);
  const { datos, cargando, error, recargar, refrescando, refrescar } = useCarga(pedir);

  const maximoPorCategoria = Math.max(1, ...(datos?.porCategoria.map((fila) => fila.cantidad) ?? []));
  const maximoPorZona = Math.max(1, ...(datos?.porZona.map((zona) => zona.peso) ?? []));

  return (
    <PantallaConLista refrescando={refrescando} onRefrescar={refrescar}>
      <Filtros opciones={PERIODOS} elegida={dias} onElegir={setDias} />

      <EstadoDeLista cargando={cargando} error={error} vacia={false} textoVacia="" onReintentar={recargar} />

      {!cargando && !error && datos && (
        <>
          <Tarjeta>
            <Text style={styles.numero}>{datos.totalPosteos}</Text>
            <Text style={styles.detalle}>
              {datos.totalPosteos === 1 ? 'reporte en el período' : 'reportes en el período'} (sin contar los
              eliminados)
            </Text>
          </Tarjeta>

          <Tarjeta>
            <Text style={styles.titulo}>Por tipo de hecho</Text>
            {datos.porCategoria.length === 0 ? (
              <Text style={styles.detalle}>Sin reportes en el período.</Text>
            ) : (
              datos.porCategoria.map((fila) => {
                const categoria = CATEGORIAS[fila.categoria];
                return (
                  <View key={fila.categoria} style={styles.fila}>
                    <View style={styles.filaEncabezado}>
                      <Text style={styles.filaNombre}>{categoria.nombre}</Text>
                      <Text style={styles.filaCantidad}>{fila.cantidad}</Text>
                    </View>
                    <View style={styles.barraFondo}>
                      <View
                        style={[
                          styles.barra,
                          { width: `${(fila.cantidad / maximoPorCategoria) * 100}%`, backgroundColor: categoria.color },
                        ]}
                      />
                    </View>
                  </View>
                );
              })
            )}
          </Tarjeta>

          <Tarjeta>
            <Text style={styles.titulo}>Zonas con más reportes</Text>
            <Text style={styles.detalle}>Cuanto más grande y oscuro el círculo, más reportes hubo en esa zona.</Text>
            <View style={styles.marco}>
              <MapView style={styles.mapa} initialRegion={MAR_DEL_PLATA}>
                {datos.porZona.map((zona) => {
                  const intensidad = zona.peso / maximoPorZona;
                  const color = `rgba(27, 77, 62, ${0.2 + 0.4 * intensidad})`;
                  return (
                    <Circle
                      key={`${zona.latitud},${zona.longitud}`}
                      center={{ latitude: zona.latitud, longitude: zona.longitud }}
                      radius={RADIO_MINIMO_M + RADIO_EXTRA_M * intensidad}
                      fillColor={color}
                      // mismo color que el relleno: con ancho 0 el mapa de iPhone dibuja un borde negro
                      strokeColor={color}
                      strokeWidth={1}
                    />
                  );
                })}
              </MapView>
            </View>
          </Tarjeta>
        </>
      )}
    </PantallaConLista>
  );
}

const styles = StyleSheet.create({
  numero: {
    fontSize: 44,
    fontWeight: '800',
    color: colores.primario,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: colores.texto,
  },
  detalle: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  fila: {
    gap: 6,
  },
  filaEncabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filaNombre: {
    fontSize: 15,
    color: colores.texto,
  },
  filaCantidad: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
  },
  barraFondo: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colores.fondo,
    overflow: 'hidden',
  },
  barra: {
    height: '100%',
    borderRadius: 5,
  },
  marco: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colores.borde,
  },
  mapa: {
    width: '100%',
    height: '100%',
  },
});
