import * as SecureStore from 'expo-secure-store';

// PROVISORIO, solo para desarrollo: con qué usuario de prueba del backend entra la app.
// Se elige desde "Mi cuenta" sin tocar .env.local ni reiniciar Expo. Cuando esté el login real,
// esto desaparece y el token lo entrega Firebase.

export type UsuarioDePrueba = { token: string; nombre: string; detalle: string };

// Los que crea el backend con robosapp.seguridad.tokens-de-prueba (ver DatosDePrueba.java)
export const USUARIOS_DE_PRUEBA: UsuarioDePrueba[] = [
  { token: 'dev-cliente', nombre: 'Vecino de prueba', detalle: 'Cliente' },
  { token: 'dev-cliente-2', nombre: 'Vecina de prueba', detalle: 'Cliente' },
  { token: 'dev-cliente-3', nombre: 'Vecino de prueba 3', detalle: 'Cliente' },
  { token: 'dev-admin', nombre: 'Admin de prueba', detalle: 'Administrador' },
];

const CLAVE = 'usuario-de-prueba';

// El elegido en la app manda sobre el de .env.local. Fuera de desarrollo solo cuenta .env.local.
function leerGuardado(): string | null {
  if (!__DEV__) {
    return null;
  }
  try {
    return SecureStore.getItem(CLAVE);
  } catch {
    return null;
  }
}

let tokenActual: string | undefined = leerGuardado() ?? process.env.EXPO_PUBLIC_DEV_TOKEN;

export function obtenerToken(): string | undefined {
  return tokenActual;
}

export function elegirUsuarioDePrueba(token: string) {
  tokenActual = token;
  try {
    SecureStore.setItem(CLAVE, token);
  } catch {
    // si no se puede guardar, el cambio vale igual hasta que se cierre la app
  }
}
