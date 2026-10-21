package com.proyectApp.robosApp.dto;

import java.time.LocalDateTime;

import com.proyectApp.robosApp.entity.Categoria;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record CrearPosteoRequest(

		@NotBlank(message = "La descripción es obligatoria")
		@Size(max = 280, message = "La descripción no puede superar los 280 caracteres")
		String descripcion,

		@NotNull(message = "La categoría es obligatoria")
		Categoria categoria,

		@NotNull(message = "La latitud es obligatoria")
		@DecimalMin(value = "-90", message = "Latitud inválida")
		@DecimalMax(value = "90", message = "Latitud inválida")
		Double latitud,

		@NotNull(message = "La longitud es obligatoria")
		@DecimalMin(value = "-180", message = "Longitud inválida")
		@DecimalMax(value = "180", message = "Longitud inválida")
		Double longitud,

		// opcional: referencia aproximada (calle y altura redondeada), nunca la dirección exacta
		@Size(max = 80, message = "La zona no puede superar los 80 caracteres")
		String zona,

		// opcional: metros entre el teléfono y el lugar del reporte, calculados en la app (dato interno antiabuso)
		@PositiveOrZero(message = "La distancia no puede ser negativa")
		Integer distanciaAlLugarM,

		@NotNull(message = "La fecha y hora del hecho es obligatoria")
		@PastOrPresent(message = "El hecho no puede haber ocurrido en el futuro")
		LocalDateTime fechaHoraIncidente) {
}
