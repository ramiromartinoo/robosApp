package com.proyectApp.robosApp.dto;

import java.time.LocalDateTime;

import com.proyectApp.robosApp.entity.TerminosCondiciones;

public record TerminosResponse(
		Long id,
		String version,
		String texto,
		LocalDateTime fechaPublicacion) {

	public static TerminosResponse desde(TerminosCondiciones terminos) {
		return new TerminosResponse(
				terminos.getId(),
				terminos.getVersion(),
				terminos.getTexto(),
				terminos.getFechaPublicacion());
	}

}
