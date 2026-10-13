package com.proyectApp.robosApp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.proyectApp.robosApp.dto.EstadisticasResponse;
import com.proyectApp.robosApp.service.EstadisticasService;

import lombok.RequiredArgsConstructor;

// Todo lo que cuelga de /admin exige rol ADMIN (ver SecurityConfig)
@RestController
@RequestMapping("/admin/estadisticas")
@RequiredArgsConstructor
public class AdminEstadisticasController {

	private final EstadisticasService estadisticasService;

	@GetMapping
	public EstadisticasResponse resumen(@RequestParam(defaultValue = "30") int dias) {
		return estadisticasService.resumen(dias);
	}

}
