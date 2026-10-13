package com.proyectApp.robosApp.dto;

import java.time.LocalDateTime;

import com.proyectApp.robosApp.entity.EstadoSugerencia;
import com.proyectApp.robosApp.entity.Sugerencia;

public record SugerenciaResponse(
		Long id,
		String texto,
		EstadoSugerencia estado,
		String respuesta,
		LocalDateTime fecha,
		LocalDateTime fechaRespuesta,
		Long usuarioId,
		String autor) {

	public static SugerenciaResponse desde(Sugerencia sugerencia) {
		return new SugerenciaResponse(
				sugerencia.getId(),
				sugerencia.getTexto(),
				sugerencia.getEstado(),
				sugerencia.getRespuesta(),
				sugerencia.getFecha(),
				sugerencia.getFechaRespuesta(),
				sugerencia.getUsuario().getId(),
				sugerencia.getUsuario().getNombreVisible());
	}

}
