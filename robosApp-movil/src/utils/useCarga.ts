import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { mensajeDeError } from '../api/cliente';

// Carga datos del backend para una pantalla: los pide al entrar (y cada vez que se vuelve a ella),
// lleva la cuenta de si está cargando o falló, y permite refrescar deslizando hacia abajo.
// `pedir` tiene que ser estable (useCallback): cada vez que cambia, se vuelve a cargar.
export function useCarga<T>(pedir: () => Promise<T>) {
  const [datos, setDatos] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // si se dispara una carga nueva antes de que termine la anterior, la respuesta vieja se descarta
  const generacion = useRef(0);

  const recargar = useCallback(async () => {
    const mia = ++generacion.current;
    try {
      const resultado = await pedir();
      if (mia === generacion.current) {
        setDatos(resultado);
        setError(null);
      }
    } catch (e) {
      if (mia === generacion.current) {
        setError(mensajeDeError(e));
      }
    } finally {
      if (mia === generacion.current) {
        setCargando(false);
      }
    }
  }, [pedir]);

  useFocusEffect(
    useCallback(() => {
      recargar();
    }, [recargar]),
  );

  const refrescar = useCallback(async () => {
    setRefrescando(true);
    await recargar();
    setRefrescando(false);
  }, [recargar]);

  return { datos, setDatos, cargando, error, recargar, refrescando, refrescar };
}
