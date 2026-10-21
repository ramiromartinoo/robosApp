import { pedir } from './cliente';
import { Pagina } from './tipos';

export type Sugerencia = {
  id: number;
  texto: string;
  estado: 'PENDIENTE' | 'RESPONDIDA';
  // respuesta del administrador; null mientras está pendiente
  respuesta: string | null;
  fecha: string;
  fechaRespuesta: string | null;
  usuarioId: number;
  autor: string;
};

export function enviarSugerencia(texto: string): Promise<Sugerencia> {
  return pedir<Sugerencia>('/sugerencias', { method: 'POST', body: JSON.stringify({ texto }) });
}

// Las del usuario, de la más nueva a la más vieja, de a 20
export function obtenerMisSugerencias(pagina = 0): Promise<Pagina<Sugerencia>> {
  return pedir<Pagina<Sugerencia>>(`/sugerencias/mias?page=${pagina}&size=20`);
}
