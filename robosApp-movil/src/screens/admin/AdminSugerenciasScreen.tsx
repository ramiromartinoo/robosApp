import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { obtenerSugerencias, responderSugerencia } from '../../api/admin';
import { mensajeDeError } from '../../api/cliente';
import { Sugerencia } from '../../api/sugerencias';
import {
  Boton,
  BotonCargarMas,
  EstadoDeLista,
  Etiqueta,
  Filtros,
  PantallaConLista,
  Tarjeta,
} from '../../components/admin/Comunes';
import { haceCuanto } from '../../utils/fechas';
import { colores } from '../../utils/tema';
import { usePaginado } from '../../utils/usePaginado';

const LARGO_MAXIMO = 500;

const FILTROS = [
  { valor: 'pendientes', nombre: 'Pendientes' },
  { valor: 'todas', nombre: 'Todas' },
];

// Sugerencias de los usuarios, con un cuadro para responder cada una
export function AdminSugerenciasScreen() {
  const [filtro, setFiltro] = useState('pendientes');
  const pedir = useCallback((pagina: number) => obtenerSugerencias(filtro === 'pendientes', pagina), [filtro]);
  const {
    items: lista,
    setItems,
    cargando,
    cargandoMas,
    error,
    hayMas,
    cargarMas,
    recargar,
    refrescando,
    refrescar,
  } = usePaginado(pedir);

  const alResponder = (respondida: Sugerencia) => {
    setItems((actuales) =>
      filtro === 'pendientes'
        ? // ya no está pendiente: sale de esta vista
          actuales.filter((otra) => otra.id !== respondida.id)
        : actuales.map((otra) => (otra.id === respondida.id ? respondida : otra)),
    );
  };

  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PantallaConLista refrescando={refrescando} onRefrescar={refrescar}>
        <Filtros opciones={FILTROS} elegida={filtro} onElegir={setFiltro} />

        <EstadoDeLista
          cargando={cargando}
          error={error}
          vacia={lista.length === 0}
          textoVacia={filtro === 'pendientes' ? 'No hay sugerencias sin responder.' : 'Todavía no hay sugerencias.'}
          onReintentar={recargar}
        />

        {!cargando &&
          !error &&
          lista.map((sugerencia) => (
            <TarjetaDeSugerencia key={sugerencia.id} sugerencia={sugerencia} onRespondida={alResponder} />
          ))}
        {!error && <BotonCargarMas hayMas={hayMas} cargando={cargandoMas} onPress={cargarMas} />}
      </PantallaConLista>
    </KeyboardAvoidingView>
  );
}

function TarjetaDeSugerencia({
  sugerencia,
  onRespondida,
}: {
  sugerencia: Sugerencia;
  onRespondida: (respondida: Sugerencia) => void;
}) {
  const [respuesta, setRespuesta] = useState(sugerencia.respuesta ?? '');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const respondida = sugerencia.estado === 'RESPONDIDA';
  const sinCambios = respuesta.trim().length === 0 || respuesta.trim() === (sugerencia.respuesta ?? '');

  const responder = async () => {
    setEnviando(true);
    setError(null);
    try {
      onRespondida(await responderSugerencia(sugerencia.id, respuesta.trim()));
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Tarjeta>
      <View style={styles.encabezado}>
        <Text style={styles.detalle} numberOfLines={1}>
          {sugerencia.autor} · {haceCuanto(sugerencia.fecha)}
        </Text>
        <Etiqueta
          texto={respondida ? 'Respondida' : 'Pendiente'}
          color={respondida ? colores.confirmar : colores.aviso}
          fondo={respondida ? colores.confirmarSuave : colores.avisoSuave}
        />
      </View>

      <Text style={styles.texto}>{sugerencia.texto}</Text>

      <TextInput
        style={styles.respuesta}
        value={respuesta}
        onChangeText={setRespuesta}
        placeholder="Escribí la respuesta"
        placeholderTextColor={colores.textoSuave}
        multiline
        maxLength={LARGO_MAXIMO}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Boton
        texto={respondida ? 'Cambiar respuesta' : 'Responder'}
        tipo="primario"
        onPress={responder}
        deshabilitado={sinCambios || enviando}
      />
    </Tarjeta>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  detalle: {
    flexShrink: 1,
    fontSize: 14,
    color: colores.textoSuave,
  },
  texto: {
    fontSize: 17,
    lineHeight: 24,
    color: colores.texto,
  },
  respuesta: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colores.texto,
    textAlignVertical: 'top',
  },
  error: {
    backgroundColor: colores.errorFondo,
    color: colores.errorTexto,
    fontSize: 15,
    padding: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
