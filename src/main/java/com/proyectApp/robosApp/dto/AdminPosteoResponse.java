package com.proyectApp.robosApp.dto;

import java.time.LocalDateTime;

import com.proyectApp.robosApp.entity.Categoria;
import com.proyectApp.robosApp.entity.EstadoPosteo;
import com.proyectApp.robosApp.entity.Posteo;

// Vista de un posteo para el panel admin: suma el estado y quién lo publicó.
// La ubicación sigue siendo la aproximada: para moderar no hace falta la exacta.
public record AdminPosteoResponse(
		Long id,
		String descripcion,
		Categoria categoria,
		Double latitud,
		Double longitud,
		LocalDateTime fechaHoraIncidente,
		LocalDateTime fechaHoraPublicacion,
		EstadoPosteo estado,
		Long usuarioId,
		String autor) {

	public static AdminPosteoResponse desde(Posteo posteo) {
		return new AdminPosteoResponse(
				posteo.getId(),
				posteo.getDescripcion(),
				posteo.getCategoria(),
				PosteoResponse.aproximar(posteo.getLatitud()),
				PosteoResponse.aproximar(posteo.getLongitud()),
				posteo.getFechaHoraIncidente(),
				posteo.getFechaHoraPublicacion(),
				posteo.getEstado(),
				posteo.getUsuario().getId(),
				posteo.getUsuario().getNombreVisible());
	}

}
