package com.proyectApp.robosApp.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.proyectApp.robosApp.dto.LoginGoogleRequest;
import com.proyectApp.robosApp.dto.SesionResponse;
import com.proyectApp.robosApp.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;

	@PostMapping("/google")
	public SesionResponse loginConGoogle(@Valid @RequestBody LoginGoogleRequest request) {
		return authService.loginConGoogle(request.idToken());
	}

}
