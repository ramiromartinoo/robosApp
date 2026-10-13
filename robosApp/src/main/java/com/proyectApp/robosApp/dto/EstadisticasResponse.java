package com.proyectApp.robosApp.dto;

import java.time.LocalDateTime;
import java.util.List;

// Posteos del período (por hora real del hecho), sin contar los eliminados
public record EstadisticasResponse(
		LocalDateTime desde,
		long totalPosteos,
		List<ConteoCategoriaResponse> porCategoria,
		// zonas de ≈ 1 km, de la más cargada a la menos
		List<PuntoHeatmapResponse> porZona) {
}
