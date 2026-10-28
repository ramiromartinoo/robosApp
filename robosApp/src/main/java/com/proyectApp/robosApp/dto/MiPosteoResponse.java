package com.proyectApp.robosApp.dto;

import java.time.LocalDateTime;

import com.proyectApp.robosApp.entity.Categoria;
import com.proyectApp.robosApp.entity.EstadoPosteo;
import com.proyectApp.robosApp.entity.Posteo;

// Un posteo visto por su autor: suma el estado y cuánto tiempo le queda para editarlo
public record MiPosteoResponse(
		Long id,
		String descripcion,
		Categoria categoria,
		Double latitud,
		Double longitud,
		String zona,
		LocalDateTime fechaHoraIncidente,
		LocalDateTime fechaHoraPublicacion,
		// ACTIVO o EN_REVISION (los eliminados no se listan)
		EstadoPosteo estado,
		// 0 si ya venció la ventana de edición. Va en segundos restantes y no como fecha límite
		// para que no dependa de que el reloj del teléfono coincida con el del servidor.
		long segundosParaEditar) {

	public static MiPosteoResponse desde(Posteo posteo, long segundosParaEditar) {
		return new MiPosteoResponse(
				posteo.getId(),
				posteo.getDescripcion(),
				posteo.getCategoria(),
				PosteoResponse.aproximar(posteo.getLatitud()),
				PosteoResponse.aproximar(posteo.getLongitud()),
				posteo.getZona(),
				posteo.getFechaHoraIncidente(),
				posteo.getFechaHoraPublicacion(),
				posteo.getEstado(),
				segundosParaEditar);
	}

}
