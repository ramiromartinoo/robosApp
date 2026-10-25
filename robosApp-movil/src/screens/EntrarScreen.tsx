import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { entrarConMail, hayFirebase, mensajeDeFirebase } from '../api/autenticacion';
import { BotonPrincipal, Campo, MensajeDeError } from '../components/Formulario';
import { SelectorDeUsuarioDePrueba } from '../components/SelectorDeUsuarioDePrueba';
import { useSesion } from '../sesion/SesionContext';
import { colores, esOscuro, sombra } from '../utils/tema';

// Primera pantalla para quien no está logueado: entrar con mail y contraseña, o ir a crear la cuenta.
// Los botones de Google y Apple se suman cuando la app se compile (no funcionan en Expo Go).
export function EntrarScreen() {
  const router = useRouter();
  const { alEntrar, error: errorDeSesion } = useSesion();
  const [email, setEmail] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entrar = async () => {
    setEnviando(true);
    setError(null);
    try {
      await entrarConMail(email, contrasenia);
    } catch (e) {
      setError(mensajeDeFirebase(e));
      setEnviando(false);
      return;
    }
    // con Firebase ya está adentro; ahora el backend (si falla, el error queda en la sesión)
    await alEntrar();
    setEnviando(false);
  };

  const incompleto = !email.trim() || !contrasenia;

  return (
    <SafeAreaView style={styles.pantalla}>
      <StatusBar style={esOscuro ? 'light' : 'dark'} />
      <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <View style={styles.tarjeta}>
            <View style={styles.logo}>
              <Image source={require('../../assets/splash-icon.png')} style={styles.logoImagen} />
            </View>
            <Text style={styles.titulo}>Radar Vecinal</Text>
            <Text style={styles.bajada}>Entrá para ver y reportar lo que pasa cerca tuyo.</Text>

            {hayFirebase ? (
              <>
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
                  autoComplete="current-password"
                  textContentType="password"
                  onSubmitEditing={incompleto ? undefined : entrar}
                />

                <MensajeDeError texto={error ?? (enviando ? null : errorDeSesion)} />

                <BotonPrincipal texto="Entrar" onPress={entrar} cargando={enviando} deshabilitado={incompleto} />

                <Pressable onPress={() => router.push('/recuperar-contrasenia')} hitSlop={8}>
                  <Text style={styles.enlace}>¿Olvidaste tu contraseña?</Text>
                </Pressable>

                <View style={styles.separador} />

                <Pressable style={styles.crear} onPress={() => router.push('/crear-cuenta')} accessibilityRole="button">
                  <Text style={styles.crearTexto}>¿No tenés cuenta? </Text>
                  <Text style={styles.crearEnlace}>Crear cuenta</Text>
                </Pressable>
              </>
            ) : (
              // sin las variables de Firebase solo se puede entrar con los usuarios de prueba
              <Text style={styles.aviso}>
                El login todavía no está configurado en este equipo: faltan las variables
                EXPO_PUBLIC_FIREBASE_* en .env.local (ver .env.example).
              </Text>
            )}
          </View>

          {/* solo en desarrollo; en la app publicada no se ve */}
          <SelectorDeUsuarioDePrueba />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 14,
    gap: 14,
  },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 18,
    gap: 14,
    ...sombra,
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImagen: {
    width: 34,
    height: 34,
  },
  titulo: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    color: colores.texto,
  },
  bajada: {
    fontSize: 16,
    lineHeight: 22,
    color: colores.textoSuave,
  },
  enlace: {
    fontSize: 16,
    fontWeight: '600',
    color: colores.primarioTexto,
    textAlign: 'center',
  },
  separador: {
    height: 1,
    backgroundColor: colores.borde,
  },
  crear: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  crearTexto: {
    fontSize: 16,
    color: colores.textoSuave,
  },
  crearEnlace: {
    fontSize: 16,
    fontWeight: '700',
    color: colores.primarioTexto,
  },
  aviso: {
    backgroundColor: colores.avisoSuave,
    color: colores.avisoTexto,
    fontSize: 15,
    lineHeight: 21,
    padding: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
