import { useRouter } from 'expo-router';
import { ReactNode, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ErrorDeApi } from '../api/cliente';
import { crearReporte } from '../api/reportes';
import { Categoria } from '../api/tipos';
import { GrillaDeCategorias } from '../components/GrillaDeCategorias';
import { SelectorDeFecha } from '../components/SelectorDeFecha';
import { Coordenada, SelectorDeUbicacion } from '../components/SelectorDeUbicacion';
import { aFechaDelBackend } from '../utils/fechas';
import { colores } from '../utils/tema';
import { distanciaDesdeElTelefono } from '../utils/useMiUbicacion';
import { obtenerZona } from '../utils/zona';

const LARGO_MINIMO = 10;
const LARGO_MAXIMO = 280;
// margen por si el reloj del celular está apenas adelantado respecto del servidor,
// que rechaza cualquier hecho "en el futuro"
const MARGEN_DE_RELOJ_MS = 60000;

export function PublicarScreen() {
  const router = useRouter();
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [fecha, setFecha] = useState(() => new Date());
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // cambiar la key vuelve a crear el mapa: así se reinicia después de publicar
  const [versionDelMapa, setVersionDelMapa] = useState(0);
  // va en ref: cambia todo el tiempo mientras se arrastra el mapa y no hace falta redibujar la pantalla
  const ubicacion = useRef<Coordenada | null>(null);

  // qué falta para poder publicar (null = está todo)
  const falta =
    categoria === null
      ? 'Elegí qué pasó para publicar.'
      : descripcion.trim().length < LARGO_MINIMO
        ? `Escribí al menos ${LARGO_MINIMO} caracteres para publicar.`
        : null;

  const publicar = async () => {
    if (falta || categoria === null || !ubicacion.current || enviando) {
      return;
    }
    setEnviando(true);
    setError(null);
    try {
      const limite = new Date(Date.now() - MARGEN_DE_RELOJ_MS);
      const { latitud, longitud } = ubicacion.current;
      await crearReporte({
        descripcion: descripcion.trim(),
        categoria,
        latitud,
        longitud,
        // calle y altura aproximada del pin
        zona: await obtenerZona(latitud, longitud),
        distanciaAlLugarM: await distanciaDesdeElTelefono({ latitud, longitud }),
        fechaHoraIncidente: aFechaDelBackend(fecha > limite ? limite : fecha),
      });
      setDescripcion('');
      setCategoria(null);
      setFecha(new Date());
      setVersionDelMapa((version) => version + 1);
      // vuelve al feed, que se recarga solo y muestra el reporte nuevo
      router.navigate('/');
    } catch (e) {
      if (e instanceof ErrorDeApi) {
        // si el backend detalla qué campo está mal, se muestra eso
        const detalles = Object.values(e.errores);
        setError(detalles.length > 0 ? detalles.join('\n') : e.message);
      } else {
        setError('Ocurrió un error inesperado');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Paso numero={1} titulo="¿Qué pasó?">
          <GrillaDeCategorias elegida={categoria} onElegir={setCategoria} />
        </Paso>

        <Paso numero={2} titulo="Contá brevemente qué pasó">
          <TextInput
            style={styles.texto}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Ej: 4 encapuchados vestidos de negro y blanco robaron una Hilux blanca."
            placeholderTextColor={colores.textoSuave}
            multiline
            maxLength={LARGO_MAXIMO}
          />
          <Text style={styles.contador}>
            {descripcion.length} / {LARGO_MAXIMO}
          </Text>
          <Text style={styles.ayuda}>
            Si pudiste verlos, contá cuántos eran, cómo estaban vestidos y en qué se movían. No incluyas nombres,
            patentes ni datos de otras personas.
          </Text>
        </Paso>

        <Paso numero={3} titulo="¿Cuándo ocurrió?">
          <SelectorDeFecha fecha={fecha} onCambio={setFecha} />
        </Paso>

        <Paso numero={4} titulo="¿Dónde ocurrió?">
          <Text style={styles.ayuda}>
            Escribí la dirección, usá tu ubicación o mové el mapa hasta que el pin quede sobre el lugar.
          </Text>
          <SelectorDeUbicacion
            key={versionDelMapa}
            onCambio={(coordenada) => {
              ubicacion.current = coordenada;
            }}
          />
        </Paso>

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      {/* pie fijo: el botón de publicar queda siempre a la vista */}
      <View style={styles.pie}>
        <Text style={styles.nota}>En el feed solo se muestra la zona aproximada, nunca la dirección exacta.</Text>
        <Pressable
          style={[styles.publicar, (falta !== null || enviando) && styles.publicarDeshabilitado]}
          onPress={publicar}
          disabled={falta !== null || enviando}>
          {enviando ? (
            <ActivityIndicator color={colores.textoSobreColor} />
          ) : (
            <Text style={styles.publicarTexto}>Publicar reporte</Text>
          )}
        </Pressable>
        {falta && <Text style={styles.nota}>{falta}</Text>}
      </View>
    </KeyboardAvoidingView>
  );
}

// Un paso del formulario: número en un círculo, título y contenido
function Paso({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <View style={styles.paso}>
      <View style={styles.pasoEncabezado}>
        <View style={styles.numero}>
          <Text style={styles.numeroTexto}>{numero}</Text>
        </View>
        <Text style={styles.titulo}>{titulo}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.superficie,
  },
  contenido: {
    padding: 16,
    paddingBottom: 28,
    gap: 26,
  },
  paso: {
    gap: 10,
  },
  pasoEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  numero: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroTexto: {
    color: colores.textoSobreColor,
    fontSize: 14,
    fontWeight: '700',
  },
  titulo: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colores.texto,
  },
  ayuda: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  texto: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
    borderRadius: 14,
    padding: 14,
    fontSize: 17,
    color: colores.texto,
    textAlignVertical: 'top',
  },
  contador: {
    fontSize: 13,
    color: colores.textoSuave,
    textAlign: 'right',
  },
  error: {
    backgroundColor: colores.errorFondo,
    color: colores.errorTexto,
    fontSize: 16,
    padding: 14,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pie: {
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  nota: {
    fontSize: 13,
    color: colores.textoSuave,
    textAlign: 'center',
  },
  publicar: {
    backgroundColor: colores.acento,
    minHeight: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publicarDeshabilitado: {
    backgroundColor: colores.deshabilitado,
  },
  publicarTexto: {
    color: colores.textoSobreColor,
    fontSize: 18,
    fontWeight: '700',
  },
});
