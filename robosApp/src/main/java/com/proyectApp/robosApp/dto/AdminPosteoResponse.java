package com.proyectApp.robosApp.dto;

import java.time.LocalDateTime;

import com.proyectApp.robosApp.entity.Categoria;
import com.proyectApp.robosApp.entity.EstadoPosteo;
import com.proyectApp.robosApp.entity.Posteo;
import com.proyectApp.robosApp.service.AntecedentesService.Antecedentes;

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
		String autor,
		// metros entre el teléfono del autor y el lugar al publicar (null si no se conocía).
		// Una distancia muy grande no prueba nada, pero ayuda a evaluar un reporte denunciado.
		Integer distanciaAlLugarM,
		// reportes publicados, reportes eliminados por la moderación y advertencias del autor
		Antecedentes antecedentesDelAutor) {

	public static AdminPosteoResponse desde(Posteo posteo, Antecedentes antecedentesDelAutor) {
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
				posteo.getUsuario().getNombreVisible(),
				posteo.getDistanciaAlLugarM(),
				antecedentesDelAutor);
	}

}
