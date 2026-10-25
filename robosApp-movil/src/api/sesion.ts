import { obtenerToken } from '../utils/usuarioDePrueba';
import { ErrorDeApi, pedir } from './cliente';

// Datos del usuario que devuelve el backend al iniciar sesión
export type Sesion = {
  id: number;
  email: string;
  nombreVisible: string;
  rol: 'CLIENTE' | 'ADMIN';
  estado: 'ACTIVO' | 'SUSPENDIDO' | 'BANEADO';
  usuarioNuevo: boolean;
  // true: hay que mostrarle los términos vigentes y pedirle que los acepte
  terminosPendientes: boolean;
};

export type Terminos = {
  id: number;
  version: string;
  texto: string;
  fechaPublicacion: string;
};

// PROVISORIO: se identifica con el token de prueba. Cuando esté el login con Google,
// acá va el token que entrega Firebase; el endpoint y la respuesta son los mismos.
export function iniciarSesion(): Promise<Sesion> {
  const token = obtenerToken();
  if (!token) {
    return Promise.reject(new ErrorDeApi(0, 'Falta configurar EXPO_PUBLIC_DEV_TOKEN en el archivo .env.local'));
  }
  return pedir<Sesion>('/auth/google', { method: 'POST', body: JSON.stringify({ idToken: token }) });
}

export function obtenerTerminosVigentes(): Promise<Terminos> {
  return pedir<Terminos>('/terminos/vigentes');
}

// Se manda el id de la versión que el usuario leyó: si mientras tanto se publicó otra, el backend la rechaza
export function aceptarTerminos(terminosId: number): Promise<void> {
  return pedir<void>('/terminos/aceptar', { method: 'POST', body: JSON.stringify({ terminosId }) });
}
