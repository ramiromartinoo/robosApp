import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useSesion } from '../sesion/SesionContext';
import { colores, sombra } from '../utils/tema';
import { obtenerTokenDePrueba, USUARIOS_DE_PRUEBA } from '../utils/usuarioDePrueba';

// Solo desarrollo: entrar con un usuario de prueba con un toque, sin loguearse ni editar .env.local.
// En la app publicada no se muestra (__DEV__ es false).
export function SelectorDeUsuarioDePrueba() {
  const { cambiarUsuarioDePrueba } = useSesion();
  const [cambiandoA, setCambiandoA] = useState<string | null>(null);
  const actual = obtenerTokenDePrueba();

  if (!__DEV__) {
    return null;
  }

  const elegir = async (token: string) => {
    if (token === actual || cambiandoA) return;
    setCambiandoA(token);
    // al cambiar la sesión esta pantalla se desmonta y la app vuelve a Inicio
    await cambiarUsuarioDePrueba(token);
  };

  return (
    <View style={styles.tarjeta}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Usuario de prueba</Text>
        <View style={styles.etiqueta}>
          <Ionicons name="construct-outline" size={13} color={colores.avisoTexto} />
          <Text style={styles.etiquetaTexto}>Solo desarrollo</Text>
        </View>
      </View>
      <Text style={styles.detalle}>Entrá como uno de los usuarios de prueba del backend, sin loguearte.</Text>

      {USUARIOS_DE_PRUEBA.map((usuario) => {
        const elegido = usuario.token === actual;
        return (
          <Pressable
            key={usuario.token}
            style={[styles.opcion, elegido && styles.opcionElegida]}
            onPress={() => elegir(usuario.token)}
            disabled={cambiandoA !== null}
            accessibilityRole="radio"
            accessibilityState={{ checked: elegido }}>
            <View style={styles.textos}>
              <Text style={styles.nombre}>{usuario.nombre}</Text>
              <Text style={styles.rol}>
                {usuario.detalle} · {usuario.token}
              </Text>
            </View>
            {cambiandoA === usuario.token ? (
              <ActivityIndicator color={colores.primarioTexto} />
            ) : (
              <Ionicons
                name={elegido ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={elegido ? colores.primarioTexto : colores.textoSuave}
              />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 16,
    gap: 6,
    ...sombra,
  },
  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titulo: {
    fontSize: 17,
    fontWeight: '700',
    color: colores.texto,
  },
  // para que no se confunda con una opción de verdad de la app
  etiqueta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colores.avisoSuave,
  },
  etiquetaTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.avisoTexto,
  },
  detalle: {
    fontSize: 14,
    color: colores.textoSuave,
    marginBottom: 4,
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  opcionElegida: {
    borderColor: colores.primarioTexto,
    backgroundColor: colores.primarioSuave,
  },
  textos: {
    flex: 1,
  },
  nombre: {
    fontSize: 16,
    fontWeight: '700',
    color: colores.texto,
  },
  rol: {
    fontSize: 13,
    color: colores.textoSuave,
  },
});
