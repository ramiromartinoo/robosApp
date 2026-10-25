import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { cerrarSesionDeFirebase } from '../api/autenticacion';
import { alBloquearseLaCuenta, alHaberTerminosPendientes, ErrorDeApi } from '../api/cliente';
import { iniciarSesion, Sesion } from '../api/sesion';
import { elegirUsuarioDePrueba } from '../utils/usuarioDePrueba';

type EstadoDeSesion = {
  // null mientras se está iniciando, si falló o si no hay nadie logueado
  sesion: Sesion | null;
  cargando: boolean;
  error: string | null;
  // true: no hay nadie logueado, hay que mostrar la pantalla para entrar
  sinLoguear: boolean;
  reintentar: () => Promise<void>;
  // lo llaman las pantallas de login después de entrar o crear la cuenta en Firebase
  alEntrar: () => Promise<void>;
  cerrarSesion: () => Promise<void>;
  // lo llama la pantalla de bienvenida cuando el usuario acepta los términos
  marcarTerminosAceptados: () => void;
  // solo desarrollo (ver usuarioDePrueba.ts)
  cambiarUsuarioDePrueba: (token: string) => Promise<void>;
};

const SesionContext = createContext<EstadoDeSesion | null>(null);

// Inicia la sesión al abrir la app y la comparte con todas las pantallas
export function ProveedorDeSesion({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sinLoguear, setSinLoguear] = useState(false);

  const iniciar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const nueva = await iniciarSesion();
      setSesion(nueva);
      setSinLoguear(nueva === null);
    } catch (e) {
      setError(e instanceof ErrorDeApi ? e.message : 'Ocurrió un error inesperado');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    iniciar();
  }, [iniciar]);

  // si el backend avisa que hay términos sin aceptar, la app vuelve a la pantalla de bienvenida
  useEffect(() => {
    alHaberTerminosPendientes(() =>
      setSesion((actual) => (actual && !actual.terminosPendientes ? { ...actual, terminosPendientes: true } : actual)),
    );
    return () => alHaberTerminosPendientes(null);
  }, []);

  // si un administrador suspende o banea la cuenta mientras se usa la app, se pasa a la pantalla de cuenta bloqueada
  useEffect(() => {
    alBloquearseLaCuenta((estado) =>
      setSesion((actual) => (actual && actual.estado !== estado ? { ...actual, estado } : actual)),
    );
    return () => alBloquearseLaCuenta(null);
  }, []);

  const marcarTerminosAceptados = useCallback(() => {
    setSesion((actual) => (actual ? { ...actual, terminosPendientes: false } : actual));
  }, []);

  // Sale de Firebase y del usuario de prueba, si había uno. Al vaciar la sesión, la app muestra la pantalla para entrar.
  const cerrarSesion = useCallback(async () => {
    elegirUsuarioDePrueba(null);
    await cerrarSesionDeFirebase();
    setSesion(null);
    setError(null);
    setSinLoguear(true);
  }, []);

  // Solo desarrollo: entra con otro usuario de prueba. Al vaciar la sesión, la navegación se arma
  // de nuevo desde Inicio, como si la app recién se abriera.
  const cambiarUsuarioDePrueba = useCallback(
    async (token: string) => {
      elegirUsuarioDePrueba(token);
      setSesion(null);
      await iniciar();
    },
    [iniciar],
  );

  return (
    <SesionContext.Provider
      value={{
        sesion,
        cargando,
        error,
        sinLoguear,
        reintentar: iniciar,
        alEntrar: iniciar,
        cerrarSesion,
        marcarTerminosAceptados,
        cambiarUsuarioDePrueba,
      }}>
      {children}
    </SesionContext.Provider>
  );
}

export function useSesion(): EstadoDeSesion {
  const estado = useContext(SesionContext);
  if (!estado) {
    throw new Error('useSesion se usa dentro de ProveedorDeSesion');
  }
  return estado;
}
