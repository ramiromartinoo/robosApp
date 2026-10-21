package com.proyectApp.robosApp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.proyectApp.robosApp.dto.AceptacionResponse;
import com.proyectApp.robosApp.dto.AceptarTerminosRequest;
import com.proyectApp.robosApp.dto.TerminosResponse;
import com.proyectApp.robosApp.service.TerminosService;
import com.proyectApp.robosApp.service.UsuarioActualService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/terminos")
@RequiredArgsConstructor
public class TerminosController {

	private final TerminosService terminosService;
	private final UsuarioActualService usuarioActualService;

	// Público: se tienen que poder leer antes de registrarse
	@GetMapping("/vigentes")
	public TerminosResponse vigentes() {
		return terminosService.vigentes();
	}

	@PostMapping("/aceptar")
	public AceptacionResponse aceptar(@Valid @RequestBody AceptarTerminosRequest request,
			HttpServletRequest httpRequest) {
		// detrás de un proxy, el perfil prod hace que esta sea la IP real del usuario (ver application-prod.yaml)
		return terminosService.aceptar(usuarioActualService.obtener(), request.terminosId(),
				httpRequest.getRemoteAddr());
	}

}
