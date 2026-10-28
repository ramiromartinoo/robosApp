package com.proyectApp.robosApp.dto;

import java.time.LocalDateTime;

import com.proyectApp.robosApp.entity.Categoria;
import com.proyectApp.robosApp.entity.Posteo;

public record PosteoResponse(
		Long id,
		String descripcion,
		Categoria categoria,
		Double latitud,
		Double longitud,
		// referencia aproximada en texto (ej. "Av. Colón al 2300"); null en posteos que no la tienen
		String zona,
		LocalDateTime fechaHoraIncidente,
		LocalDateTime fechaHoraPublicacion,
		String autor,
		// true si el posteo es de quien hace la petición
		boolean esMio) {

	public static PosteoResponse desde(Posteo posteo, boolean esMio) {
		return new PosteoResponse(
				posteo.getId(),
				posteo.getDescripcion(),
				posteo.getCategoria(),
				aproximar(posteo.getLatitud()),
				aproximar(posteo.getLongitud()),
				posteo.getZona(),
				posteo.getFechaHoraIncidente(),
				posteo.getFechaHoraPublicacion(),
				posteo.getUsuario().getNombreVisible(),
				esMio);
	}

	// 3 decimales ≈ 100 metros: la ubicación pública es aproximada, nunca la exacta
	static Double aproximar(Double coordenada) {
		return Math.round(coordenada * 1000) / 1000.0;
	}

}
