import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { ErrorDeApi } from '../api/cliente';
import { eliminarReporte, obtenerMisReportes } from '../api/reportes';
import { MiReporte } from '../api/tipos';
import { EstadoVacio } from '../components/EstadoVacio';
import { CATEGORIAS } from '../utils/categorias';
import { haceCuanto } from '../utils/fechas';
import { colores, sombra } from '../utils/tema';
import { usePaginado } from '../utils/usePaginado';

const mensajeDe = (e: unknown) => (e instanceof ErrorDeApi ? e.message : 'Ocurrió un error inesperado');

export function MisReportesScreen() {
  const router = useRouter();
  // se carga de a páginas (la siguiente al llegar al final) y se recarga al entrar y al volver de editar
  const {
    items: reportes,
    setItems: setReportes,
    cargando,
    cargandoMas,
    error,
    cargarMas,
    recargar,
    refrescando,
    refrescar,
  } = usePaginado(obtenerMisReportes);

  const editar = (reporte: MiReporte) => {
    router.push({
      pathname: '/editar-reporte',
      params: {
        id: String(reporte.id),
        descripcion: reporte.descripcion,
        categoria: reporte.categoria,
        fechaHoraIncidente: reporte.fechaHoraIncidente,
      },
    });
  };

  const eliminar = (reporte: MiReporte) => {
    Alert.alert('¿Eliminar este reporte?', 'Deja de verse para todos y no se puede recuperar.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await eliminarReporte(reporte.id);
            setReportes((actuales) => actuales.filter((otro) => otro.id !== reporte.id));
          } catch (e) {
            Alert.alert('No se pudo eliminar', mensajeDe(e));
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.pantalla}>
      {error && (
        <View style={styles.error}>
          <Text style={styles.errorTexto}>{error}</Text>
          <Pressable style={styles.reintentar} onPress={recargar}>
            <Text style={styles.reintentarTexto}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      <FlatList
        data={reportes}
        keyExtractor={(reporte) => String(reporte.id)}
        renderItem={({ item }) => (
          <TarjetaDeMiReporte reporte={item} onEditar={() => editar(item)} onEliminar={() => eliminar(item)} />
        )}
        contentContainerStyle={styles.lista}
        refreshing={refrescando}
        onRefresh={refrescar}
        // scroll infinito: pide la página siguiente al acercarse al final
        onEndReached={cargarMas}
        onEndReachedThreshold={0.5}
        ListFooterComponent={cargandoMas ? <ActivityIndicator style={styles.cargando} color={colores.primarioTexto} /> : undefined}
        ListEmptyComponent={
          cargando ? (
            <ActivityIndicator style={styles.cargando} color={colores.primarioTexto} />
          ) : !error ? (
            <EstadoVacio
              icono="document-text-outline"
              titulo="Todavía no publicaste ningún reporte"
              texto="Si viste un robo o algo sospechoso, avisales a tus vecinos."
              accion={{ texto: 'Hacer un reporte', onPress: () => router.push('/publicar') }}
            />
          ) : undefined
        }
      />
    </View>
  );
}

type TarjetaProps = {
  reporte: MiReporte;
  onEditar: () => void;
  onEliminar: () => void;
};

function TarjetaDeMiReporte({ reporte, onEditar, onEliminar }: TarjetaProps) {
  const categoria = CATEGORIAS[reporte.categoria];
  const sePuedeEditar = reporte.segundosParaEditar > 0;
  const minutosRestantes = Math.ceil(reporte.segundosParaEditar / 60);

  return (
    <View style={styles.tarjeta}>
      <View style={styles.encabezado}>
        <Text style={styles.tiempo}>Ocurrió {haceCuanto(reporte.fechaHoraIncidente)}</Text>
        <View style={[styles.categoria, { backgroundColor: categoria.fondo }]}>
          <Text style={[styles.categoriaTexto, { color: categoria.color }]}>{categoria.nombre}</Text>
        </View>
      </View>

      <Text style={styles.descripcion}>{reporte.descripcion}</Text>

      {reporte.zona && (
        <View style={styles.fila}>
          <Ionicons name="location-outline" size={17} color={colores.textoSuave} />
          <Text style={styles.detalle}>{reporte.zona}</Text>
        </View>
      )}

      {reporte.estado === 'EN_REVISION' && (
        <View style={styles.revision}>
          <Ionicons name="alert-circle-outline" size={17} color={colores.aviso} />
          <Text style={styles.revisionTexto}>
            Recibió varias denuncias. Está oculto hasta que un administrador lo revise.
          </Text>
        </View>
      )}

      <View style={styles.acciones}>
        {sePuedeEditar && (
          <Pressable style={styles.accion} onPress={onEditar}>
            <Ionicons name="create-outline" size={19} color={colores.texto} />
            <Text style={styles.accionTexto}>Editar</Text>
          </Pressable>
        )}
        <Pressable style={[styles.accion, styles.accionEliminar]} onPress={onEliminar}>
          <Ionicons name="trash-outline" size={19} color={colores.negar} />
          <Text style={[styles.accionTexto, { color: colores.negar }]}>Eliminar</Text>
        </Pressable>
      </View>

      <Text style={styles.nota}>
        {sePuedeEditar
          ? `Podés editarlo durante ${minutosRestantes} ${minutosRestantes === 1 ? 'minuto' : 'minutos'} más.`
          : 'Ya pasó el tiempo para editarlo. Si tiene un error, podés eliminarlo y publicarlo de nuevo.'}
      </Text>
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
    marginTop: 48,
  },
  error: {
    backgroundColor: colores.errorFondo,
    marginHorizontal: 14,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  errorTexto: {
    color: colores.errorTexto,
    fontSize: 16,
  },
  reintentar: {
    backgroundColor: colores.primario,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reintentarTexto: {
    color: colores.textoSobreColor,
    fontSize: 16,
    fontWeight: '600',
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
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  tiempo: {
    flexShrink: 1,
    fontSize: 14,
    color: colores.textoSuave,
  },
  categoria: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoriaTexto: {
    fontSize: 13,
    fontWeight: '700',
  },
  descripcion: {
    fontSize: 17,
    lineHeight: 24,
    color: colores.texto,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detalle: {
    flexShrink: 1,
    fontSize: 14,
    color: colores.textoSuave,
  },
  revision: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colores.avisoSuave,
    padding: 10,
    borderRadius: 10,
  },
  revisionTexto: {
    flex: 1,
    fontSize: 14,
    color: colores.aviso,
  },
  acciones: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  accion: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.superficie,
  },
  accionEliminar: {
    borderColor: colores.negarSuave,
  },
  accionTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
  },
  nota: {
    fontSize: 13,
    color: colores.textoSuave,
  },
});
