import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { eliminarReporteComoAdmin, EstadoDePosteo, obtenerReportes, PosteoAdmin } from '../../api/admin';
import { mensajeDeError } from '../../api/cliente';
import {
  Boton,
  DistanciaAlLugar,
  EstadoDeLista,
  Etiqueta,
  Filtros,
  PantallaConLista,
  Tarjeta,
} from '../../components/admin/Comunes';
import { CATEGORIAS } from '../../utils/categorias';
import { haceCuanto } from '../../utils/fechas';
import { colores } from '../../utils/tema';
import { useCarga } from '../../utils/useCarga';

type Filtro = EstadoDePosteo | 'TODOS';

const FILTROS: { valor: Filtro; nombre: string }[] = [
  { valor: 'TODOS', nombre: 'Todos' },
  { valor: 'ACTIVO', nombre: 'Activos' },
  { valor: 'EN_REVISION', nombre: 'En revisión' },
  { valor: 'ELIMINADO', nombre: 'Eliminados' },
];

const ESTADOS: Record<EstadoDePosteo, { nombre: string; color: string; fondo: string }> = {
  ACTIVO: { nombre: 'Activo', color: colores.confirmar, fondo: colores.confirmarSuave },
  EN_REVISION: { nombre: 'En revisión', color: colores.aviso, fondo: colores.avisoSuave },
  ELIMINADO: { nombre: 'Eliminado', color: colores.negar, fondo: colores.negarSuave },
};

// Todos los reportes, en cualquier estado. Si se llega desde un usuario, solo los suyos.
export function AdminReportesScreen() {
  const parametros = useLocalSearchParams<{ usuarioId?: string; nombre?: string }>();
  const usuarioId = parametros.usuarioId ? Number(parametros.usuarioId) : null;
  const [filtro, setFiltro] = useState<Filtro>('TODOS');
  const pedir = useCallback(
    () => obtenerReportes({ estado: filtro === 'TODOS' ? null : filtro, usuarioId }),
    [filtro, usuarioId],
  );
  const { datos, setDatos, cargando, error, recargar, refrescando, refrescar } = useCarga(pedir);
  const [eliminando, setEliminando] = useState<number | null>(null);
  const lista = datos?.contenido ?? [];

  const eliminar = (posteo: PosteoAdmin) => {
    Alert.alert('¿Eliminar este reporte?', 'Deja de verse para todos. Si tenía denuncias pendientes, quedan resueltas.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setEliminando(posteo.id);
          try {
            await eliminarReporteComoAdmin(posteo.id);
            setDatos(
              (actual) =>
                actual && {
                  ...actual,
                  contenido:
                    filtro === 'TODOS' || filtro === 'ELIMINADO'
                      ? actual.contenido.map((otro) =>
                          otro.id === posteo.id ? { ...otro, estado: 'ELIMINADO' as const } : otro,
                        )
                      : // con un filtro de estado activo, el eliminado ya no corresponde a esta vista
                        actual.contenido.filter((otro) => otro.id !== posteo.id),
                },
            );
          } catch (e) {
            Alert.alert('No se pudo eliminar', mensajeDeError(e));
          } finally {
            setEliminando(null);
          }
        },
      },
    ]);
  };

  return (
    <PantallaConLista refrescando={refrescando} onRefrescar={refrescar}>
      {parametros.nombre && <Text style={styles.de}>Reportes de {parametros.nombre}</Text>}
      <Filtros opciones={FILTROS} elegida={filtro} onElegir={setFiltro} />

      <EstadoDeLista
        cargando={cargando}
        error={error}
        vacia={lista.length === 0}
        textoVacia="No hay reportes con este filtro."
        onReintentar={recargar}
      />

      {!cargando &&
        !error &&
        lista.map((posteo) => {
          const categoria = CATEGORIAS[posteo.categoria];
          const estado = ESTADOS[posteo.estado];
          return (
            <Tarjeta key={posteo.id}>
              <View style={styles.etiquetas}>
                <Etiqueta texto={estado.nombre} color={estado.color} fondo={estado.fondo} />
                <Etiqueta texto={categoria.nombre} color={categoria.color} fondo={categoria.fondo} />
              </View>
              <Text style={styles.descripcion}>{posteo.descripcion}</Text>
              <Text style={styles.detalle}>
                {posteo.autor} · ocurrió {haceCuanto(posteo.fechaHoraIncidente)}
              </Text>
              <DistanciaAlLugar metros={posteo.distanciaAlLugarM} />
              {posteo.estado !== 'ELIMINADO' && (
                <Boton
                  texto="Eliminar reporte"
                  icono="trash-outline"
                  tipo="peligro"
                  onPress={() => eliminar(posteo)}
                  deshabilitado={eliminando === posteo.id}
                />
              )}
            </Tarjeta>
          );
        })}
    </PantallaConLista>
  );
}

const styles = StyleSheet.create({
  de: {
    fontSize: 17,
    fontWeight: '700',
    color: colores.texto,
  },
  etiquetas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  descripcion: {
    fontSize: 17,
    lineHeight: 24,
    color: colores.texto,
  },
  detalle: {
    fontSize: 14,
    color: colores.textoSuave,
  },
});
