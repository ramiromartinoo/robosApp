package com.proyectApp.robosApp.controller;

import java.util.Map;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.proyectApp.robosApp.config.DatosDeEjemplo;

import lombok.RequiredArgsConstructor;

// SOLO DESARROLLO: no existe si robosapp.seguridad.tokens-de-prueba no está en true.
// Además cuelga de /admin, así que exige rol ADMIN (ver SecurityConfig).
@RestController
@RequestMapping("/admin/dev")
@ConditionalOnProperty(name = "robosapp.seguridad.tokens-de-prueba", havingValue = "true")
@RequiredArgsConstructor
public class DatosDeEjemploController {

	private final DatosDeEjemplo datosDeEjemplo;

	// BORRA todos los reportes y denuncias, y carga los de ejemplo
	@PostMapping("/datos-de-ejemplo")
	public Map<String, Integer> reiniciar() {
		return datosDeEjemplo.reiniciar();
	}

}
