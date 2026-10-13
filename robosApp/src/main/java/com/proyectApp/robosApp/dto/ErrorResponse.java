package com.proyectApp.robosApp.dto;

import java.util.Map;

// errores: campo -> mensaje (vacío si el error no es de un campo puntual)
public record ErrorResponse(String mensaje, Map<String, String> errores) {

	public ErrorResponse(String mensaje) {
		this(mensaje, Map.of());
	}

}
