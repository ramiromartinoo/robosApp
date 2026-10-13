import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

import { alHaberTerminosPendientes, ErrorDeApi } from '../api/cliente';
import { iniciarSesion, Sesion } from '../api/sesion';

type EstadoDeSesion = {
  // null mientras se está iniciando o si falló
  sesion: Sesion | null;
  cargando: boolean;
  error: string | null;
  reintentar: () => void;
  // lo llama la pantalla de bienvenida cuando el usuario acepta los términos
  marcarTerminosAceptados: () => void;
};

const SesionContext = createContext<EstadoDeSesion | null>(null);

// Inicia la sesión al abrir la app y la comparte con todas las pantallas
export function ProveedorDeSesion({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const iniciar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setSesion(await iniciarSesion());
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

  const marcarTerminosAceptados = useCallback(() => {
    setSesion((actual) => (actual ? { ...actual, terminosPendientes: false } : actual));
  }, []);

  return (
    <SesionContext.Provider value={{ sesion, cargando, error, reintentar: iniciar, marcarTerminosAceptados }}>
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
