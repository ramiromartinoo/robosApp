// Formas de los datos que devuelve el backend (los DTO de Java)

export type Categoria = 'ROBO_AUTO' | 'HURTO' | 'ARREBATO' | 'ROBO_DOMICILIO' | 'ROBO_COMERCIO' | 'OTRO';

export type TipoConfirmacion = 'CONFIRMA' | 'NIEGA';

export type MotivoDenuncia = 'INFORMACION_FALSA' | 'CONTENIDO_OFENSIVO' | 'SPAM' | 'DATOS_PERSONALES' | 'OTRO';

export type Posteo = {
  id: number;
  descripcion: string;
  categoria: Categoria;
  // ubicación aproximada: el backend nunca devuelve la exacta
  latitud: number;
  longitud: number;
  // referencia aproximada en texto (ej. "Av. Colón al 2300"); null si el reporte no la tiene
  zona: string | null;
  // fecha y hora local, sin zona horaria (ej. "2026-10-09T18:30:00")
  fechaHoraIncidente: string;
  fechaHoraPublicacion: string;
  autor: string;
  confirmaciones: number;
  negaciones: number;
  // qué votó el usuario de la app (null si no votó)
  miVoto: TipoConfirmacion | null;
  // true si el reporte lo publicó el usuario de la app
  esMio: boolean;
  // reputación del autor (ver ReputacionService en el backend). Nunca llega "DUDOSO": eso solo lo ve el admin
  autorConfianza: 'NUEVO' | 'NORMAL' | 'CONFIABLE';
};

// Un reporte visto por su autor (GET /reportes/mios)
export type MiReporte = {
  id: number;
  descripcion: string;
  categoria: Categoria;
  latitud: number;
  longitud: number;
  zona: string | null;
  fechaHoraIncidente: string;
  fechaHoraPublicacion: string;
  // EN_REVISION: oculto del feed por acumular denuncias, hasta que un administrador lo revise
  estado: 'ACTIVO' | 'EN_REVISION';
  confirmaciones: number;
  negaciones: number;
  // 0 si ya no se puede editar
  segundosParaEditar: number;
};

// Respuesta de votar (POST) o anular el voto (DELETE) en /reportes/{id}/confirmar
export type Confirmaciones = {
  posteoId: number;
  confirmaciones: number;
  negaciones: number;
  // null después de anular el voto
  miVoto: TipoConfirmacion | null;
};

// Un punto del mapa de calor: zona aproximada y cuántos reportes hubo ahí
export type PuntoHeatmap = {
  latitud: number;
  longitud: number;
  peso: number;
};

export type Pagina<T> = {
  contenido: T[];
  pagina: number;
  tamanio: number;
  totalElementos: number;
  totalPaginas: number;
  ultima: boolean;
};
