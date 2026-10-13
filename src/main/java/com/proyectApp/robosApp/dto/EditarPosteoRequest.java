package com.proyectApp.robosApp.dto;

import java.time.LocalDateTime;

import com.proyectApp.robosApp.entity.Categoria;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

// Lo que se puede corregir de un posteo ya publicado. La ubicación no se edita:
// la app solo conoce la aproximada, y reenviarla pisaría la exacta que está guardada.
public record EditarPosteoRequest(

		@NotBlank(message = "La descripción es obligatoria")
		@Size(max = 280, message = "La descripción no puede superar los 280 caracteres")
		String descripcion,

		@NotNull(message = "La categoría es obligatoria")
		Categoria categoria,

		@NotNull(message = "La fecha y hora del hecho es obligatoria")
		@PastOrPresent(message = "El hecho no puede haber ocurrido en el futuro")
		LocalDateTime fechaHoraIncidente) {
}
