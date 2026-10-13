package com.proyectApp.robosApp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.proyectApp.robosApp.dto.PaginaResponse;
import com.proyectApp.robosApp.dto.ResponderSugerenciaRequest;
import com.proyectApp.robosApp.dto.SugerenciaResponse;
import com.proyectApp.robosApp.entity.EstadoSugerencia;
import com.proyectApp.robosApp.service.SugerenciaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// Todo lo que cuelga de /admin exige rol ADMIN (ver SecurityConfig)
@RestController
@RequestMapping("/admin/sugerencias")
@RequiredArgsConstructor
public class AdminSugerenciaController {

	private final SugerenciaService sugerenciaService;

	@GetMapping
	public PaginaResponse<SugerenciaResponse> listar(
			@RequestParam(required = false) EstadoSugerencia estado,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		return sugerenciaService.listar(estado, page, size);
	}

	@PostMapping("/{id}/responder")
	public SugerenciaResponse responder(@PathVariable Long id,
			@Valid @RequestBody ResponderSugerenciaRequest request) {
		return sugerenciaService.responder(id, request.respuesta());
	}

}
