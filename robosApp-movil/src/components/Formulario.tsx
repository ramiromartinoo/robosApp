import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colores } from '../utils/tema';

// Piezas comunes de las pantallas de login: un campo con su título y el botón principal

type CampoProps = TextInputProps & {
  titulo: string;
  // para contraseñas: oculta el texto y suma el botón del ojo para mostrarlo
  esContrasenia?: boolean;
  ayuda?: string;
};

export function Campo({ titulo, esContrasenia, ayuda, style, ...props }: CampoProps) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.campo}>
      <Text style={styles.titulo}>{titulo}</Text>
      <View style={styles.caja}>
        <TextInput
          style={[styles.entrada, style]}
          placeholderTextColor={colores.textoSuave}
          secureTextEntry={esContrasenia && !visible}
          autoCapitalize={esContrasenia ? 'none' : props.autoCapitalize}
          autoCorrect={esContrasenia ? false : props.autoCorrect}
          {...props}
        />
        {esContrasenia && (
          <Pressable
            style={styles.ojo}
            onPress={() => setVisible((antes) => !antes)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} color={colores.textoSuave} />
          </Pressable>
        )}
      </View>
      {ayuda && <Text style={styles.ayuda}>{ayuda}</Text>}
    </View>
  );
}

type BotonProps = {
  texto: string;
  onPress: () => void;
  cargando?: boolean;
  deshabilitado?: boolean;
};

export function BotonPrincipal({ texto, onPress, cargando, deshabilitado }: BotonProps) {
  const inactivo = deshabilitado || cargando;
  return (
    <Pressable
      style={[styles.boton, inactivo && styles.botonDeshabilitado]}
      onPress={onPress}
      disabled={inactivo}
      accessibilityRole="button">
      {cargando ? (
        <ActivityIndicator color={colores.textoSobreColor} />
      ) : (
        <Text style={styles.botonTexto}>{texto}</Text>
      )}
    </Pressable>
  );
}

export function MensajeDeError({ texto }: { texto: string | null }) {
  return texto ? <Text style={styles.error}>{texto}</Text> : null;
}

const styles = StyleSheet.create({
  campo: {
    gap: 6,
  },
  titulo: {
    fontSize: 15,
    fontWeight: '700',
    color: colores.texto,
  },
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 14,
    backgroundColor: colores.superficie,
  },
  entrada: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 14,
    fontSize: 17,
    color: colores.texto,
  },
  ojo: {
    paddingHorizontal: 14,
  },
  ayuda: {
    fontSize: 13,
    color: colores.textoSuave,
  },
  boton: {
    backgroundColor: colores.acento,
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonDeshabilitado: {
    backgroundColor: colores.deshabilitado,
  },
  botonTexto: {
    color: colores.textoSobreColor,
    fontSize: 17,
    fontWeight: '700',
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
