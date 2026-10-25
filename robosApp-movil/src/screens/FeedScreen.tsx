import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import type { NavigationProp, NavigationState, ParamListBase } from 'expo-router/react-navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { ErrorDeApi } from '../api/cliente';
import { denunciar, obtenerFeed, OrdenDelFeed, quitarVoto, votar } from '../api/reportes';
import { Categoria, MotivoDenuncia, Posteo, TipoConfirmacion } from '../api/tipos';
import { EstadoVacio } from '../components/EstadoVacio';
import { FiltrosDelFeed } from '../components/FiltrosDelFeed';
import { PestaniasDeOrden } from '../components/PestaniasDeOrden';
import { ItemPosteo } from '../components/ItemPosteo';
import { ModalDenuncia } from '../components/ModalDenuncia';
import { ModalUbicacion } from '../components/ModalUbicacion';
import { colores } from '../utils/tema';
import { useMiUbicacion } from '../utils/useMiUbicacion';

const mensajeDe = (e: unknown) => (e instanceof ErrorDeApi ? e.message : 'Ocurrió un error inesperado');
// 3 decimales ≈ 100 metros
const redondear = (coordenada: number) => Math.round(coordenada * 1000) / 1000;

// Navegación de una pestaña: además de los eventos comunes, avisa cuando se toca su botón abajo
type NavegacionDePestania = NavigationProp<
  ParamListBase,
  string,
  undefined,
  NavigationState,
  {},
  { tabPress: { data: undefined; canPreventDefault: true } }
>;

export function FeedScreen() {
  const router = useRouter();
  const navigation = useNavigation<NavegacionDePestania>();
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
  const [orden, setOrden] = useState<OrdenDelFeed>('HECHO');
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
          orden,
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
    [categoria, radioKm, centroLat, centroLng, orden],
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

  // Tocar "Inicio" estando ya en Inicio vuelve al principio de la lista y la recarga, como en Twitter.
  // Primero sube y recién arriba recarga: si recargara mientras sube, la lista nueva corta la animación
  // a mitad de camino. Va en ref para que use siempre la versión actual de refrescar (con los filtros del momento).
  const lista = useRef<FlatList<Posteo>>(null);
  const refrescarRef = useRef(refrescar);
  refrescarRef.current = refrescar;
  const desplazamiento = useRef(0);
  const subiendo = useRef(false);
  // por si la animación no llega arriba (por ejemplo, en una lista muy larga): salta de golpe y recarga igual
  const plazoDeSubida = useRef<ReturnType<typeof setTimeout> | null>(null);

  const terminarSubida = useCallback((recargar: boolean) => {
    subiendo.current = false;
    if (plazoDeSubida.current) {
      clearTimeout(plazoDeSubida.current);
      plazoDeSubida.current = null;
    }
    if (recargar) {
      refrescarRef.current();
    }
  }, []);

  useEffect(
    () =>
      navigation.addListener('tabPress', () => {
        // si se viene desde otra pestaña, useFocusEffect ya recarga y no hace falta subir
        if (!navigation.isFocused()) {
          return;
        }
        if (desplazamiento.current <= 1) {
          terminarSubida(true);
          return;
        }
        subiendo.current = true;
        lista.current?.scrollToOffset({ offset: 0, animated: true });
        if (plazoDeSubida.current) {
          clearTimeout(plazoDeSubida.current);
        }
        plazoDeSubida.current = setTimeout(() => {
          lista.current?.scrollToOffset({ offset: 0, animated: false });
          terminarSubida(true);
        }, 1500);
      }),
    [navigation, terminarSubida],
  );

  // no dejar un plazo pendiente si la pantalla se desmonta
  useEffect(() => () => terminarSubida(false), [terminarSubida]);

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
      <PestaniasDeOrden orden={orden} onOrden={setOrden} />
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
        ref={lista}
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
        // para saber cuándo la subida por tocar "Inicio" llegó arriba
        onScroll={(evento) => {
          desplazamiento.current = evento.nativeEvent.contentOffset.y;
          if (subiendo.current && desplazamiento.current <= 1) {
            terminarSubida(true);
          }
        }}
        scrollEventThrottle={16}
        // si el usuario agarra la lista mientras sube, manda él: no se recarga ni se lo lleva arriba
        onScrollBeginDrag={() => {
          if (subiendo.current) {
            terminarSubida(false);
          }
        }}
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
