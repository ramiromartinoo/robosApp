import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { ErrorDeApi } from '../api/cliente';
import { denunciar, obtenerFeed, quitarVoto, votar } from '../api/reportes';
import { MotivoDenuncia, Posteo, TipoConfirmacion } from '../api/tipos';
import { ItemPosteo } from '../components/ItemPosteo';
import { ModalDenuncia } from '../components/ModalDenuncia';
import { ModalUbicacion } from '../components/ModalUbicacion';
import { colores } from '../utils/tema';
import { useMiUbicacion } from '../utils/useMiUbicacion';

const mensajeDe = (e: unknown) => (e instanceof ErrorDeApi ? e.message : 'Ocurrió un error inesperado');

export function FeedScreen() {
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

  // van en refs porque onEndReached puede dispararse varias veces seguidas antes de que el estado se actualice
  const siguientePagina = useRef(0);
  const hayMas = useRef(true);
  const pidiendo = useRef(false);

  const cargar = useCallback(async (desdeElPrincipio: boolean) => {
    if (pidiendo.current || (!desdeElPrincipio && !hayMas.current)) {
      return;
    }
    pidiendo.current = true;
    setCargando(true);
    try {
      const pagina = await obtenerFeed(desdeElPrincipio ? 0 : siguientePagina.current);
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
      setError(mensajeDe(e));
    } finally {
      pidiendo.current = false;
      setCargando(false);
    }
  }, []);

  // se recarga cada vez que se vuelve a esta pestaña (por ejemplo, después de publicar)
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
          !cargando && !error ? <Text style={styles.vacio}>Todavía no hay reportes.</Text> : null
        }
        ListFooterComponent={
          cargando && !refrescando ? <ActivityIndicator style={styles.cargando} color={colores.primario} /> : null
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
  vacio: {
    textAlign: 'center',
    color: colores.textoSuave,
    fontSize: 16,
    marginTop: 48,
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
