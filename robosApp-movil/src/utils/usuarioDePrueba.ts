import * as SecureStore from 'expo-secure-store';

// Solo para desarrollo: entrar con un usuario de prueba del backend en vez de loguearse con Firebase.
// Se elige desde la pantalla de login o desde "Mi cuenta", sin tocar .env.local ni reiniciar Expo.

export type UsuarioDePrueba = { token: string; nombre: string; detalle: string };

// Los que crea el backend con robosapp.seguridad.tokens-de-prueba (ver DatosDePrueba.java)
export const USUARIOS_DE_PRUEBA: UsuarioDePrueba[] = [
  { token: 'dev-cliente', nombre: 'Vecino de prueba', detalle: 'Cliente' },
  { token: 'dev-cliente-2', nombre: 'Vecina de prueba', detalle: 'Cliente' },
  { token: 'dev-cliente-3', nombre: 'Vecino de prueba 3', detalle: 'Cliente' },
  { token: 'dev-admin', nombre: 'Admin de prueba', detalle: 'Administrador' },
];

const CLAVE = 'usuario-de-prueba';

// Fuera de desarrollo nunca hay usuario de prueba elegido
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

let elegido: string | null = leerGuardado();

// El usuario de prueba elegido en la app, o null si no se eligió ninguno (o se cerró la sesión)
export function obtenerTokenDePrueba(): string | null {
  return elegido;
}

export function elegirUsuarioDePrueba(token: string | null) {
  elegido = token;
  try {
    if (token) {
      SecureStore.setItem(CLAVE, token);
    } else {
      SecureStore.deleteItemAsync(CLAVE);
    }
  } catch {
    // si no se puede guardar, el cambio vale igual hasta que se cierre la app
  }
}
