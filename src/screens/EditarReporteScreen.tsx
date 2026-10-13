import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
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
import { editarReporte } from '../api/reportes';
import { Categoria } from '../api/tipos';
import { GrillaDeCategorias } from '../components/GrillaDeCategorias';
import { SelectorDeFecha } from '../components/SelectorDeFecha';
import { aFechaDelBackend } from '../utils/fechas';
import { colores } from '../utils/tema';

const LARGO_MINIMO = 10;
const LARGO_MAXIMO = 280;
// igual que al publicar: margen por si el reloj del celular está apenas adelantado
const MARGEN_DE_RELOJ_MS = 60000;

// Los datos actuales del reporte llegan como parámetros desde "Mis reportes"
type Parametros = {
  id: string;
  descripcion: string;
  categoria: Categoria;
  fechaHoraIncidente: string;
};

export function EditarReporteScreen() {
  const router = useRouter();
  const original = useLocalSearchParams<Parametros>();
  const [descripcion, setDescripcion] = useState(original.descripcion ?? '');
  const [categoria, setCategoria] = useState<Categoria>(original.categoria);
  const [fecha, setFecha] = useState(() => new Date(original.fechaHoraIncidente));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const falta =
    descripcion.trim().length < LARGO_MINIMO ? `Escribí al menos ${LARGO_MINIMO} caracteres para guardar.` : null;

  const guardar = async () => {
    if (falta || guardando) {
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const limite = new Date(Date.now() - MARGEN_DE_RELOJ_MS);
      await editarReporte(Number(original.id), {
        descripcion: descripcion.trim(),
        categoria,
        fechaHoraIncidente: aFechaDelBackend(fecha > limite ? limite : fecha),
      });
      // vuelve a "Mis reportes", que se recarga y muestra los cambios
      router.back();
    } catch (e) {
      if (e instanceof ErrorDeApi) {
        const detalles = Object.values(e.errores);
        setError(detalles.length > 0 ? detalles.join('\n') : e.message);
      } else {
        setError('Ocurrió un error inesperado');
      }
    } finally {
      setGuardando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <View style={styles.campo}>
          <Text style={styles.titulo}>¿Qué pasó?</Text>
          <GrillaDeCategorias elegida={categoria} onElegir={setCategoria} />
        </View>

        <View style={styles.campo}>
          <Text style={styles.titulo}>Contá brevemente qué pasó</Text>
          <TextInput
            style={styles.texto}
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            maxLength={LARGO_MAXIMO}
          />
          <Text style={styles.contador}>
            {descripcion.length} / {LARGO_MAXIMO}
          </Text>
        </View>

        <View style={styles.campo}>
          <Text style={styles.titulo}>¿Cuándo ocurrió?</Text>
          <SelectorDeFecha fecha={fecha} onCambio={setFecha} />
        </View>

        <Text style={styles.ayuda}>
          La ubicación no se puede cambiar. Si está mal, eliminá el reporte y publicalo de nuevo.
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      <View style={styles.pie}>
        <Pressable
          style={[styles.guardar, (falta !== null || guardando) && styles.guardarDeshabilitado]}
          onPress={guardar}
          disabled={falta !== null || guardando}>
          {guardando ? (
            <ActivityIndicator color={colores.textoSobreColor} />
          ) : (
            <Text style={styles.guardarTexto}>Guardar cambios</Text>
          )}
        </Pressable>
        {falta && <Text style={styles.nota}>{falta}</Text>}
      </View>
    </KeyboardAvoidingView>
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
    gap: 24,
  },
  campo: {
    gap: 10,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: colores.texto,
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
  ayuda: {
    fontSize: 14,
    color: colores.textoSuave,
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
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  nota: {
    fontSize: 13,
    color: colores.textoSuave,
    textAlign: 'center',
  },
  guardar: {
    backgroundColor: colores.acento,
    minHeight: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardarDeshabilitado: {
    backgroundColor: colores.deshabilitado,
  },
  guardarTexto: {
    color: colores.textoSobreColor,
    fontSize: 18,
    fontWeight: '700',
  },
});
