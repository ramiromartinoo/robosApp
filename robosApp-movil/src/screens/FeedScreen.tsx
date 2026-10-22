import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { ErrorDeApi } from '../api/cliente';
import { denunciar, obtenerFeed, quitarVoto, votar } from '../api/reportes';
import { Categoria, MotivoDenuncia, Posteo, TipoConfirmacion } from '../api/tipos';
import { EstadoVacio } from '../components/EstadoVacio';
import { FiltrosDelFeed } from '../components/FiltrosDelFeed';
import { ItemPosteo } from '../components/ItemPosteo';
import { ModalDenuncia } from '../components/ModalDenuncia';
import { ModalUbicacion } from '../components/ModalUbicacion';
import { colores } from '../utils/tema';
import { useMiUbicacion } from '../utils/useMiUbicacion';

const mensajeDe = (e: unknown) => (e instanceof ErrorDeApi ? e.message : 'Ocurrió un error inesperado');
// 3 decimales ≈ 100 metros
const redondear = (coordenada: number) => Math.round(coordenada * 1000) / 1000;

export function FeedScreen() {
  const router = useRouter();
  const [posteos, setPosteos] = useState<Posteo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // id del reporte que se está por denunciar (null = hoja de motivos cerrada)
  const [aDenunciar, setADenunciar] = useState<number | null>(null);
  // reporte cuya zona se está viendo en el mapa (null = mapa cerrado)
  const [viendoUbicacion, setViendoUbicacion] = useState<Posteo | null>(null);
  // para mostrar a qué distancia ocurrió cada reporte
  const { miUbicacion, actualizar: actualizarUbicacion } = useMiUbicacion();

  // Filtros elegidos (null = sin filtrar)
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [radioKm, setRadioKm] = useState<number | null>(null);
  // Centro del filtro por distancia. Se redondea a ~100 m: alcanza para filtrar y evita mandarle
  // al servidor la posición exacta del usuario. Solo existe mientras ese filtro está activo.
  const centroLat = radioKm !== null && miUbicacion ? redondear(miUbicacion.latitud) : null;
  const centroLng = radioKm !== null && miUbicacion ? redondear(miUbicacion.longitud) : null;

  // van en refs porque onEndReached puede dispararse varias veces seguidas antes de que el estado se actualice
  const siguientePagina = useRef(0);
  const hayMas = useRef(true);
  const pidiendo = useRef(false);
  // cada carga "desde el principio" inaugura una generación; las respuestas de generaciones viejas
  // se descartan (por ejemplo, si se cambia un filtro mientras todavía llegaba la lista anterior)
  const generacion = useRef(0);

  const cargar = useCallback(
    async (desdeElPrincipio: boolean) => {
      if (!desdeElPrincipio && (pidiendo.current || !hayMas.current)) {
        return;
      }
      const miGeneracion = desdeElPrincipio ? ++generacion.current : generacion.current;
      pidiendo.current = true;
      setCargando(true);
      try {
        const pagina = await obtenerFeed(desdeElPrincipio ? 0 : siguientePagina.current, {
          categoria,
          cerca:
            radioKm !== null && centroLat !== null && centroLng !== null
              ? { latitud: centroLat, longitud: centroLng, radioKm }
              : null,
        });
        if (miGeneracion !== generacion.current) {
          return;
        }
        siguientePagina.current = pagina.pagina + 1;
        hayMas.current = !pagina.ultima;
        setPosteos((anteriores) => {
          if (desdeElPrincipio) {
            return pagina.contenido;
          }
          // si entró un posteo nuevo mientras se scrolleaba, la página siguiente puede repetir alguno
          const yaCargados = new Set(anteriores.map((posteo) => posteo.id));
          return [...anteriores, ...pagina.contenido.filter((posteo) => !yaCargados.has(posteo.id))];
        });
        setError(null);
      } catch (e) {
        if (miGeneracion === generacion.current) {
          setError(mensajeDe(e));
        }
      } finally {
        if (miGeneracion === generacion.current) {
          pidiendo.current = false;
          setCargando(false);
        }
      }
    },
    [categoria, radioKm, centroLat, centroLng],
  );

  const elegirRadio = async (km: number | null) => {
    // filtrar por distancia necesita saber dónde está el usuario
    if (km !== null && !miUbicacion && !(await actualizarUbicacion())) {
      Alert.alert(
        'Necesitamos tu ubicación',
        'Para ver solo los reportes cercanos, permití el acceso a la ubicación desde los ajustes del teléfono.',
      );
      return;
    }
    setRadioKm(km);
  };

  // se recarga al volver a esta pestaña (por ejemplo, después de publicar) y al cambiar un filtro
  useFocusEffect(
    useCallback(() => {
      cargar(true);
    }, [cargar]),
  );

  const refrescar = async () => {
    setRefrescando(true);
    // de paso se actualiza la ubicación, por si el usuario se movió
    await Promise.all([cargar(true), actualizarUbicacion()]);
    setRefrescando(false);
  };

  const alVotar = async (posteo: Posteo, tipo: TipoConfirmacion) => {
    const posteoId = posteo.id;
    try {
      // tocar el voto que ya estaba marcado lo anula (por si se tocó sin querer)
      const resultado = posteo.miVoto === tipo ? await quitarVoto(posteoId) : await votar(posteoId, tipo);
      // actualiza solo ese reporte con los números que devuelve el servidor
      setPosteos((actuales) =>
        actuales.map((posteo) =>
          posteo.id === posteoId
            ? {
                ...posteo,
                confirmaciones: resultado.confirmaciones,
                negaciones: resultado.negaciones,
                miVoto: resultado.miVoto,
              }
            : posteo,
        ),
      );
    } catch (e) {
      Alert.alert('No se pudo registrar tu voto', mensajeDe(e));
    }
  };

  const alDenunciar = async (motivo: MotivoDenuncia) => {
    const posteoId = aDenunciar;
    setADenunciar(null);
    if (posteoId === null) {
      return;
    }
    try {
      await denunciar(posteoId, motivo);
      Alert.alert('Denuncia enviada', 'Gracias. Un administrador la va a revisar.');
    } catch (e) {
      Alert.alert('No se pudo enviar la denuncia', mensajeDe(e));
    }
  };

  return (
    <View style={styles.pantalla}>
      <FiltrosDelFeed
        categoria={categoria}
        radioKm={radioKm}
        onCategoria={setCategoria}
        onRadio={elegirRadio}
      />

      {error && (
        <View style={styles.error}>
          <Text style={styles.errorTexto}>{error}</Text>
          <Pressable style={styles.boton} onPress={() => cargar(posteos.length === 0)}>
            <Text style={styles.botonTexto}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={posteos}
        keyExtractor={(posteo) => String(posteo.id)}
        renderItem={({ item }) => (
          <ItemPosteo
            posteo={item}
            miUbicacion={miUbicacion}
            onVotar={(tipo) => alVotar(item, tipo)}
            onDenunciar={() => setADenunciar(item.id)}
            onVerUbicacion={() => setViendoUbicacion(item)}
            onVerMisReportes={() => router.push('/mis-reportes')}
          />
        )}
        contentContainerStyle={styles.lista}
        // scroll infinito: pide la página siguiente al acercarse al final
        onEndReached={() => cargar(false)}
        onEndReachedThreshold={0.5}
        // deslizar hacia abajo para actualizar
        refreshing={refrescando}
        onRefresh={refrescar}
        ListEmptyComponent={
          !cargando && !error ? (
            categoria !== null || radioKm !== null ? (
              <EstadoVacio
                icono="funnel-outline"
                titulo="No hay reportes con estos filtros"
                texto="Probá con una distancia mayor o con otro tipo de hecho."
                accion={{
                  texto: 'Quitar filtros',
                  onPress: () => {
                    setCategoria(null);
                    setRadioKm(null);
                  },
                }}
              />
            ) : (
              <EstadoVacio
                icono="shield-checkmark-outline"
                titulo="Todavía no hay reportes"
                texto="Cuando un vecino reporte algo, lo vas a ver acá."
                accion={{ texto: 'Hacer un reporte', onPress: () => router.push('/publicar') }}
              />
            )
          ) : null
        }
        ListFooterComponent={
          cargando && !refrescando ? <ActivityIndicator style={styles.cargando} color={colores.primarioTexto} /> : null
        }
      />

      <ModalUbicacion posteo={viendoUbicacion} onCerrar={() => setViendoUbicacion(null)} />
      <ModalDenuncia visible={aDenunciar !== null} onElegir={alDenunciar} onCerrar={() => setADenunciar(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  lista: {
    padding: 14,
    paddingBottom: 28,
    gap: 14,
  },
  cargando: {
    marginVertical: 24,
  },
  error: {
    backgroundColor: colores.errorFondo,
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  errorTexto: {
    color: colores.errorTexto,
    fontSize: 16,
  },
  boton: {
    backgroundColor: colores.primario,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonTexto: {
    color: colores.textoSobreColor,
    fontSize: 16,
    fontWeight: '600',
  },
});
