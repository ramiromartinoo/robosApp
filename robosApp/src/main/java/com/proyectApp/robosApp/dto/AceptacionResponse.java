package com.proyectApp.robosApp.dto;

import java.time.LocalDateTime;

import com.proyectApp.robosApp.entity.AceptacionTerminos;

public record AceptacionResponse(
		Long terminosId,
		String version,
		LocalDateTime fechaAceptacion) {

	public static AceptacionResponse desde(AceptacionTerminos aceptacion) {
		return new AceptacionResponse(
				aceptacion.getTerminos().getId(),
				aceptacion.getTerminos().getVersion(),
				aceptacion.getFechaAceptacion());
	}

}
