import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { enviarMailParaCambiarContrasenia, mensajeDeFirebase } from '../api/autenticacion';
import { BotonPrincipal, Campo, MensajeDeError } from '../components/Formulario';
import { colores, sombra } from '../utils/tema';

// Firebase manda un mail con un enlace para elegir una contraseña nueva
export function RecuperarContraseniaScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviar = async () => {
    setEnviando(true);
    setError(null);
    try {
      await enviarMailParaCambiarContrasenia(email);
      setEnviado(true);
    } catch (e) {
      setError(mensajeDeFirebase(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <View style={styles.tarjeta}>
          {enviado ? (
            <>
              <View style={styles.icono}>
                <Ionicons name="mail-outline" size={30} color={colores.primarioTexto} />
              </View>
              <Text style={styles.titulo}>Revisá tu mail</Text>
              {/* Firebase no dice si el mail tiene cuenta, para no revelar quién está registrado */}
              <Text style={styles.texto}>
                Si hay una cuenta con {email.trim()}, te llegó un mensaje con un enlace para elegir una contraseña
                nueva. Si no lo ves, fijate en la carpeta de spam.
              </Text>
              <BotonPrincipal texto="Volver a entrar" onPress={() => router.back()} />
            </>
          ) : (
            <>
              <Text style={styles.titulo}>¿Olvidaste tu contraseña?</Text>
              <Text style={styles.texto}>Escribí tu mail y te mandamos un enlace para elegir una nueva.</Text>
              <Campo
                titulo="Mail"
                value={email}
                onChangeText={setEmail}
                placeholder="tu@mail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                onSubmitEditing={email.trim() ? enviar : undefined}
              />
              <MensajeDeError texto={error} />
              <BotonPrincipal texto="Enviar enlace" onPress={enviar} cargando={enviando} deshabilitado={!email.trim()} />
            </>
          )}
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
  icono: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 21,
    fontWeight: '700',
    color: colores.texto,
  },
  texto: {
    fontSize: 16,
    lineHeight: 22,
    color: colores.textoSuave,
  },
});
