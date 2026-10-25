// "hace 5 min", "hace 3 h", "hace 2 días"... a partir de una fecha del backend
export function haceCuanto(fechaIso: string): string {
  const minutos = Math.floor((Date.now() - new Date(fechaIso).getTime()) / 60000);
  if (Number.isNaN(minutos)) {
    return '';
  }
  if (minutos < 1) {
    return 'recién';
  }
  if (minutos < 60) {
    return `hace ${minutos} min`;
  }
  const horas = Math.floor(minutos / 60);
  if (horas < 24) {
    return `hace ${horas} h`;
  }
  const dias = Math.floor(horas / 24);
  return dias === 1 ? 'hace 1 día' : `hace ${dias} días`;
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// Versión corta, como la de Twitter: "ahora", "5 min", "3 h", "2 d" y, pasada una semana, "18 oct"
export function haceCuantoCorto(fechaIso: string): string {
  const fecha = new Date(fechaIso);
  const minutos = Math.floor((Date.now() - fecha.getTime()) / 60000);
  if (Number.isNaN(minutos)) {
    return '';
  }
  if (minutos < 1) {
    return 'ahora';
  }
  if (minutos < 60) {
    return `${minutos} min`;
  }
  const horas = Math.floor(minutos / 60);
  if (horas < 24) {
    return `${horas} h`;
  }
  const dias = Math.floor(horas / 24);
  if (dias < 7) {
    return `${dias} d`;
  }
  return `${fecha.getDate()} ${MESES[fecha.getMonth()]}`;
}

const dosDigitos = (numero: number) => String(numero).padStart(2, '0');

// El backend espera fecha y hora local sin zona horaria: "2026-10-09T18:30:00".
// No sirve toISOString(), que convierte a UTC y correría la hora 3 horas.
export function aFechaDelBackend(fecha: Date): string {
  return (
    `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}` +
    `T${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}:00`
  );
}

// "Hoy 18:30 hs", "Ayer 23:10 hs" o "09/10 18:30 hs"
export function fechaLegible(fecha: Date): string {
  const hora = `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())} hs`;
  const inicioDeHoy = new Date();
  inicioDeHoy.setHours(0, 0, 0, 0);
  const diasAtras = Math.ceil((inicioDeHoy.getTime() - fecha.getTime()) / 86400000);
  if (diasAtras <= 0) {
    return `Hoy ${hora}`;
  }
  if (diasAtras === 1) {
    return `Ayer ${hora}`;
  }
  return `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)} ${hora}`;
}
