// Pedidos del panel de administrador. El backend exige rol ADMIN en todo lo que cuelga de /admin:
// a un usuario común le responde 403 aunque llegue a hacer el pedido.

import { pedir } from './cliente';
import { Sugerencia } from './sugerencias';
import { Categoria, MotivoDenuncia, Pagina, PuntoHeatmap } from './tipos';

// Las listas del panel piden una sola página grande, que alcanza para el volumen de una beta
const TAMANIO = 50;

export type EstadoDeUsuario = 'ACTIVO' | 'SUSPENDIDO' | 'BANEADO';
export type EstadoDePosteo = 'ACTIVO' | 'EN_REVISION' | 'ELIMINADO';
export type Resolucion = 'ELIMINADO' | 'ADVERTENCIA' | 'DESCARTADA';

export type UsuarioAdmin = {
  id: number;
  email: string;
  nombreVisible: string;
  rol: 'CLIENTE' | 'ADMIN';
  estado: EstadoDeUsuario;
  advertencias: number;
  fechaRegistro: string;
};

export type PosteoAdmin = {
  id: number;
  descripcion: string;
  categoria: Categoria;
  latitud: number;
  longitud: number;
  fechaHoraIncidente: string;
  fechaHoraPublicacion: string;
  estado: EstadoDePosteo;
  usuarioId: number;
  autor: string;
  // metros entre el teléfono del autor y el lugar al publicar; null si no se conocía
  distanciaAlLugarM: number | null;
};

export type DenunciaAdmin = {
  id: number;
  motivo: MotivoDenuncia;
  comentario: string | null;
  fechaDenuncia: string;
  denuncianteId: number;
};

// Un posteo con todas sus denuncias pendientes
export type DenunciasDePosteo = {
  posteo: PosteoAdmin;
  cantidadPendientes: number;
  denuncias: DenunciaAdmin[];
};

export type Estadisticas = {
  desde: string;
  totalPosteos: number;
  porCategoria: { categoria: Categoria; cantidad: number }[];
  // zonas de ~1 km, de la más cargada a la menos
  porZona: PuntoHeatmap[];
};

// --- Denuncias ---

// Primero los posteos más denunciados
export function obtenerDenunciasPendientes(): Promise<Pagina<DenunciasDePosteo>> {
  return pedir(`/admin/denuncias?page=0&size=${TAMANIO}`);
}

// Resuelve de una vez todas las denuncias pendientes de ese posteo
export function resolverDenuncias(posteoId: number, resolucion: Resolucion): Promise<void> {
  return pedir(`/admin/reportes/${posteoId}/denuncias/resolver`, {
    method: 'POST',
    body: JSON.stringify({ resolucion }),
  });
}

// --- Reportes ---

export function obtenerReportes(filtros: {
  estado: EstadoDePosteo | null;
  usuarioId: number | null;
}): Promise<Pagina<PosteoAdmin>> {
  let ruta = `/admin/reportes?page=0&size=${TAMANIO}`;
  if (filtros.estado) {
    ruta += `&estado=${filtros.estado}`;
  }
  if (filtros.usuarioId !== null) {
    ruta += `&usuarioId=${filtros.usuarioId}`;
  }
  return pedir(ruta);
}

export function eliminarReporteComoAdmin(posteoId: number): Promise<void> {
  return pedir(`/admin/reportes/${posteoId}`, { method: 'DELETE' });
}

// --- Usuarios ---

export function obtenerUsuarios(): Promise<Pagina<UsuarioAdmin>> {
  return pedir(`/admin/usuarios?page=0&size=${TAMANIO}`);
}

export function cambiarEstadoDeUsuario(usuarioId: number, estado: EstadoDeUsuario): Promise<UsuarioAdmin> {
  return pedir(`/admin/usuarios/${usuarioId}/estado`, { method: 'PUT', body: JSON.stringify({ estado }) });
}

// Borra al usuario y todo lo suyo. No se puede deshacer.
export function eliminarUsuario(usuarioId: number): Promise<void> {
  return pedir(`/admin/usuarios/${usuarioId}`, { method: 'DELETE' });
}

// --- Sugerencias ---

export function obtenerSugerencias(soloPendientes: boolean): Promise<Pagina<Sugerencia>> {
  return pedir(`/admin/sugerencias?page=0&size=${TAMANIO}${soloPendientes ? '&estado=PENDIENTE' : ''}`);
}

export function responderSugerencia(sugerenciaId: number, respuesta: string): Promise<Sugerencia> {
  return pedir(`/admin/sugerencias/${sugerenciaId}/responder`, {
    method: 'POST',
    body: JSON.stringify({ respuesta }),
  });
}

// --- Estadísticas ---

export function obtenerEstadisticas(dias: number): Promise<Estadisticas> {
  return pedir(`/admin/estadisticas?dias=${dias}`);
}

// --- Antiabuso ---

export type CuentaRelacionada = { id: number; nombreVisible: string; estado: EstadoDeUsuario };

export type CuentasRelacionadas = {
  // indicio fuerte: publicaron desde el mismo teléfono
  mismoTelefono: CuentaRelacionada[];
  // indicio débil: misma IP (también pasa con familias o vecinos que comparten wifi)
  mismaConexion: CuentaRelacionada[];
};

export function obtenerCuentasRelacionadas(usuarioId: number): Promise<CuentasRelacionadas> {
  return pedir(`/admin/usuarios/${usuarioId}/relacionadas`);
}
