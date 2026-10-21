import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { mensajeDeError } from '../api/cliente';
import { Pagina } from '../api/tipos';

// Lista que se carga de a páginas: trae la primera al entrar a la pantalla (y cada vez que se vuelve
// a ella), y las siguientes a pedido con cargarMas. `pedirPagina` tiene que ser estable (useCallback):
// cada vez que cambia (por ejemplo, un filtro), la lista vuelve a empezar desde la primera página.
export function usePaginado<T extends { id: number } | object>(pedirPagina: (pagina: number) => Promise<Pagina<T>>) {
  const [items, setItems] = useState<T[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hayMas, setHayMas] = useState(false);

  const siguientePagina = useRef(0);
  // cada carga desde el principio inaugura una generación; las respuestas de generaciones viejas
  // se descartan (por ejemplo, si se cambia un filtro mientras todavía llegaba la lista anterior)
  const generacion = useRef(0);
  const pidiendoMas = useRef(false);

  const recargar = useCallback(async () => {
    const mia = ++generacion.current;
    pidiendoMas.current = false;
    try {
      const pagina = await pedirPagina(0);
      if (mia === generacion.current) {
        setItems(pagina.contenido);
        siguientePagina.current = 1;
        setHayMas(!pagina.ultima);
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
  }, [pedirPagina]);

  const cargarMas = useCallback(async () => {
    if (pidiendoMas.current || !hayMas) {
      return;
    }
    const mia = generacion.current;
    pidiendoMas.current = true;
    setCargandoMas(true);
    try {
      const pagina = await pedirPagina(siguientePagina.current);
      if (mia === generacion.current) {
        // si entró algo nuevo mientras tanto, la página siguiente puede repetir elementos ya mostrados
        setItems((actuales) => {
          const yaEstan = new Set(actuales.map(clave));
          return [...actuales, ...pagina.contenido.filter((item) => !yaEstan.has(clave(item)))];
        });
        siguientePagina.current += 1;
        setHayMas(!pagina.ultima);
      }
    } catch (e) {
      if (mia === generacion.current) {
        setError(mensajeDeError(e));
      }
    } finally {
      if (mia === generacion.current) {
        pidiendoMas.current = false;
        setCargandoMas(false);
      }
    }
  }, [pedirPagina, hayMas]);

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

  return { items, setItems, cargando, cargandoMas, error, hayMas, cargarMas, recargar, refrescando, refrescar };
}

// Identifica un elemento para no repetirlo: su id, o el id de su posteo (denuncias agrupadas por posteo)
function clave(item: object): unknown {
  if ('id' in item) {
    return item.id;
  }
  if ('posteo' in item && item.posteo && typeof item.posteo === 'object' && 'id' in item.posteo) {
    return item.posteo.id;
  }
  return item;
}
