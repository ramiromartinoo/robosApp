-- Esquema inicial de Radar Vecinal.
--
-- Es el que generaba Hibernate a partir de las entidades hasta que se pasó a Flyway.
-- En una base nueva se ejecuta completo. En una base que ya existía (creada por Hibernate),
-- Flyway la marca como versión 1 sin ejecutar nada (ver spring.flyway.baseline-on-migrate).
--
-- Las categorías, estados y demás valores fijos se guardan como texto SIN restricción CHECK:
-- así, agregar un valor nuevo a un enum de Java no obliga a modificar la tabla.
--
-- Regla de oro: una migración que ya se ejecutó en alguna base NO se edita nunca.
-- Cualquier cambio va en un archivo nuevo: V2__..., V3__..., etc.

create table usuarios (
    id bigint not null auto_increment,
    firebase_uid varchar(128) not null,
    email varchar(255) not null,
    nombre_visible varchar(50) not null,
    rol varchar(20) not null,
    estado varchar(20) not null,
    advertencias int not null default 0,
    fecha_registro datetime(6) not null,
    primary key (id),
    constraint uk_usuarios_firebase_uid unique (firebase_uid),
    constraint uk_usuarios_email unique (email)
) engine=InnoDB;

create table posteos (
    id bigint not null auto_increment,
    usuario_id bigint not null,
    descripcion varchar(280) not null,
    categoria varchar(20) not null,
    latitud float(53) not null,
    longitud float(53) not null,
    zona varchar(80),
    fecha_hora_incidente datetime(6) not null,
    fecha_hora_publicacion datetime(6) not null,
    estado varchar(20) not null,
    primary key (id),
    constraint fk_posteos_usuario foreign key (usuario_id) references usuarios (id)
) engine=InnoDB;

-- el feed y el mapa de calor filtran por estado y ordenan por la hora real del hecho
create index idx_posteos_estado_incidente on posteos (estado, fecha_hora_incidente);
create index idx_posteos_lat_lng on posteos (latitud, longitud);

create table denuncias (
    id bigint not null auto_increment,
    posteo_id bigint not null,
    usuario_denunciante_id bigint not null,
    motivo varchar(20) not null,
    comentario varchar(280),
    estado varchar(20) not null,
    resolucion varchar(20),
    fecha_denuncia datetime(6) not null,
    fecha_resolucion datetime(6),
    admin_resolvio_id bigint,
    primary key (id),
    -- un usuario puede denunciar un mismo posteo una sola vez
    constraint uk_denuncias_posteo_usuario unique (posteo_id, usuario_denunciante_id),
    constraint fk_denuncias_posteo foreign key (posteo_id) references posteos (id),
    constraint fk_denuncias_denunciante foreign key (usuario_denunciante_id) references usuarios (id),
    constraint fk_denuncias_admin foreign key (admin_resolvio_id) references usuarios (id)
) engine=InnoDB;

create index idx_denuncias_estado_posteo on denuncias (estado, posteo_id);

create table confirmaciones (
    id bigint not null auto_increment,
    posteo_id bigint not null,
    usuario_id bigint not null,
    tipo varchar(20) not null,
    fecha datetime(6) not null,
    primary key (id),
    -- un usuario, un voto por posteo
    constraint uk_confirmaciones_posteo_usuario unique (posteo_id, usuario_id),
    constraint fk_confirmaciones_posteo foreign key (posteo_id) references posteos (id),
    constraint fk_confirmaciones_usuario foreign key (usuario_id) references usuarios (id)
) engine=InnoDB;

create table sugerencias (
    id bigint not null auto_increment,
    usuario_id bigint not null,
    texto varchar(500) not null,
    estado varchar(20) not null,
    respuesta varchar(500),
    fecha datetime(6) not null,
    fecha_respuesta datetime(6),
    primary key (id),
    constraint fk_sugerencias_usuario foreign key (usuario_id) references usuarios (id)
) engine=InnoDB;

create table terminos_condiciones (
    id bigint not null auto_increment,
    version varchar(30) not null,
    texto mediumtext not null,
    fecha_publicacion datetime(6) not null,
    primary key (id),
    constraint uk_terminos_version unique (version)
) engine=InnoDB;

create table aceptacion_terminos (
    id bigint not null auto_increment,
    usuario_id bigint not null,
    terminos_id bigint not null,
    fecha_aceptacion datetime(6) not null,
    ip_address varchar(45),
    primary key (id),
    constraint uk_aceptacion_usuario_terminos unique (usuario_id, terminos_id),
    constraint fk_aceptacion_usuario foreign key (usuario_id) references usuarios (id),
    constraint fk_aceptacion_terminos foreign key (terminos_id) references terminos_condiciones (id)
) engine=InnoDB;
