import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSesion } from '../sesion/SesionContext';
import { colores, esOscuro, sombra } from '../utils/tema';

// Pantalla para una cuenta suspendida o baneada por un administrador. Reemplaza a toda la app:
// el backend rechaza cualquier pedido de esa cuenta, así que no tendría sentido mostrar nada más.
export function CuentaBloqueadaScreen() {
  const { sesion, reintentar } = useSesion();
  const [revisando, setRevisando] = useState(false);
  const baneada = sesion?.estado === 'BANEADO';

  // vuelve a consultar el estado: si un administrador reactivó la cuenta, la app se abre sola
  const revisar = async () => {
    setRevisando(true);
    await reintentar();
    setRevisando(false);
  };

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style={esOscuro ? 'light' : 'dark'} />
      <View style={styles.tarjeta}>
        <View style={[styles.icono, baneada && styles.iconoBaneada]}>
          <Ionicons name={baneada ? 'ban-outline' : 'pause-circle-outline'} size={34} color={colores.textoSobreColor} />
        </View>

        <Text style={styles.titulo}>{baneada ? 'Tu cuenta fue dada de baja' : 'Tu cuenta está suspendida'}</Text>

        <Text style={styles.texto}>
          {baneada
            ? 'Un administrador dio de baja tu cuenta por no respetar los términos de uso de Radar Vecinal. ' +
              'Ya no podés ver ni publicar reportes.'
            : 'Un administrador suspendió tu cuenta, por ejemplo por reportes denunciados por otros vecinos. ' +
              'Mientras dure la suspensión no podés ver ni publicar reportes.'}
        </Text>

        {!baneada && (
          <Text style={styles.texto}>
            Cuando la reactiven vas a poder volver a usar la app normalmente.
          </Text>
        )}

        <Text style={styles.ayuda}>Si creés que es un error, comunicate con el equipo de Radar Vecinal.</Text>

        {!baneada && (
          <Pressable style={styles.boton} onPress={revisar} disabled={revisando} accessibilityRole="button">
            {revisando ? (
              <ActivityIndicator color={colores.textoSobreColor} />
            ) : (
              <Text style={styles.botonTexto}>Volver a revisar</Text>
            )}
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
    padding: 14,
    justifyContent: 'center',
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 22,
    gap: 14,
    ...sombra,
  },
  icono: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colores.aviso,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoBaneada: {
    backgroundColor: colores.negar,
  },
  titulo: {
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '800',
    color: colores.texto,
  },
  texto: {
    fontSize: 17,
    lineHeight: 24,
    color: colores.texto,
  },
  ayuda: {
    fontSize: 15,
    lineHeight: 21,
    color: colores.textoSuave,
  },
  boton: {
    backgroundColor: colores.primario,
    minHeight: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  botonTexto: {
    color: colores.textoSobreColor,
    fontSize: 18,
    fontWeight: '700',
  },
});
