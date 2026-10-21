import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { DenunciasDePosteo, obtenerDenunciasPendientes, Resolucion, resolverDenuncias } from '../../api/admin';
import { mensajeDeError } from '../../api/cliente';
import { MotivoDenuncia } from '../../api/tipos';
import {
  Boton,
  BotonCargarMas,
  DistanciaAlLugar,
  EstadoDeLista,
  EtiquetaDeConfianza,
  Etiqueta,
  PantallaConLista,
  Tarjeta,
} from '../../components/admin/Comunes';
import { CATEGORIAS } from '../../utils/categorias';
import { haceCuanto } from '../../utils/fechas';
import { colores } from '../../utils/tema';
import { usePaginado } from '../../utils/usePaginado';

const MOTIVOS: Record<MotivoDenuncia, string> = {
  INFORMACION_FALSA: 'Información falsa',
  DATOS_PERSONALES: 'Datos personales',
  CONTENIDO_OFENSIVO: 'Contenido ofensivo',
  SPAM: 'Spam o publicidad',
  OTRO: 'Otro motivo',
};

// Qué se le pregunta al administrador antes de aplicar cada resolución
const CONFIRMACIONES: Record<Resolucion, { titulo: string; detalle: string; boton: string }> = {
  ELIMINADO: {
    titulo: '¿Eliminar el reporte?',
    detalle: 'Deja de verse para todos y las denuncias quedan resueltas.',
    boton: 'Eliminar',
  },
  ADVERTENCIA: {
    titulo: '¿Advertir al autor?',
    detalle: 'El reporte sigue visible y al autor se le suma una advertencia.',
    boton: 'Advertir',
  },
  DESCARTADA: {
    titulo: '¿Descartar las denuncias?',
    detalle: 'El reporte sigue visible (o vuelve al feed si estaba oculto), sin consecuencias para el autor.',
    boton: 'Descartar',
  },
};

// Reportes con denuncias pendientes, primero los más denunciados
export function AdminDenunciasScreen() {
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
  } = usePaginado(obtenerDenunciasPendientes);
  // id del posteo que se está resolviendo, para deshabilitar sus botones
  const [resolviendo, setResolviendo] = useState<number | null>(null);

  const resolver = (item: DenunciasDePosteo, resolucion: Resolucion) => {
    const confirmacion = CONFIRMACIONES[resolucion];
    Alert.alert(confirmacion.titulo, confirmacion.detalle, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: confirmacion.boton,
        style: resolucion === 'ELIMINADO' ? 'destructive' : 'default',
        onPress: async () => {
          setResolviendo(item.posteo.id);
          try {
            await resolverDenuncias(item.posteo.id, resolucion);
            // ya no tiene denuncias pendientes: sale de la lista
            setItems((actuales) => actuales.filter((otro) => otro.posteo.id !== item.posteo.id));
          } catch (e) {
            Alert.alert('No se pudo resolver', mensajeDeError(e));
          } finally {
            setResolviendo(null);
          }
        },
      },
    ]);
  };

  return (
    <PantallaConLista refrescando={refrescando} onRefrescar={refrescar}>
      <EstadoDeLista
        cargando={cargando}
        error={error}
        vacia={lista.length === 0}
        textoVacia="No hay denuncias pendientes."
        onReintentar={recargar}
      />

      {!cargando &&
        !error &&
        lista.map((item) => {
          const { posteo } = item;
          const categoria = CATEGORIAS[posteo.categoria];
          const ocupado = resolviendo === posteo.id;
          return (
            <Tarjeta key={posteo.id}>
              <View style={styles.etiquetas}>
                <Etiqueta
                  texto={item.cantidadPendientes === 1 ? '1 denuncia' : `${item.cantidadPendientes} denuncias`}
                  color={colores.negar}
                  fondo={colores.negarSuave}
                />
                <Etiqueta texto={categoria.nombre} color={categoria.color} fondo={categoria.fondo} />
                <EtiquetaDeConfianza nivel={posteo.autorConfianza} />
                {posteo.estado === 'EN_REVISION' && (
                  <Etiqueta texto="Oculto del feed" color={colores.aviso} fondo={colores.avisoSuave} />
                )}
              </View>

              <Text style={styles.descripcion}>{posteo.descripcion}</Text>
              <Text style={styles.detalle}>
                Publicado por {posteo.autor} · ocurrió {haceCuanto(posteo.fechaHoraIncidente)}
              </Text>
              <DistanciaAlLugar metros={posteo.distanciaAlLugarM} />

              <View style={styles.motivos}>
                {item.denuncias.map((denuncia) => (
                  <Text key={denuncia.id} style={styles.motivo}>
                    • {MOTIVOS[denuncia.motivo]}
                    {denuncia.comentario ? `: “${denuncia.comentario}”` : ''}
                  </Text>
                ))}
              </View>

              <Boton
                texto="Descartar denuncias"
                icono="checkmark-circle-outline"
                onPress={() => resolver(item, 'DESCARTADA')}
                deshabilitado={ocupado}
              />
              <Boton
                texto="Advertir al autor"
                icono="warning-outline"
                onPress={() => resolver(item, 'ADVERTENCIA')}
                deshabilitado={ocupado}
              />
              <Boton
                texto="Eliminar reporte"
                icono="trash-outline"
                tipo="peligro"
                onPress={() => resolver(item, 'ELIMINADO')}
                deshabilitado={ocupado}
              />
            </Tarjeta>
          );
        })}
      {!error && <BotonCargarMas hayMas={hayMas} cargando={cargandoMas} onPress={cargarMas} />}
    </PantallaConLista>
  );
}

const styles = StyleSheet.create({
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
  motivos: {
    backgroundColor: colores.fondo,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  motivo: {
    fontSize: 15,
    lineHeight: 21,
    color: colores.texto,
  },
});
