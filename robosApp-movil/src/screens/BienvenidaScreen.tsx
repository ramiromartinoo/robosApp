import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorDeApi } from '../api/cliente';
import { aceptarTerminos, obtenerTerminosVigentes, Terminos } from '../api/sesion';
import { useSesion } from '../sesion/SesionContext';
import { colores, esOscuro, sombra } from '../utils/tema';

// cuánto puede faltar para el final y que igual cuente como leído hasta abajo
const TOLERANCIA_PX = 24;

const mensajeDe = (e: unknown) => (e instanceof ErrorDeApi ? e.message : 'Ocurrió un error inesperado');

// Primera pantalla: presenta la app y pide aceptar los términos vigentes.
// También aparece cuando se publica una versión nueva de los términos.
export function BienvenidaScreen() {
  const { marcarTerminosAceptados } = useSesion();
  const [terminos, setTerminos] = useState<Terminos | null>(null);
  const [error, setError] = useState<string | null>(null);
  // para aceptar hay que haber llegado al final del texto y marcar la casilla
  const [llegoAlFinal, setLlegoAlFinal] = useState(false);
  const [acepta, setAcepta] = useState(false);
  const [enviando, setEnviando] = useState(false);
  // alto visible y alto total del texto: si entra entero, no hay nada que deslizar
  const altoVisible = useRef(0);
  const altoTotal = useRef(0);

  const cargar = useCallback(async () => {
    setError(null);
    try {
      setTerminos(await obtenerTerminosVigentes());
    } catch (e) {
      setError(mensajeDe(e));
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const revisarSiEntraEntero = () => {
    if (altoVisible.current > 0 && altoTotal.current > 0 && altoTotal.current <= altoVisible.current + TOLERANCIA_PX) {
      setLlegoAlFinal(true);
    }
  };

  const alDeslizar = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - TOLERANCIA_PX) {
      setLlegoAlFinal(true);
    }
  };

  const continuar = async () => {
    if (!terminos || !acepta || enviando) {
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      await aceptarTerminos(terminos.id);
      // al cambiar la sesión, la navegación pasa sola a la app
      marcarTerminosAceptados();
    } catch (e) {
      setError(mensajeDe(e));
      // 409: se publicó otra versión mientras leía; hay que leer la nueva
      if (e instanceof ErrorDeApi && e.status === 409) {
        setLlegoAlFinal(false);
        setAcepta(false);
        cargar();
      }
    } finally {
      setEnviando(false);
    }
  };

  const esBorrador = terminos?.version.toLowerCase().includes('borrador') ?? false;

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style={esOscuro ? 'light' : 'dark'} />
      <View style={styles.tarjeta}>
        <View style={styles.logo}>
          {/* el mismo radar del ícono de la app (blanco sobre transparente) */}
          <Image source={require('../../assets/splash-icon.png')} style={styles.logoImagen} />
        </View>
        <Text style={styles.titulo}>Cuidémonos entre vecinos</Text>
        <Text style={styles.bajada}>
          Avisá lo que pasó en Mar del Plata y enterate de lo que ocurre cerca tuyo.
        </Text>

        <View style={styles.encabezadoTerminos}>
          <Text style={styles.subtitulo} numberOfLines={1}>
            Términos y Condiciones{terminos ? ` · v${terminos.version.replace(/-borrador$/i, '')}` : ''}
          </Text>
          {esBorrador && (
            <View style={styles.borrador}>
              <Text style={styles.borradorTexto}>Borrador</Text>
            </View>
          )}
        </View>

        <View style={styles.caja}>
          {terminos ? (
            <ScrollView
              contentContainerStyle={styles.cajaContenido}
              onScroll={alDeslizar}
              scrollEventThrottle={100}
              onLayout={(evento) => {
                altoVisible.current = evento.nativeEvent.layout.height;
                revisarSiEntraEntero();
              }}
              onContentSizeChange={(_ancho, alto) => {
                altoTotal.current = alto;
                revisarSiEntraEntero();
              }}>
              <Text style={styles.texto}>{terminos.texto.trim()}</Text>
              <Text style={styles.fin}>Fin de los términos.</Text>
            </ScrollView>
          ) : error ? (
            <View style={styles.centrado}>
              <Pressable style={styles.reintentar} onPress={cargar}>
                <Text style={styles.reintentarTexto}>Reintentar</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.centrado}>
              <ActivityIndicator color={colores.primarioTexto} />
            </View>
          )}
        </View>

        <Text style={[styles.pista, llegoAlFinal && styles.pistaLista]}>
          {llegoAlFinal ? 'Listo, ya podés aceptar.' : 'Deslizá el texto hasta el final para poder aceptar.'}
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={styles.casillaFila}
          onPress={() => setAcepta((valor) => !valor)}
          disabled={!llegoAlFinal}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acepta, disabled: !llegoAlFinal }}>
          <View style={[styles.casilla, acepta && styles.casillaMarcada, !llegoAlFinal && styles.casillaBloqueada]}>
            {acepta && <Ionicons name="checkmark" size={18} color={colores.textoSobreColor} />}
          </View>
          <Text style={[styles.casillaTexto, !llegoAlFinal && styles.casillaTextoBloqueada]}>
            Leí y acepto los Términos y Condiciones y la Política de Privacidad.
          </Text>
        </Pressable>

        <Pressable
          style={[styles.continuar, (!acepta || enviando) && styles.continuarDeshabilitado]}
          onPress={continuar}
          disabled={!acepta || enviando}>
          {enviando ? (
            <ActivityIndicator color={colores.textoSobreColor} />
          ) : (
            <Text style={styles.continuarTexto}>Aceptar y continuar</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
    padding: 14,
  },
  tarjeta: {
    flex: 1,
    backgroundColor: colores.superficie,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 18,
    gap: 12,
    ...sombra,
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImagen: {
    width: 34,
    height: 34,
  },
  titulo: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    color: colores.texto,
  },
  bajada: {
    fontSize: 16,
    lineHeight: 22,
    color: colores.textoSuave,
  },
  encabezadoTerminos: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 4,
  },
  subtitulo: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
  },
  borrador: {
    backgroundColor: colores.avisoSuave,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  borradorTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.aviso,
  },
  // ocupa todo el espacio libre: el texto se desliza adentro
  caja: {
    flex: 1,
    minHeight: 120,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cajaContenido: {
    padding: 14,
    gap: 14,
  },
  texto: {
    fontSize: 15,
    lineHeight: 22,
    color: colores.texto,
  },
  fin: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
  },
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reintentar: {
    backgroundColor: colores.primario,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  reintentarTexto: {
    color: colores.textoSobreColor,
    fontSize: 16,
    fontWeight: '700',
  },
  pista: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  pistaLista: {
    color: colores.confirmar,
    fontWeight: '700',
  },
  error: {
    backgroundColor: colores.errorFondo,
    color: colores.errorTexto,
    fontSize: 15,
    padding: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  casillaFila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  casilla: {
    width: 26,
    height: 26,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
  },
  casillaMarcada: {
    backgroundColor: colores.primario,
  },
  casillaBloqueada: {
    borderColor: colores.deshabilitado,
  },
  casillaTexto: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    color: colores.texto,
  },
  casillaTextoBloqueada: {
    color: colores.textoSuave,
  },
  continuar: {
    backgroundColor: colores.acento,
    minHeight: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continuarDeshabilitado: {
    backgroundColor: colores.deshabilitado,
  },
  continuarTexto: {
    color: colores.textoSobreColor,
    fontSize: 18,
    fontWeight: '700',
  },
});
