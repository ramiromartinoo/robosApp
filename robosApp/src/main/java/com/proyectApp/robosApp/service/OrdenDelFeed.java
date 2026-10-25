package com.proyectApp.robosApp.service;

// Cómo se ordena el feed, de lo más reciente a lo más viejo
public enum OrdenDelFeed {
	// por la hora real del hecho (la que eligió el autor)
	HECHO("fechaHoraIncidente"),
	// por la hora en que se publicó el reporte
	PUBLICACION("fechaHoraPublicacion");

	private final String campoFecha;

	OrdenDelFeed(String campoFecha) {
		this.campoFecha = campoFecha;
	}

	String campoFecha() {
		return campoFecha;
	}
}
