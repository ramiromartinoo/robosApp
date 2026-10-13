import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import {
  cambiarEstadoDeUsuario,
  eliminarUsuario,
  EstadoDeUsuario,
  obtenerUsuarios,
  UsuarioAdmin,
} from '../../api/admin';
import { mensajeDeError } from '../../api/cliente';
import { Boton, EstadoDeLista, Etiqueta, PantallaConLista, Tarjeta } from '../../components/admin/Comunes';
import { haceCuanto } from '../../utils/fechas';
import { colores } from '../../utils/tema';
import { useCarga } from '../../utils/useCarga';

const ESTADOS: Record<EstadoDeUsuario, { nombre: string; color: string; fondo: string }> = {
  ACTIVO: { nombre: 'Activo', color: colores.confirmar, fondo: colores.confirmarSuave },
  SUSPENDIDO: { nombre: 'Suspendido', color: colores.aviso, fondo: colores.avisoSuave },
  BANEADO: { nombre: 'Baneado', color: colores.negar, fondo: colores.negarSuave },
};

// Qué se le pregunta al administrador antes de cambiar el estado de una cuenta
const CAMBIOS: Record<EstadoDeUsuario, { titulo: string; detalle: string; boton: string }> = {
  SUSPENDIDO: {
    titulo: '¿Suspender la cuenta?',
    detalle: 'No va a poder usar la app hasta que la reactives.',
    boton: 'Suspender',
  },
  BANEADO: {
    titulo: '¿Banear la cuenta?',
    detalle: 'No va a poder usar la app. Usalo para casos graves o reiterados.',
    boton: 'Banear',
  },
  ACTIVO: {
    titulo: '¿Reactivar la cuenta?',
    detalle: 'Va a poder volver a usar la app normalmente.',
    boton: 'Reactivar',
  },
};

export function AdminUsuariosScreen() {
  const router = useRouter();
  const { datos, setDatos, cargando, error, recargar, refrescando, refrescar } = useCarga(obtenerUsuarios);
  // id del usuario sobre el que se está aplicando una acción
  const [ocupado, setOcupado] = useState<number | null>(null);
  const lista = datos?.contenido ?? [];

  const ejecutar = async (usuarioId: number, accion: () => Promise<void>) => {
    setOcupado(usuarioId);
    try {
      await accion();
    } catch (e) {
      Alert.alert('No se pudo completar', mensajeDeError(e));
    } finally {
      setOcupado(null);
    }
  };

  const cambiarEstado = (usuario: UsuarioAdmin, estado: EstadoDeUsuario) => {
    const cambio = CAMBIOS[estado];
    Alert.alert(cambio.titulo, cambio.detalle, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: cambio.boton,
        style: estado === 'ACTIVO' ? 'default' : 'destructive',
        onPress: () =>
          ejecutar(usuario.id, async () => {
            const actualizado = await cambiarEstadoDeUsuario(usuario.id, estado);
            setDatos(
              (actual) =>
                actual && {
                  ...actual,
                  contenido: actual.contenido.map((otro) => (otro.id === usuario.id ? actualizado : otro)),
                },
            );
          }),
      },
    ]);
  };

  const eliminar = (usuario: UsuarioAdmin) => {
    Alert.alert(
      `¿Eliminar la cuenta de ${usuario.nombreVisible}?`,
      'Se borran la cuenta y todos sus reportes, votos y sugerencias. No se puede deshacer.\n\n' +
        'La persona podría volver a registrarse: para impedirle el acceso, baneala en lugar de eliminarla.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar definitivamente',
          style: 'destructive',
          onPress: () =>
            ejecutar(usuario.id, async () => {
              await eliminarUsuario(usuario.id);
              setDatos(
                (actual) =>
                  actual && { ...actual, contenido: actual.contenido.filter((otro) => otro.id !== usuario.id) },
              );
            }),
        },
      ],
    );
  };

  return (
    <PantallaConLista refrescando={refrescando} onRefrescar={refrescar}>
      <EstadoDeLista
        cargando={cargando}
        error={error}
        vacia={lista.length === 0}
        textoVacia="No hay usuarios."
        onReintentar={recargar}
      />

      {!cargando &&
        !error &&
        lista.map((usuario) => {
          const estado = ESTADOS[usuario.estado];
          const esAdmin = usuario.rol === 'ADMIN';
          const enCurso = ocupado === usuario.id;
          return (
            <Tarjeta key={usuario.id}>
              <View style={styles.encabezado}>
                <View style={styles.avatar}>
                  <Text style={styles.inicial}>{usuario.nombreVisible.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.datos}>
                  <Text style={styles.nombre} numberOfLines={1}>
                    {usuario.nombreVisible}
                  </Text>
                  <Text style={styles.detalle} numberOfLines={1}>
                    {usuario.email}
                  </Text>
                </View>
              </View>

              <View style={styles.etiquetas}>
                <Etiqueta texto={estado.nombre} color={estado.color} fondo={estado.fondo} />
                {esAdmin && <Etiqueta texto="Administrador" color={colores.primario} fondo={colores.primarioSuave} />}
                {usuario.advertencias > 0 && (
                  <Etiqueta
                    texto={usuario.advertencias === 1 ? '1 advertencia' : `${usuario.advertencias} advertencias`}
                    color={colores.aviso}
                    fondo={colores.avisoSuave}
                  />
                )}
              </View>

              <Text style={styles.detalle}>Se registró {haceCuanto(usuario.fechaRegistro)}</Text>

              <Boton
                texto="Ver sus reportes"
                icono="document-text-outline"
                onPress={() =>
                  router.push({
                    pathname: '/admin/reportes',
                    params: { usuarioId: String(usuario.id), nombre: usuario.nombreVisible },
                  })
                }
              />

              {/* las cuentas de administrador no se pueden suspender ni eliminar desde la app */}
              {!esAdmin &&
                (usuario.estado === 'ACTIVO' ? (
                  <View style={styles.fila}>
                    <View style={styles.mitad}>
                      <Boton
                        texto="Suspender"
                        onPress={() => cambiarEstado(usuario, 'SUSPENDIDO')}
                        deshabilitado={enCurso}
                      />
                    </View>
                    <View style={styles.mitad}>
                      <Boton
                        texto="Banear"
                        tipo="peligro"
                        onPress={() => cambiarEstado(usuario, 'BANEADO')}
                        deshabilitado={enCurso}
                      />
                    </View>
                  </View>
                ) : (
                  <Boton
                    texto="Reactivar cuenta"
                    tipo="primario"
                    onPress={() => cambiarEstado(usuario, 'ACTIVO')}
                    deshabilitado={enCurso}
                  />
                ))}

              {!esAdmin && (
                <Boton
                  texto="Eliminar cuenta"
                  icono="trash-outline"
                  tipo="peligro"
                  onPress={() => eliminar(usuario)}
                  deshabilitado={enCurso}
                />
              )}
            </Tarjeta>
          );
        })}
    </PantallaConLista>
  );
}

const styles = StyleSheet.create({
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inicial: {
    fontSize: 18,
    fontWeight: '700',
    color: colores.primario,
  },
  datos: {
    flex: 1,
  },
  nombre: {
    fontSize: 17,
    fontWeight: '700',
    color: colores.texto,
  },
  detalle: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  etiquetas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fila: {
    flexDirection: 'row',
    gap: 10,
  },
  mitad: {
    flex: 1,
  },
});
