package com.proyectApp.robosApp.entity;

// Reputación de un usuario según cómo recibieron los vecinos sus reportes (ver ReputacionService).
// No se guarda: se calcula cada vez a partir de sus reportes, votos y sanciones.
public enum NivelDeConfianza {
	// cuenta reciente o con pocos reportes: todavía no hay historial para juzgarla
	NUEVO,
	// sin nada destacable, ni bueno ni malo
	NORMAL,
	// sus reportes suelen ser confirmados por otros vecinos
	CONFIABLE,
	// sus reportes suelen ser negados o los eliminó la moderación. Solo lo ve el administrador:
	// en el feed se muestra como NORMAL, para no exponer públicamente a nadie.
	DUDOSO
}
