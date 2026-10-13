package com.proyectApp.robosApp.dto;

import com.proyectApp.robosApp.entity.EstadoPosteo;
import com.proyectApp.robosApp.entity.ResolucionDenuncia;

public record ResolucionResponse(
		Long posteoId,
		ResolucionDenuncia resolucion,
		int denunciasResueltas,
		// cómo quedó el posteo después de resolver
		EstadoPosteo estadoPosteo) {
}
