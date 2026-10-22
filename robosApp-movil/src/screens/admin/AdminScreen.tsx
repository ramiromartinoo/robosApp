import Ionicons from '@expo/vector-icons/Ionicons';
import { Href, useRouter } from 'expo-router';
import { ComponentProps, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { obtenerDenunciasPendientes, obtenerSugerencias } from '../../api/admin';
import { PantallaConLista, Tarjeta } from '../../components/admin/Comunes';
import { colores } from '../../utils/tema';
import { useCarga } from '../../utils/useCarga';

type Seccion = {
  titulo: string;
  detalle: string;
  icono: ComponentProps<typeof Ionicons>['name'];
  ruta: Href;
  // cuántas cosas esperan atención; null = no aplica
  pendientes: number | null;
};

// Entrada al panel: accesos a cada sección, con lo que está esperando atención
export function AdminScreen() {
  const router = useRouter();
  const pedir = useCallback(async () => {
    const [denuncias, sugerencias] = await Promise.all([obtenerDenunciasPendientes(), obtenerSugerencias(true)]);
    return { denuncias: denuncias.totalElementos, sugerencias: sugerencias.totalElementos };
  }, []);
  const { datos, error, refrescando, refrescar } = useCarga(pedir);

  const secciones: Seccion[] = [
    {
      titulo: 'Denuncias',
      detalle: 'Reportes denunciados por los vecinos',
      icono: 'flag-outline',
      ruta: '/admin/denuncias',
      pendientes: datos?.denuncias ?? null,
    },
    {
      titulo: 'Sugerencias',
      detalle: 'Leer y responder',
      icono: 'chatbubble-ellipses-outline',
      ruta: '/admin/sugerencias',
      pendientes: datos?.sugerencias ?? null,
    },
    {
      titulo: 'Usuarios',
      detalle: 'Suspender, banear o eliminar cuentas',
      icono: 'people-outline',
      ruta: '/admin/usuarios',
      pendientes: null,
    },
    {
      titulo: 'Reportes',
      detalle: 'Todos los reportes, en cualquier estado',
      icono: 'document-text-outline',
      ruta: '/admin/reportes',
      pendientes: null,
    },
    {
      titulo: 'Estadísticas',
      detalle: 'Reportes por tipo de hecho y por zona',
      icono: 'bar-chart-outline',
      ruta: '/admin/estadisticas',
      pendientes: null,
    },
  ];

  return (
    <PantallaConLista refrescando={refrescando} onRefrescar={refrescar}>
      {error && <Text style={styles.error}>{error}</Text>}

      <Tarjeta style={styles.menu}>
        {secciones.map((seccion, indice) => (
          <Pressable
            key={seccion.titulo}
            style={[styles.opcion, indice > 0 && styles.opcionConLinea]}
            onPress={() => router.push(seccion.ruta)}
            accessibilityRole="button">
            <View style={styles.icono}>
              <Ionicons name={seccion.icono} size={22} color={colores.primarioTexto} />
            </View>
            <View style={styles.textos}>
              <Text style={styles.titulo}>{seccion.titulo}</Text>
              <Text style={styles.detalle}>{seccion.detalle}</Text>
            </View>
            {seccion.pendientes !== null && seccion.pendientes > 0 && (
              <View style={styles.contador}>
                <Text style={styles.contadorTexto}>{seccion.pendientes}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color={colores.textoSuave} />
          </Pressable>
        ))}
      </Tarjeta>
    </PantallaConLista>
  );
}

const styles = StyleSheet.create({
  error: {
    backgroundColor: colores.errorFondo,
    color: colores.errorTexto,
    fontSize: 15,
    padding: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  menu: {
    padding: 0,
    gap: 0,
    overflow: 'hidden',
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  opcionConLinea: {
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  icono: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: {
    flex: 1,
  },
  titulo: {
    fontSize: 17,
    fontWeight: '700',
    color: colores.texto,
  },
  detalle: {
    fontSize: 14,
    color: colores.textoSuave,
  },
  contador: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 7,
    backgroundColor: colores.negar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contadorTexto: {
    color: colores.textoSobreColor,
    fontSize: 14,
    fontWeight: '700',
  },
});
