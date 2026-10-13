package com.proyectApp.robosApp.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

// Arma el Pageable a partir de lo que manda el cliente, sin confiar en los valores
final class Paginacion {

	private static final int TAMANIO_MAXIMO = 50;

	private Paginacion() {
	}

	static Pageable de(int pagina, int tamanio, Sort orden) {
		return PageRequest.of(Math.max(pagina, 0), Math.clamp(tamanio, 1, TAMANIO_MAXIMO), orden);
	}

	static Pageable masRecientesPrimero(int pagina, int tamanio, String campoFecha) {
		// el id desempata: sin eso, filas con la misma fecha podrían repetirse o saltearse entre páginas
		return de(pagina, tamanio, Sort.by(Sort.Direction.DESC, campoFecha, "id"));
	}

}
