package com.proyectApp.robosApp.dto;

import com.proyectApp.robosApp.entity.ResolucionDenuncia;

import jakarta.validation.constraints.NotNull;

public record ResolverDenunciasRequest(

		@NotNull(message = "La resolución es obligatoria")
		ResolucionDenuncia resolucion) {
}
