package com.proyectApp.robosApp.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.proyectApp.robosApp.dto.AdminPosteoResponse;
import com.proyectApp.robosApp.dto.DenunciasDePosteoResponse;
import com.proyectApp.robosApp.dto.PaginaResponse;
import com.proyectApp.robosApp.dto.ResolucionResponse;
import com.proyectApp.robosApp.dto.ResolverDenunciasRequest;
import com.proyectApp.robosApp.entity.EstadoPosteo;
import com.proyectApp.robosApp.service.ModeracionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// Todo lo que cuelga de /admin exige rol ADMIN (ver SecurityConfig)
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminModeracionController {

	private final ModeracionService moderacionService;

	// Todos los posteos, en cualquier estado. Filtros opcionales: usuarioId y estado.
	@GetMapping("/reportes")
	public PaginaResponse<AdminPosteoResponse> listarPosteos(
			@RequestParam(required = false) Long usuarioId,
			@RequestParam(required = false) EstadoPosteo estado,
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		return moderacionService.listarPosteos(usuarioId, estado, page, size);
	}

	@DeleteMapping("/reportes/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void eliminarPosteo(@PathVariable Long id) {
		moderacionService.eliminarPosteo(id);
	}

	// Denuncias pendientes agrupadas por posteo, primero los más denunciados
	@GetMapping("/denuncias")
	public PaginaResponse<DenunciasDePosteoResponse> denunciasPendientes(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		return moderacionService.denunciasPendientes(page, size);
	}

	// Resuelve todas las denuncias pendientes de ese posteo con la misma resolución
	@PostMapping("/reportes/{id}/denuncias/resolver")
	public ResolucionResponse resolverDenuncias(@PathVariable Long id,
			@Valid @RequestBody ResolverDenunciasRequest request) {
		return moderacionService.resolverDenuncias(id, request.resolucion());
	}

}
