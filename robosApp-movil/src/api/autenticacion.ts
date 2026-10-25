// Login con Firebase Authentication (por ahora, mail y contraseña) y de dónde sale el token
// que se le manda al backend en cada pedido.
//
// Firebase solo se activa si están las variables EXPO_PUBLIC_FIREBASE_* en .env.local (ver .env.example).
// Sin ellas la app entra como antes, con los usuarios de prueba.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseError, initializeApp } from 'firebase/app';
import {
  Auth,
  createUserWithEmailAndPassword,
  getReactNativePersistence,
  initializeAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

import { obtenerTokenDePrueba } from '../utils/usuarioDePrueba';

const configuracion = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const hayFirebase = Object.values(configuracion).every(Boolean);

function iniciarFirebase(): Auth | null {
  if (!hayFirebase) {
    return null;
  }
  const auth = initializeAuth(initializeApp(configuracion), {
    // guarda la sesión en el teléfono: al volver a abrir la app ya se está adentro
    persistence: getReactNativePersistence(AsyncStorage),
  });
  // el mail para cambiar la contraseña llega en castellano
  auth.languageCode = 'es';
  return auth;
}

const auth = iniciarFirebase();

// Token para el encabezado Authorization, o undefined si no hay nadie logueado. En orden:
// 1. en desarrollo, el usuario de prueba elegido en la app;
// 2. el usuario de Firebase (getIdToken lo renueva solo cuando está por vencer, dura una hora);
// 3. sin Firebase configurado, el usuario de prueba de .env.local, como antes del login.
export async function obtenerToken(): Promise<string | undefined> {
  const dePrueba = obtenerTokenDePrueba();
  if (dePrueba) {
    return dePrueba;
  }
  if (auth) {
    // al abrir la app, Firebase tarda un momento en recuperar la sesión guardada
    await auth.authStateReady();
    return auth.currentUser ? auth.currentUser.getIdToken() : undefined;
  }
  return process.env.EXPO_PUBLIC_DEV_TOKEN || undefined;
}

export async function entrarConMail(email: string, contrasenia: string): Promise<void> {
  await signInWithEmailAndPassword(requerirFirebase(), email.trim(), contrasenia);
}

export async function crearCuenta(nombre: string, email: string, contrasenia: string): Promise<void> {
  const { user } = await createUserWithEmailAndPassword(requerirFirebase(), email.trim(), contrasenia);
  await updateProfile(user, { displayName: nombre.trim() });
  // un token nuevo, que ya lleve el nombre: el backend lo toma de ahí al registrar al usuario
  await user.getIdToken(true);
}

export async function enviarMailParaCambiarContrasenia(email: string): Promise<void> {
  await sendPasswordResetEmail(requerirFirebase(), email.trim());
}

export async function cerrarSesionDeFirebase(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

function requerirFirebase(): Auth {
  if (!auth) {
    throw new Error('Falta configurar Firebase en el archivo .env.local');
  }
  return auth;
}

// Los errores de Firebase vienen con un código en inglés; acá se traducen para el usuario
export function mensajeDeFirebase(e: unknown): string {
  if (!(e instanceof FirebaseError)) {
    return e instanceof Error ? e.message : 'Ocurrió un error inesperado';
  }
  switch (e.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'El mail o la contraseña no son correctos.';
    case 'auth/invalid-email':
      return 'El mail no es válido.';
    case 'auth/missing-password':
      return 'Escribí tu contraseña.';
    case 'auth/email-already-in-use':
      return 'Ya hay una cuenta con ese mail. Probá entrar, o recuperá la contraseña.';
    case 'auth/weak-password':
      return 'La contraseña tiene que tener al menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Esperá unos minutos y probá de nuevo.';
    case 'auth/network-request-failed':
      return 'No hay conexión a internet.';
    case 'auth/user-disabled':
      return 'Esta cuenta está deshabilitada.';
    default:
      return 'No se pudo completar. Probá de nuevo.';
  }
}
