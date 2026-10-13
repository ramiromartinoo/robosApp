package com.proyectApp.robosApp.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.proyectApp.robosApp.dto.CambiarEstadoUsuarioRequest;
import com.proyectApp.robosApp.dto.PaginaResponse;
import com.proyectApp.robosApp.dto.UsuarioResponse;
import com.proyectApp.robosApp.service.AdminUsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

// Todo lo que cuelga de /admin exige rol ADMIN (ver SecurityConfig)
@RestController
@RequestMapping("/admin/usuarios")
@RequiredArgsConstructor
public class AdminUsuarioController {

	private final AdminUsuarioService adminUsuarioService;

	@GetMapping
	public PaginaResponse<UsuarioResponse> listar(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "20") int size) {
		return adminUsuarioService.listar(page, size);
	}

	// Suspender, banear o reactivar
	@PutMapping("/{id}/estado")
	public UsuarioResponse cambiarEstado(@PathVariable Long id,
			@Valid @RequestBody CambiarEstadoUsuarioRequest request) {
		return adminUsuarioService.cambiarEstado(id, request.estado());
	}

	// Borrado definitivo del usuario y de todo lo suyo
	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void eliminar(@PathVariable Long id) {
		adminUsuarioService.eliminar(id);
	}

}
