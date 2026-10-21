-- Datos internos para detectar abuso (cuentas múltiples, reportes falsos). Nunca se muestran en el feed.
-- Los reportes anteriores a esta migración quedan con estos campos vacíos.

alter table posteos
    -- IP desde la que se publicó (45 caracteres alcanzan para IPv6)
    add column ip_publicacion varchar(45),
    -- identificador que la app genera al instalarse; el mismo valor en varias cuentas = mismo teléfono
    add column dispositivo_id varchar(64),
    -- distancia en metros entre el teléfono y el lugar del reporte al publicar; null si no se conocía
    add column distancia_al_lugar_m int;

-- para buscar rápido otras cuentas que publicaron desde el mismo teléfono o la misma conexión
create index idx_posteos_dispositivo on posteos (dispositivo_id);
create index idx_posteos_ip on posteos (ip_publicacion);
