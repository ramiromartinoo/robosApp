import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ErrorDeApi } from '../api/cliente';
import { enviarSugerencia, obtenerMisSugerencias, Sugerencia } from '../api/sugerencias';
import { BotonCargarMas } from '../components/admin/Comunes';
import { haceCuanto } from '../utils/fechas';
import { colores, sombra } from '../utils/tema';
import { usePaginado } from '../utils/usePaginado';

const LARGO_MAXIMO = 500;

const mensajeDe = (e: unknown) => {
  if (e instanceof ErrorDeApi) {
    const detalles = Object.values(e.errores);
    return detalles.length > 0 ? detalles.join('\n') : e.message;
  }
  return 'Ocurrió un error inesperado';
};

// Enviar una sugerencia sobre la app y ver las anteriores con la respuesta del administrador
export function SugerenciasScreen() {
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);
  const [errorAlEnviar, setErrorAlEnviar] = useState<string | null>(null);

  // las anteriores se cargan de a páginas, con "Cargar más" al final
  const {
    items: sugerencias,
    setItems: setSugerencias,
    cargando,
    cargandoMas,
    error: errorAlCargar,
    hayMas,
    cargarMas,
    recargar: cargar,
    refrescando,
    refrescar,
  } = usePaginado(obtenerMisSugerencias);

  const enviar = async () => {
    if (texto.trim().length === 0 || enviando) {
      return;
    }
    setEnviando(true);
    setErrorAlEnviar(null);
    setEnviada(false);
    try {
      const nueva = await enviarSugerencia(texto.trim());
      setSugerencias((actuales) => [nueva, ...actuales]);
      setTexto('');
      setEnviada(true);
    } catch (e) {
      setErrorAlEnviar(mensajeDe(e));
    } finally {
      setEnviando(false);
    }
  };

  const vacio = texto.trim().length === 0;

  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} tintColor={colores.primario} />}>
        <View style={styles.tarjeta}>
          <Text style={styles.titulo}>¿Cómo podemos mejorar la app?</Text>
          <Text style={styles.ayuda}>Contanos qué te gustaría que cambie o qué te está faltando.</Text>
          <TextInput
            style={styles.texto}
            value={texto}
            onChangeText={(nuevo) => {
              setTexto(nuevo);
              setEnviada(false);
            }}
            placeholder="Ej: Me gustaría poder buscar por barrio."
            placeholderTextColor={colores.textoSuave}
            multiline
            maxLength={LARGO_MAXIMO}
          />
          <Text style={styles.contador}>
            {texto.length} / {LARGO_MAXIMO}
          </Text>

          {errorAlEnviar && <Text style={styles.error}>{errorAlEnviar}</Text>}
          {enviada && (
            <View style={styles.exito}>
              <Ionicons name="checkmark-circle" size={18} color={colores.confirmar} />
              <Text style={styles.exitoTexto}>¡Gracias! Recibimos tu sugerencia.</Text>
            </View>
          )}

          <Pressable
            style={[styles.enviar, (vacio || enviando) && styles.enviarDeshabilitado]}
            onPress={enviar}
            disabled={vacio || enviando}>
            {enviando ? (
              <ActivityIndicator color={colores.textoSobreColor} />
            ) : (
              <Text style={styles.enviarTexto}>Enviar sugerencia</Text>
            )}
          </Pressable>
        </View>

        <Text style={styles.seccion}>Tus sugerencias</Text>

        {cargando ? (
          <ActivityIndicator style={styles.cargando} color={colores.primario} />
        ) : errorAlCargar ? (
          <View style={styles.tarjeta}>
            <Text style={styles.error}>{errorAlCargar}</Text>
            <Pressable style={styles.enviar} onPress={cargar}>
              <Text style={styles.enviarTexto}>Reintentar</Text>
            </Pressable>
          </View>
        ) : sugerencias.length === 0 ? (
          <Text style={styles.vacio}>Todavía no enviaste ninguna.</Text>
        ) : (
          sugerencias.map((sugerencia) => <TarjetaDeSugerencia key={sugerencia.id} sugerencia={sugerencia} />)
        )}
        {!errorAlCargar && (
          <BotonCargarMas hayMas={hayMas} cargando={cargandoMas} onPress={cargarMas} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function TarjetaDeSugerencia({ sugerencia }: { sugerencia: Sugerencia }) {
  const respondida = sugerencia.estado === 'RESPONDIDA';

  return (
    <View style={styles.tarjeta}>
      <View style={styles.encabezado}>
        <Text style={styles.fecha}>Enviada {haceCuanto(sugerencia.fecha)}</Text>
        <View style={[styles.estado, { backgroundColor: respondida ? colores.confirmarSuave : colores.avisoSuave }]}>
          <Text style={[styles.estadoTexto, { color: respondida ? colores.confirmar : colores.aviso }]}>
            {respondida ? 'Respondida' : 'Pendiente'}
          </Text>
        </View>
      </View>

      <Text style={styles.sugerencia}>{sugerencia.texto}</Text>

      {sugerencia.respuesta && (
        <View style={styles.respuesta}>
          <Text style={styles.respuestaTitulo}>Respuesta del equipo</Text>
          <Text style={styles.respuestaTexto}>{sugerencia.respuesta}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: 14,
    paddingBottom: 32,
    gap: 14,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 16,
    gap: 10,
    ...sombra,
  },
  titulo: {
    fontSize: 19,
    fontWeight: '700',
    color: colores.texto,
  },
  ayuda: {
    fontSize: 15,
    color: colores.textoSuave,
  },
  texto: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: colores.borde,
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
    fontSize: 15,
    padding: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  exito: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colores.confirmarSuave,
    padding: 12,
    borderRadius: 10,
  },
  exitoTexto: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colores.confirmar,
  },
  enviar: {
    backgroundColor: colores.acento,
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enviarDeshabilitado: {
    backgroundColor: colores.deshabilitado,
  },
  enviarTexto: {
    color: colores.textoSobreColor,
    fontSize: 17,
    fontWeight: '700',
  },
  seccion: {
    fontSize: 17,
    fontWeight: '700',
    color: colores.texto,
    marginTop: 8,
  },
  cargando: {
    marginTop: 20,
  },
  vacio: {
    fontSize: 15,
    color: colores.textoSuave,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  fecha: {
    flexShrink: 1,
    fontSize: 14,
    color: colores.textoSuave,
  },
  estado: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  estadoTexto: {
    fontSize: 13,
    fontWeight: '700',
  },
  sugerencia: {
    fontSize: 16,
    lineHeight: 23,
    color: colores.texto,
  },
  respuesta: {
    backgroundColor: colores.primarioSuave,
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  respuestaTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: colores.primario,
  },
  respuestaTexto: {
    fontSize: 16,
    lineHeight: 23,
    color: colores.texto,
  },
});
