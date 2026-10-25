import { obtenerToken } from './autenticacion';
import { pedir } from './cliente';

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

// Le presenta al backend el token de quien está logueado (Firebase o, en desarrollo, un usuario de prueba).
// La primera vez, el backend registra al usuario. Devuelve null si no hay nadie logueado.
export async function iniciarSesion(): Promise<Sesion | null> {
  const token = await obtenerToken();
  if (!token) {
    return null;
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
