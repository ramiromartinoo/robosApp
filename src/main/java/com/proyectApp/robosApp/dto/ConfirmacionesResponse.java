package com.proyectApp.robosApp.dto;

import com.proyectApp.robosApp.entity.TipoConfirmacion;

// Cómo quedó el posteo después de votar
public record ConfirmacionesResponse(
		Long posteoId,
		long confirmaciones,
		long negaciones,
		// null si el usuario no tiene voto (por ejemplo, después de anularlo)
		TipoConfirmacion miVoto) {
}
