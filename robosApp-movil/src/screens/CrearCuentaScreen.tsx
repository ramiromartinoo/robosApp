import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { crearCuenta, mensajeDeFirebase } from '../api/autenticacion';
import { BotonPrincipal, Campo, MensajeDeError } from '../components/Formulario';
import { useSesion } from '../sesion/SesionContext';
import { colores, sombra } from '../utils/tema';

// Lo que exige Firebase como mínimo
const LARGO_MINIMO_CONTRASENIA = 6;
// El backend guarda el nombre visible con hasta 50 caracteres
const LARGO_MAXIMO_NOMBRE = 50;

// Registro con mail y contraseña. La cuenta se crea en Firebase; el backend registra al usuario
// la primera vez que entra, y después la app le pide aceptar los términos como a cualquiera.
export function CrearCuentaScreen() {
  const { alEntrar, error: errorDeSesion } = useSesion();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [repetida, setRepetida] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // qué falta para poder crear la cuenta (null = está todo)
  const falta = !nombre.trim()
    ? 'Escribí tu nombre.'
    : !email.trim()
      ? 'Escribí tu mail.'
      : contrasenia.length < LARGO_MINIMO_CONTRASENIA
        ? `La contraseña tiene que tener al menos ${LARGO_MINIMO_CONTRASENIA} caracteres.`
        : contrasenia !== repetida
          ? 'Las contraseñas no coinciden.'
          : null;

  const crear = async () => {
    if (falta) return;
    setEnviando(true);
    setError(null);
    try {
      await crearCuenta(nombre, email, contrasenia);
    } catch (e) {
      setError(mensajeDeFirebase(e));
      setEnviando(false);
      return;
    }
    await alEntrar();
    setEnviando(false);
  };

  // la ayuda de "qué falta" se muestra recién cuando ya se escribió algo en la última casilla
  const avisoDeFalta = repetida ? falta : null;

  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <View style={styles.tarjeta}>
          <Text style={styles.titulo}>Sumate a Radar Vecinal</Text>

          <Campo
            titulo="Nombre"
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ej: Federico G."
            maxLength={LARGO_MAXIMO_NOMBRE}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            ayuda="Así te van a ver los demás vecinos en tus reportes. Alcanza con tu nombre y la inicial del apellido."
          />
          <Campo
            titulo="Mail"
            value={email}
            onChangeText={setEmail}
            placeholder="tu@mail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <Campo
            titulo="Contraseña"
            value={contrasenia}
            onChangeText={setContrasenia}
            esContrasenia
            autoComplete="new-password"
            textContentType="newPassword"
            ayuda={`Al menos ${LARGO_MINIMO_CONTRASENIA} caracteres.`}
          />
          <Campo
            titulo="Repetí la contraseña"
            value={repetida}
            onChangeText={setRepetida}
            esContrasenia
            autoComplete="new-password"
            textContentType="newPassword"
            onSubmitEditing={crear}
          />

          <MensajeDeError texto={error ?? avisoDeFalta ?? (enviando ? null : errorDeSesion)} />

          <BotonPrincipal texto="Crear cuenta" onPress={crear} cargando={enviando} deshabilitado={falta !== null} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    padding: 14,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 16,
    gap: 14,
    ...sombra,
  },
  titulo: {
    fontSize: 21,
    fontWeight: '700',
    color: colores.texto,
  },
});
