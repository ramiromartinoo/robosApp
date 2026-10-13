package com.proyectApp.robosApp.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.proyectApp.robosApp.dto.PublicarTerminosRequest;
import com.proyectApp.robosApp.dto.TerminosResponse;
import com.proyectApp.robosApp.service.TerminosService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// Todo lo que cuelga de /admin exige rol ADMIN (ver SecurityConfig)
@RestController
@RequestMapping("/admin/terminos")
@RequiredArgsConstructor
public class AdminTerminosController {

	private final TerminosService terminosService;

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public TerminosResponse publicar(@Valid @RequestBody PublicarTerminosRequest request) {
		return terminosService.publicar(request);
	}

}
