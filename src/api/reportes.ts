import { pedir } from './cliente';
import {
  Categoria,
  Confirmaciones,
  MotivoDenuncia,
  Pagina,
  Posteo,
  PuntoHeatmap,
  TipoConfirmacion,
} from './tipos';

const TAMANIO_PAGINA = 20;

export type NuevoReporte = {
  descripcion: string;
  categoria: Categoria;
  latitud: number;
  longitud: number;
  // referencia aproximada en texto (ver obtenerZona); null si no se pudo averiguar
  zona: string | null;
  // fecha y hora local sin zona horaria (ver aFechaDelBackend)
  fechaHoraIncidente: string;
};

export type FiltrosDeReportes = {
  // null = todos los tipos de hecho
  categoria: Categoria | null;
  // null = toda la ciudad
  cerca: { latitud: number; longitud: number; radioKm: number } | null;
};

export function obtenerFeed(pagina: number, filtros: FiltrosDeReportes): Promise<Pagina<Posteo>> {
  let ruta = `/reportes?page=${pagina}&size=${TAMANIO_PAGINA}`;
  if (filtros.categoria) {
    ruta += `&categoria=${filtros.categoria}`;
  }
  if (filtros.cerca) {
    ruta += `&lat=${filtros.cerca.latitud}&lng=${filtros.cerca.longitud}&radio=${filtros.cerca.radioKm}`;
  }
  return pedir<Pagina<Posteo>>(ruta);
}

// Reportes de las últimas `horas` horas, agrupados por zona
export function obtenerHeatmap(horas: number): Promise<PuntoHeatmap[]> {
  return pedir<PuntoHeatmap[]>(`/reportes/heatmap?horas=${horas}`);
}

export function crearReporte(reporte: NuevoReporte): Promise<Posteo> {
  return pedir<Posteo>('/reportes', { method: 'POST', body: JSON.stringify(reporte) });
}

// Votar de nuevo cambia el voto anterior
export function votar(posteoId: number, tipo: TipoConfirmacion): Promise<Confirmaciones> {
  return pedir<Confirmaciones>(`/reportes/${posteoId}/confirmar`, {
    method: 'POST',
    body: JSON.stringify({ tipo }),
  });
}

export function quitarVoto(posteoId: number): Promise<Confirmaciones> {
  return pedir<Confirmaciones>(`/reportes/${posteoId}/confirmar`, { method: 'DELETE' });
}

export function denunciar(posteoId: number, motivo: MotivoDenuncia): Promise<void> {
  return pedir<void>(`/reportes/${posteoId}/denunciar`, { method: 'POST', body: JSON.stringify({ motivo }) });
}
