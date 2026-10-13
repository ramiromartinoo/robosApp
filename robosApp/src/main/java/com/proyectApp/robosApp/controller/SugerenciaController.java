package com.proyectApp.robosApp.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.proyectApp.robosApp.dto.CrearSugerenciaRequest;
import com.proyectApp.robosApp.dto.PaginaResponse;
import com.proyectApp.robosApp.dto.SugerenciaResponse;
import com.proyectApp.robosApp.service.SugerenciaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/sugerencias")
@RequiredArgsConstructor
public class SugerenciaController {

	private final SugerenciaService sugerenciaService;

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public SugerenciaResponse crear(@Valid @RequestBody CrearSugerenciaRequest request) {
		return sugerenciaService.crear(request.texto());
	}

	@GetMapping("/mias")
	public PaginaResponse<SugerenciaResponse> mias(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		return sugerenciaService.mias(page, size);
	}

}
